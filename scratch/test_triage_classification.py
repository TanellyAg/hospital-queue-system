import os
import sys
import django
from django.test import RequestFactory
import datetime
from django.utils import timezone

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, DoctorProfile
from appointments.models import Appointment
from appointments.views import BookAppointmentView

def run_test():
    print("Testing Symptom Triage Classifier...")
    print("=" * 60)

    # 1. Setup user and doctor
    patient_user, _ = User.objects.get_or_create(username="testpatient")
    doctor_profile = DoctorProfile.objects.first() # Get Dr. Nelly Dev or any seeded doctor
    
    if not doctor_profile:
        print("Fail: No doctor profile found in database.")
        return

    # 2. Test booking a routine case
    factory = RequestFactory()
    routine_data = {
        "doctor": doctor_profile.id,
        "appointment_date": str(timezone.now().date()),
        "appointment_time": "14:00",
        "symptoms": "Just coming in for my periodic routine general checkup, mild flu."
    }
    request = factory.post("/api/appointments/book/", routine_data, content_type="application/json")
    request.user = patient_user
    request._dont_enforce_csrf_checks = True
    
    view = BookAppointmentView.as_view()
    response = view(request)
    
    assert response.status_code == 201, f"Failed routine booking: {response.data}"
    routine_appt = Appointment.objects.get(id=response.data["id"])
    print(f"Routine Booking Symptoms: '{routine_data['symptoms']}'")
    print(f"Classified Triage Level  : {routine_appt.triage_level.upper()}")
    assert routine_appt.triage_level == "routine", "Routine symptoms incorrectly classified!"
    print("[OK] Routine classification verified!")
    print("-" * 60)

    # 3. Test booking an urgent case
    urgent_data = {
        "doctor": doctor_profile.id,
        "appointment_date": str(timezone.now().date()),
        "appointment_time": "14:30",
        "symptoms": "Experiencing severe chest pain and short of breath after climbing stairs."
    }
    request_urgent = factory.post("/api/appointments/book/", urgent_data, content_type="application/json")
    request_urgent.user = patient_user
    request_urgent._dont_enforce_csrf_checks = True
    
    response_urgent = view(request_urgent)
    assert response_urgent.status_code == 201, f"Failed urgent booking: {response_urgent.data}"
    urgent_appt = Appointment.objects.get(id=response_urgent.data["id"])
    print(f"Urgent Booking Symptoms : '{urgent_data['symptoms']}'")
    print(f"Classified Triage Level : {urgent_appt.triage_level.upper()}")
    assert urgent_appt.triage_level == "urgent", "Urgent symptoms incorrectly classified!"
    print("[OK] Urgent classification verified!")
    print("=" * 60)
    print("All Symptom Classifier tests completed successfully!")

if __name__ == '__main__':
    run_test()
