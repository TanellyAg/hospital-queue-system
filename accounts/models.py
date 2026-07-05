from django.contrib.auth.models import AbstractUser
from django.db import models


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    latitude = models.FloatField(default=4.15)  # Default coordinates near Buea
    longitude = models.FloatField(default=9.24)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class DoctorProfile(models.Model):
    DOCTOR_TYPE_CHOICES = (
        ('general', 'General Practitioner'),
        ('specialist', 'Specialist'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_type = models.CharField(max_length=20, choices=DOCTOR_TYPE_CHOICES, default='general')
    specialization = models.CharField(max_length=100, blank=True, null=True)
    avg_consultation_time = models.IntegerField(default=15, help_text="Average time in minutes")
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.doctor_type}"


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Patient: {self.user.get_full_name()}"