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
        #Automatically set the patient to the logged-in user
        serializer.save(patient=self.request.user)


class PatientAppointmentsView(generics.ListAPIView):
    """Returns all appointments for the logged-in patient"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patuent=self.request.user)
    
class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or cancel a specific appointment"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)
    
class DoctorListView(generics.ListAPIView):
    """Returns list of all available doctors"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctors = DoctorProfile.objects.filter(is_available=True).select_related('user')
        data = [
            {
                'id': d.id,
                'name': d.user.get_full_name(),
                'doctor_type': d.doctor_type,
                'specialization': d.specialization,
                'avg_consultation_time': d.avg_consultation_time,
            }
            for d in doctors
        ]
        return Response(data)
    
class DoctorAvailabilityView(generics.ListAPIView):
    """Returns availability schedule for a specific doctor."""
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return DoctorAvailability.objects.filter(
            doctor_id=doctor_id,
            is_available=True
        )


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
    
