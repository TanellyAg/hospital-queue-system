from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Queue, ConsultationLog
from .serializers import QueueSerializer
from appointments.models import Appointment
from ml_model.predictor import predict_wait_time
from django.utils import timezone as tz
from notifications.sms import send_queue_number, send_turn_notification



def calculate_estimated_wait_time(doctor, queue_date, queue_number):
    """
    Formula-based waiting time estimation.
    Used as fallback when ML model is not available.
    Formula: patients ahead × doctor's average consultation time
    """
    patients_ahead = queue_number - 1
    avg_time = doctor.avg_consultation_time
    return patients_ahead * avg_time


def assign_queue_number(doctor, queue_date):
    """
    Assigns the next available queue number for a doctor on a given date.
    """
    last_queue = Queue.objects.filter(
        doctor=doctor,
        queue_date=queue_date
    ).order_by('queue_number').last()

    if last_queue:
        return last_queue.queue_number + 1
    return 1


class JoinQueueView(APIView):
    """
    Patient joins the queue after their appointment is confirmed.
    Automatically assigns queue number and estimates wait time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get('appointment_id')

        try:
            appointment = Appointment.objects.get(
                id=appointment_id,
                patient=request.user,
                status='confirmed'
            )
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Confirmed appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if patient is already in the queue
        if Queue.objects.filter(appointment=appointment).exists():
            return Response(
                {'error': 'You are already in the queue for this appointment.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Assign queue number
        queue_number = assign_queue_number(
            appointment.doctor,
            appointment.appointment_date
        )

        # Calculate formula-based wait time
        estimated_wait = calculate_estimated_wait_time(
            appointment.doctor,
            appointment.appointment_date,
            queue_number
        )

        # Create queue entry
        queue_entry = Queue.objects.create(
            appointment=appointment,
            patient=request.user,
            doctor=appointment.doctor,
            queue_number=queue_number,
            queue_date=appointment.appointment_date,
            estimated_wait_time=estimated_wait
        )

        # Get ML prediction for wait time
        now = tz.now()
        doctor_type_num = 1 if appointment.doctor.doctor_type == 'specialist' else 0

        ml_wait = predict_wait_time(
            patients_ahead=queue_number - 1,
            time_of_day=now.hour,
            day_of_week=appointment.appointment_date.weekday(),
            doctor_type=doctor_type_num,
            avg_consultation_time=appointment.doctor.avg_consultation_time
        )

        queue_entry.ml_predicted_wait_time = ml_wait
        queue_entry.save()

        # Send SMS with queue number to patient
        if request.user.phone_number:
            send_queue_number(request.user, queue_entry)

        return Response(
            QueueSerializer(queue_entry).data,
            status=status.HTTP_201_CREATED
        )


class MyQueueStatusView(APIView):
    """Patient checks their current queue position and wait time."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        queue_entry = Queue.objects.filter(
            patient=request.user,
            queue_date=today,
            status='waiting'
        ).first()

        if not queue_entry:
            return Response(
                {'message': 'You are not currently in any queue today.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Count how many patients are ahead
        patients_ahead = Queue.objects.filter(
            doctor=queue_entry.doctor,
            queue_date=today,
            queue_number__lt=queue_entry.queue_number,
            status='waiting'
        ).count()

        data = QueueSerializer(queue_entry).data
        data['patients_ahead'] = patients_ahead

        return Response(data)


class TodayQueueView(APIView):
    """
    Admin/staff view — shows full queue for today.
    Ordered by triage level (urgent first) then queue number.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {'error': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()
        queue = Queue.objects.filter(
            queue_date=today
        ).select_related(
            'patient', 'doctor__user', 'appointment'
        ).order_by(
            'appointment__triage_level',
            'queue_number'
        )

        return Response(QueueSerializer(queue, many=True).data)


class UpdateQueueStatusView(APIView):
    """
    Admin/staff updates a patient's queue status.
    Records actual times for ML training data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {'error': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            queue_entry = Queue.objects.get(pk=pk)
        except Queue.DoesNotExist:
            return Response(
                {'error': 'Queue entry not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get('status')

        if new_status == 'in_progress':
            # Record when consultation started
            queue_entry.actual_start_time = timezone.now()

            # Notify patient it's their turn
            if queue_entry.patient.phone_number:
                send_turn_notification(queue_entry.patient, queue_entry)

        elif new_status == 'completed':
            # Record when consultation ended
            queue_entry.actual_end_time = timezone.now()

            # Save consultation log for ML training
            if queue_entry.actual_start_time:
                duration = int(
                    (queue_entry.actual_end_time - queue_entry.actual_start_time)
                    .total_seconds() / 60
                )
                ConsultationLog.objects.create(
                    doctor=queue_entry.doctor,
                    day_of_week=queue_entry.queue_date.weekday(),
                    time_of_day=queue_entry.actual_start_time.hour,
                    patients_ahead=queue_entry.queue_number - 1,
                    actual_duration=duration,
                    doctor_type=queue_entry.doctor.doctor_type
                )

        queue_entry.status = new_status
        queue_entry.save()

        return Response(QueueSerializer(queue_entry).data)