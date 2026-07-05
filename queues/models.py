from django.db import models
from accounts.models import User, DoctorProfile
from appointments.models import Appointment


class Queue(models.Model):
    """Represents a pateinets position in the queue on a given day. Each patient gets a unique queue number per day"""

    STATUS_CHOICES = (
        ('waiting', 'Waiting'),   #patient waiting to be seen
        ('in_progress', 'In Progress'),   # Patient is currently with the doctor
        ('completed', 'Completed'),  #Patient has been seen
        ('skipped', 'Skipped'),      #patient has missed their turn
    )

    # The appointment this queue entry belons to
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='queue_entry'
    )

    # the patient in the queue
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )

    # the doctor this queue is for 
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='queue_entries'
    )

    #Auto-assignmend queue number 
    queue_number = models.IntegerField()

    # currrent status in the queue
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='waiting'
    )

    #Date this queue entry is for
    queue_date = models.DateField()

    #formula based estimated wait time in minutes (fallback)
    estimated_wait_time = models.IntegerField(default=0)

    #ML-predicted waitime in minutes (primary)
    ml_predicted_wait_time = models.IntegerField(null=True, blank=True)

    # actual time patient was caled in (for ML training data)
    actual_start_time = models.DateTimeField(null=True, blank=True)

    # actual time consultation ended (for ML training data)
    actual_end_time = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # order by queue number within each day
        ordering = ['queue_date', 'queue_number']
        # each patient can only have one queue entry per day
        unique_together = ['doctor', 'queue_date', 'queue_number']

    def __str__(self):
        return f"Queue #{self.queue_number} - {self.patient.get_full_name()} - {self.queue_date}"
    
    @property
    def display_wait_time(self):
         #Returns ML time if available, otherwise formula-based. This is what gets shown to the patient.
         if self.ml_predicted_wait_time is not None:
             return self.ml_predicted_wait_time
         return self.estimated_wait_time
    
class ConsultationLog(models.Model):
    #records actual consultation durations. this data is used to train and improve the ML waiting time model. the more data collected, the more accurate predictions become.

    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='consultation_logs'
    )

    # day of the week (0=monday, 6=sunday) - used as ML feature
    day_of_week = models.IntegerField()

    #hour of day (0-23) - used as ML feature
    time_of_day = models.IntegerField()

    #how many patients were ahead in queue - used as ML feature
    patient_ahead = models.IntegerField()

    # Actual consultation duration in minutes — this is what we predict
    actual_duration = models.IntegerField()

    #doctor type at the time of consultation - used as ML feature
    doctor_type = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr.{self.doctor.user.get_full_name()} - {self.actual_duration} mins on {self.day_of_week}"

