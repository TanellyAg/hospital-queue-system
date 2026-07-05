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

def simulate():
    today = timezone.now().date()
    print(f"Simulating a busy clinic for date: {today}")

    # 1. Get doctor profile
    try:
        doctor = DoctorProfile.objects.get(id=1) # Dr. Nelly Dev
        print(f"Doctor found: Dr. {doctor.user.get_full_name()}")
    except DoctorProfile.DoesNotExist:
        print("Doctor with ID=1 (Dr. Nelly Dev) not found!")
        return

    # 2. Delete existing mock users/appointments/queues for today to have a clean slate
    mock_usernames = ['mock_patient_1', 'mock_patient_2', 'mock_patient_3']
    
    # Clean up old queue entries for these patients for today
    Queue.objects.filter(patient__username__in=mock_usernames, queue_date=today).delete()
    Appointment.objects.filter(patient__username__in=mock_usernames, appointment_date=today).delete()
    
    print("Cleaned up existing mock entries for today.")

    # 3. Create mock patient users if they don't exist
    mock_patients = []
    names = [("John", "Doe"), ("Alice", "Smith"), ("Bob", "Jones")]
    
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
            print(f"Created user: {username}")
        else:
            print(f"User exists: {username}")
        mock_patients.append(user)

    # 4. Create and check in mock patients
    times = [datetime.time(9, 0), datetime.time(9, 30), datetime.time(10, 0)]
    
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

    print("\nSimulation complete! There are now 3 patients waiting in the queue for Dr. Nelly Dev.")
    print("If you log in as a real patient, book an appointment for today with Dr. Nelly Dev, and check in:")
    print(" - Your Queue Position will be A4")
    print(" - Patients Ahead will be 3")
    print(" - You will see the ML Random Forest prediction compare side-by-side with the static formula!")

if __name__ == '__main__':
    simulate()
