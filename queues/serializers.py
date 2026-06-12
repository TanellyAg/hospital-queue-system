from rest_framework import serializers
from .models import Queue, ConsultationLog

class QueueSerializer(serializers.ModelSerializer):
    """serializer for queue entries - what patients and staff see"""

    #show patient name instead of just ID
    patient_name = serializers.CharField(
        source='patient.get_full_name',
        read_only = True
    )
    #show doctor name instead of just ID
    doctor_name = serializers.CharField(
        source='doctor.user.get_full_name',
        read_only=True
    )
    # Show triage level from the linked appointment
    triage_level = serializers.CharField(
        source='appointment.triage_level',
        read_only=True
    )
    # The wait time shown to patient (ML if available, else formula)
    display_wait_time = serializers.IntegerField(read_only=True)

    class Meta:
        model = Queue
        fields = [
            'id', 'queue_number', 'patient', 'patient_name',
            'doctor', 'doctor_name', 'triage_level',
            'status', 'queue_date', 'estimated_wait_time',
            'ml_predicted_wait_time', 'display_wait_time',
            'created_at'
        ]
        read_only_fields = [
            'queue_number', 'estimated_wait_time',
            'ml_predicted_wait_time', 'created_at'
        ]