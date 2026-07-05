import os
import sys
import django
import datetime

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, Hospital, DoctorProfile, PatientProfile
from appointments.models import DoctorAvailability

def seed():
    print("Seeding developer accounts in local database...")
    print("=" * 60)
    
    # 1. Create Hospital
    hospital, created = Hospital.objects.get_or_create(
        name="Holy Family Hospital",
        defaults={
            "address": "Holy Family Road, Buea",
            "phone_number": "+237670000000",
            "latitude": 4.15,
            "longitude": 9.24
        }
    )
    print(f"Hospital: {hospital.name} (Created: {created})")

    # Passwords for accounts
    password = "password123"

    # 2. Create Admin Account
    admin_user, created = User.objects.get_or_create(
        username="Nelly",
        defaults={
            "first_name": "Tati",
            "last_name": "Nelly",
            "email": "nelly@mediqueue.com",
            "phone_number": "+237670000002",
            "role": "admin",
            "hospital": hospital
        }
    )
    if created or admin_user.check_password(password) is False:
        admin_user.set_password(password)
        admin_user.save()
    print(f"Admin User: {admin_user.username} (Created: {created})")

    # 3. Create Doctor 1 (Nelly Dev)
    doc1_user, created = User.objects.get_or_create(
        username="Nene",
        defaults={
            "first_name": "Nelly",
            "last_name": "Dev",
            "email": "nene@mediqueue.com",
            "phone_number": "+237670000003",
            "role": "doctor",
            "hospital": hospital
        }
    )
    if created or doc1_user.check_password(password) is False:
        doc1_user.set_password(password)
        doc1_user.save()
    print(f"Doctor User 1: {doc1_user.username} (Created: {created})")

    doc1_profile, created = DoctorProfile.objects.get_or_create(
        user=doc1_user,
        defaults={
            "doctor_type": "general",
            "specialization": "General Medicine",
            "avg_consultation_time": 15,
            "is_available": True
        }
    )
    print(f"Doctor Profile 1: {doc1_profile} (Created: {created})")

    # 4. Create Doctor 2 (Simon Peter)
    doc2_user, created = User.objects.get_or_create(
        username="Peter",
        defaults={
            "first_name": "Simon",
            "last_name": "Peter",
            "email": "peter@mediqueue.com",
            "phone_number": "+237670000004",
            "role": "doctor",
            "hospital": hospital
        }
    )
    if created or doc2_user.check_password(password) is False:
        doc2_user.set_password(password)
        doc2_user.save()
    print(f"Doctor User 2: {doc2_user.username} (Created: {created})")

    doc2_profile, created = DoctorProfile.objects.get_or_create(
        user=doc2_user,
        defaults={
            "doctor_type": "specialist",
            "specialization": "Pediatrics",
            "avg_consultation_time": 15,
            "is_available": True
        }
    )
    print(f"Doctor Profile 2: {doc2_profile} (Created: {created})")

    # 5. Create Patient (John Doe)
    patient_user, created = User.objects.get_or_create(
        username="testpatient",
        defaults={
            "first_name": "John",
            "last_name": "Doe",
            "email": "patient@test.com",
            "phone_number": "+237670000001",
            "role": "patient"
        }
    )
    if created or patient_user.check_password(password) is False:
        patient_user.set_password(password)
        patient_user.save()
    print(f"Patient User: {patient_user.username} (Created: {created})")

    patient_profile, created = PatientProfile.objects.get_or_create(
        user=patient_user,
        defaults={
            "date_of_birth": datetime.date(1995, 8, 15),
            "gender": "male",
            "address": "Molyko, Buea"
        }
    )
    print(f"Patient Profile: {patient_profile} (Created: {created})")

    # 6. Create default availabilities (Mon-Fri 08:00 - 17:00)
    for doc_profile in [doc1_profile, doc2_profile]:
        existing_count = doc_profile.availability.count()
        if existing_count == 0:
            print(f"Creating Mon-Fri availabilities for Dr. {doc_profile.user.get_full_name()}...")
            for day in range(5):  # Mon-Fri
                DoctorAvailability.objects.create(
                    doctor=doc_profile,
                    day_of_week=day,
                    start_time=datetime.time(8, 0),
                    end_time=datetime.time(17, 0),
                    is_available=True
                )
    print("\nDatabase seeded successfully!")
    print("You can now log in using:")
    print(" - Patient  : Username: testpatient | Password: password123")
    print(" - Doctor 1 : Username: Nene        | Password: password123")
    print(" - Admin    : Username: Nelly       | Password: password123")
    print(" - Doctor 2 : Username: Peter       | Password: password123")

if __name__ == '__main__':
    seed()
