from rest_framework import serializers
from .models import Appointment, DoctorAvailability
from accounts.models import DoctorProfile, User


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    # Shows the day name (e.g. "Monday") instead of the number
    day_of_week_display = serializers.CharField(
        source='get_day_of_week_display',
        read_only=True
    )

    class Meta:
        model = DoctorAvailability
        fields = [
            'id', 'doctor', 'day_of_week',
            'day_of_week_display', 'start_time',
            'end_time', 'is_available'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    # Show patient's full name in responses (read only)
    patient_name = serializers.CharField(
        source='patient.get_full_name',
        read_only=True
    )
    # Show doctor's full name in responses (read only)
    doctor_name = serializers.CharField(
        source='doctor.user.get_full_name',
        read_only=True
    )
    # Show doctor type (general / specialist) in responses
    doctor_type = serializers.CharField(
        source='doctor.doctor_type',
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name',
            'doctor', 'doctor_name', 'doctor_type',
            'appointment_date', 'appointment_time',
            'status', 'triage_level', 'symptoms',
            'notes', 'created_at', 'updated_at'
        ]
        # Patient is set automatically from the logged-in user
        read_only_fields = ['patient', 'triage_level', 'created_at', 'updated_at']


class BookAppointmentSerializer(serializers.ModelSerializer):
    """
    Used specifically for booking a new appointment.
    Simpler than the full serializer — only needs doctor, date, time, symptoms.
    """

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'appointment_date', 'appointment_time', 'symptoms']

    def validate(self, attrs):
        doctor = attrs['doctor']
        appointment_date = attrs['appointment_date']
        appointment_time = attrs['appointment_time']

        # Check if doctor is available on that day of the week
        day_of_week = appointment_date.weekday()  # 0=Monday, 6=Sunday
        availability = DoctorAvailability.objects.filter(
            doctor=doctor,
            day_of_week=day_of_week,
            is_available=True
        ).first()

        if not availability:
            raise serializers.ValidationError(
                "This doctor is not available on the selected day."
            )

        # Check if the time is within the doctor's working hours
        if not (availability.start_time <= appointment_time <= availability.end_time):
            raise serializers.ValidationError(
                f"Please book between {availability.start_time} and {availability.end_time}."
            )

        # Check if the slot is already taken
        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=['pending', 'confirmed']
        ).exists()

        if existing:
            raise serializers.ValidationError(
                "This time slot is already booked. Please choose another time."
            )

        return attrs