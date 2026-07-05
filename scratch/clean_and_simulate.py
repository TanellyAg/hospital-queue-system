import os
import sys
import django
import datetime
from django.utils import timezone

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, DoctorProfile
from appointments.models import Appointment
from queues.models import Queue
from ml_model.predictor import predict_wait_time

def run():
    today = timezone.now().date()
    print(f"Cleaning and simulating active queue for today: {today}")

    # 1. Clear all queue entries and appointments for today
    Queue.objects.filter(queue_date=today).delete()
    Appointment.objects.filter(appointment_date=today).delete()
    print("Cleared all today's appointments and queue entries.")

    # 2. Get Doctor profile for Dr. Nelly Dev (username: Nene)
    try:
        doctor_user = User.objects.get(username="Nene")
        doctor = doctor_user.doctor_profile
        print(f"Target Doctor found: Dr. {doctor.user.get_full_name()} (Profile ID: {doctor.id})")
    except User.DoesNotExist:
        print("Doctor user 'Nene' not found!")
        return

    # 3. Create mock patient users if they don't exist
    mock_usernames = ['mock_patient_1', 'mock_patient_2', 'mock_patient_3']
    names = [("John", "Doe"), ("Alice", "Smith"), ("Bob", "Jones")]
    mock_patients = []
    
    for username, (first_name, last_name) in zip(mock_usernames, names):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': 'patient',
                'email': f"{username}@example.com"
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created patient user: {username}")
        else:
            print(f"Patient user exists: {username}")
        mock_patients.append(user)

    # 4. Create and check in mock patients
    times = [datetime.time(8, 0), datetime.time(8, 30), datetime.time(9, 0)]
    
    for idx, (patient, app_time) in enumerate(zip(mock_patients, times), start=1):
        # Create confirmed appointment
        app = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            appointment_date=today,
            appointment_time=app_time,
            status='confirmed',
            triage_level='routine',
            symptoms="General checkup simulation"
        )
        
        # Calculate static wait
        patients_ahead = idx - 1
        static_wait = patients_ahead * doctor.avg_consultation_time
        
        # Calculate ML prediction
        doctor_type_num = 1 if doctor.doctor_type == 'specialist' else 0
        ml_wait = predict_wait_time(
            patients_ahead=patients_ahead,
            time_of_day=app_time.hour,
            day_of_week=today.weekday(),
            doctor_type=doctor_type_num,
            avg_consultation_time=doctor.avg_consultation_time
        )
        
        # Create queue entry
        Queue.objects.create(
            appointment=app,
            patient=patient,
            doctor=doctor,
            queue_number=idx,
            queue_date=today,
            status='waiting',
            estimated_wait_time=static_wait,
            ml_predicted_wait_time=ml_wait
        )
        print(f"Checked in Patient #{idx}: {patient.get_full_name()} -> Queue Number A{idx} (Static: {static_wait}m, ML: {ml_wait}m)")

    # 5. Now, recreate and confirm the user's appointment (ID 9 was deleted, so we make a new confirmed one for testpatient)
    try:
        user_patient = User.objects.get(username="testpatient")
        user_app = Appointment.objects.create(
            patient=user_patient,
            doctor=doctor,
            appointment_date=today,
            appointment_time=datetime.time(9, 30),
            status='confirmed',
            triage_level='routine',
            symptoms="Booking validation test"
        )
        print(f"\nSuccessfully created and confirmed a new appointment for {user_patient.get_full_name()} for TODAY.")
        print("Ready for check-in!")
    except User.DoesNotExist:
        print("User 'testpatient' not found!")

if __name__ == '__main__':
    run()
