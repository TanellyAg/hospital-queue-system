from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Case, When, Value, IntegerField
from accounts.models import User, DoctorProfile
from .models import Queue, ConsultationLog
from .serializers import QueueSerializer
from appointments.models import Appointment
from ml_model.predictor import predict_wait_time
from django.utils import timezone as tz
from notifications.sms import send_queue_number, send_turn_notification, send_sms



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

        # Count how many patients are ahead based on priority (emergency -> urgent -> routine) and queue number
        waiting_entries = Queue.objects.filter(
            doctor=queue_entry.doctor,
            queue_date=today,
            status='waiting'
        ).select_related('appointment')

        def get_priority(entry):
            level = entry.appointment.triage_level
            if level == 'emergency':
                return 1
            if level == 'urgent':
                return 2
            return 3

        my_priority = get_priority(queue_entry)
        patients_ahead = 0
        for entry in waiting_entries:
            if entry.id == queue_entry.id:
                continue
            entry_priority = get_priority(entry)
            if entry_priority < my_priority:
                patients_ahead += 1
            elif entry_priority == my_priority and entry.queue_number < queue_entry.queue_number:
                patients_ahead += 1

        # Check if there is an active emergency in progress for this doctor today
        active_emergency = Queue.objects.filter(
            doctor=queue_entry.doctor,
            queue_date=today,
            status__in=['waiting', 'in_progress'],
            appointment__triage_level='emergency'
        ).exists()

        # Calculate dynamic wait times based on the actual live patients_ahead count
        avg_time = queue_entry.doctor.avg_consultation_time
        dynamic_static_wait = patients_ahead * avg_time
        
        # Calculate dynamic ML predicted wait time
        doctor_type_num = 1 if queue_entry.doctor.doctor_type == 'specialist' else 0
        current_hour = timezone.now().time().hour
        day_of_week = today.weekday()
        
        dynamic_ml_predicted_wait = predict_wait_time(
            patients_ahead=patients_ahead,
            time_of_day=current_hour,
            day_of_week=day_of_week,
            doctor_type=doctor_type_num,
            avg_consultation_time=avg_time
        )

        data = QueueSerializer(queue_entry).data
        data['patients_ahead'] = patients_ahead
        data['active_emergency'] = active_emergency
        
        # Dynamic overrides
        data['estimated_wait_time'] = dynamic_static_wait
        data['ml_predicted_wait_time'] = dynamic_ml_predicted_wait
        data['display_wait_time'] = dynamic_ml_predicted_wait if dynamic_ml_predicted_wait is not None else dynamic_static_wait

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
        ).annotate(
            triage_priority=Case(
                When(appointment__triage_level='emergency', then=Value(1)),
                When(appointment__triage_level='urgent', then=Value(2)),
                When(appointment__triage_level='routine', then=Value(3)),
                default=Value(4),
                output_field=IntegerField()
            )
        ).order_by(
            'triage_priority',
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
                    patient_ahead=queue_entry.queue_number - 1,
                    actual_duration=duration,
                    doctor_type=queue_entry.doctor.doctor_type
                )

        queue_entry.status = new_status
        queue_entry.save()

        return Response(QueueSerializer(queue_entry).data)


class EmergencyWalkinView(APIView):
    """
    Admin logs an emergency walk-in patient.
    Automatically registers a placeholder user, creates a confirmed appointment,
    inserts them at the top of the queue (priority 1), and alerts other patients of the delay.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['admin', 'doctor']:
            return Response(
                {'error': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        doctor_id = request.data.get('doctor_id')
        patient_name = request.data.get('patient_name', 'Accident Victim').strip()
        if not patient_name:
            patient_name = 'Accident Victim'

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 1. Automatically create a placeholder user account
        import uuid
        username = f"emergency_{uuid.uuid4().hex[:10]}"
        user = User.objects.create(
            username=username,
            first_name=patient_name,
            last_name="(Emergency Walk-in)",
            role='patient'
        )
        user.set_password(uuid.uuid4().hex)
        user.save()

        # 2. Create confirmed Appointment for today
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        appointment = Appointment.objects.create(
            patient=user,
            doctor=doctor,
            appointment_date=today,
            appointment_time=current_time,
            status='confirmed',
            triage_level='emergency',
            symptoms="Emergency walk-in triage admission."
        )

        # 3. Get next queue number
        queue_number = assign_queue_number(doctor, today)

        # 4. Create Queue Entry (Wait is 0 since they go first)
        queue_entry = Queue.objects.create(
            appointment=appointment,
            patient=user,
            doctor=doctor,
            queue_number=queue_number,
            queue_date=today,
            status='waiting',
            estimated_wait_time=0,
            ml_predicted_wait_time=0
        )

        # 5. Send SMS Delay Notifications to other patients currently waiting for this doctor today
        other_waiting = Queue.objects.filter(
            doctor=doctor,
            queue_date=today,
            status='waiting'
        ).exclude(id=queue_entry.id).select_related('patient')

        doctor_name = doctor.user.get_full_name()
        alert_msg = (
            f"MediQueue Alert: An emergency case has been admitted. "
            f"Your consultation with Dr. {doctor_name} has been delayed. "
            f"Thank you for your patience."
        )

        for entry in other_waiting:
            if entry.patient.phone_number:
                send_sms(entry.patient.phone_number, alert_msg)

        return Response(
            QueueSerializer(queue_entry).data,
            status=status.HTTP_201_CREATED
        )