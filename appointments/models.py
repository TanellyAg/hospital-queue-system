from django.db import models
from accounts.models import User, DoctorProfile

class Appointment(models.Model): 
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    TRIAGE_CHOICES = (
        ('urgent', 'Urgent'),
        ('routine', 'Routine'),
    )

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    triage_level = models.CharField(max_length=20, choices=TRIAGE_CHOICES, default='routine')
    symptoms = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']

    def __str__(self):
        return f"{self.patient.get_full_name()} → Dr.{self.doctor.useer.get_full_name()} on {self.appointment_date} at {self.appointment_time}"
    
class DoctorAvailability(models.Model):
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time =  models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        #a doctor can only have one schedeule entry per day
        unique_together = ['doctor', 'day_of_week']
        
        def __str__(self):
            return f"Dr.{self.doctor.user.get_full_name()} - {self.get_day_of_week_display()}"


