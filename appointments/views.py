from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Appointment, DoctorAvailability
from .serializers import(
    AppointmentSerializer,
    BookAppointmentSerializer,
    DoctorAvailabilitySerializer
)
from accounts.models import DoctorProfile


class BookAppointmentView(generics.CreateAPIView):
    """Patient books a new appointment"""
    serializer_class = BookAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the patient to the logged-in user
        symptoms_text = self.request.data.get('symptoms', '').lower()
        urgent_keywords = [
            'chest pain', 'breathing', 'shortness of breath', 'bleeding', 
            'unconscious', 'fracture', 'broken', 'seizure', 'convulsion',
            'severe', 'heart', 'stroke', 'paralysis', 'urgent', 'accident'
        ]
        
        triage_level = 'routine'
        for keyword in urgent_keywords:
            if keyword in symptoms_text:
                triage_level = 'urgent'
                break
                
        serializer.save(patient=self.request.user, triage_level=triage_level)


class PatientAppointmentsView(generics.ListAPIView):
    """Returns all appointments for the logged-in patient"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)
    
class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or cancel a specific appointment"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)
    
class DoctorListView(generics.ListAPIView):
    """Returns list of all available doctors who belong to a registered hospital"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctors = DoctorProfile.objects.filter(
            is_available=True,
            user__hospital__isnull=False
        ).select_related('user', 'user__hospital')
        data = [
            {
                'id': d.id,
                'name': d.user.get_full_name(),
                'doctor_type': d.doctor_type,
                'specialization': d.specialization,
                'avg_consultation_time': d.avg_consultation_time,
                'hospital_id': d.user.hospital.id,
                'hospital_name': d.user.hospital.name,
                'hospital_address': d.user.hospital.address,
                'hospital_lat': d.user.hospital.latitude,
                'hospital_lng': d.user.hospital.longitude,
            }
            for d in doctors
        ]
        return Response(data)
    
class DoctorAvailabilityView(generics.ListAPIView):
    """Returns availability schedule and booked slots for a specific doctor."""
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return DoctorAvailability.objects.filter(
            doctor_id=doctor_id,
            is_available=True
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        date_str = request.query_params.get('date', None)
        booked_slots = []
        if date_str:
            from appointments.models import Appointment
            appointments = Appointment.objects.filter(
                doctor_id=self.kwargs['doctor_id'],
                appointment_date=date_str,
                status__in=['pending', 'confirmed']
            )
            booked_slots = [app.appointment_time.strftime("%H:%M") for app in appointments]

        return Response({
            'schedule': serializer.data,
            'booked_slots': booked_slots
        })


class AdminAppointmentsView(generics.ListAPIView):
    """Admin view - returns all appointments across all patients."""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admin users can access this
        if self.request.user.role != 'admin':
            return Appointment.objects.none()
        return Appointment.objects.all().select_related('patient', 'doctor__user')


class UpdateAppointmentStatusView(APIView):
    """Admin updates appointment status (confirm, complete, cancel)."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can update appointment status'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            appointment = Appointment.objects.get(pk=pk)
            new_status = request.data.get('status')
            if new_status in ['pending', 'confirmed', 'cancelled', 'completed']:
                appointment.status = new_status
                appointment.save()
                return Response(AppointmentSerializer(appointment).data)
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class UpdateDoctorStatusView(APIView):
    """Admin toggles a doctor's active status (is_available)."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can toggle doctor status'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            doctor = DoctorProfile.objects.get(pk=pk)
            is_available = request.data.get('is_available')
            if is_available is not None:
                doctor.is_available = bool(is_available)
                doctor.save()
                return Response({
                    'id': doctor.id,
                    'is_available': doctor.is_available,
                    'doctor_name': doctor.user.get_full_name()
                })
            return Response(
                {'error': 'is_available parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class UpdateDoctorAvailabilityView(APIView):
    """Admin toggles a doctor's day schedule availability."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can update availability schedules'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            availability = DoctorAvailability.objects.get(pk=pk)
            is_available = request.data.get('is_available')
            if is_available is not None:
                availability.is_available = bool(is_available)
                availability.save()
                return Response({
                    'id': availability.id,
                    'day_of_week': availability.day_of_week,
                    'is_available': availability.is_available
                })
            return Response(
                {'error': 'is_available parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except DoctorAvailability.DoesNotExist:
            return Response(
                {'error': 'Availability slot not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
