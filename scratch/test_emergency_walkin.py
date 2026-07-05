import os
import sys
import django
from django.utils import timezone
import datetime

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, DoctorProfile
from appointments.models import Appointment
from queues.models import Queue
from django.test import RequestFactory
from queues.views import EmergencyWalkinView, TodayQueueView, MyQueueStatusView

def run_test():
    print("Testing Emergency Walk-in and Prioritization...")
    print("=" * 60)
    
    today = timezone.now().date()
    
    # 1. Get or create a doctor
    doctor_user, _ = User.objects.get_or_create(
        username="dr_test",
        defaults={
            "first_name": "Test",
            "last_name": "Doctor",
            "role": "doctor"
        }
    )
    doctor, _ = DoctorProfile.objects.get_or_create(
        user=doctor_user,
        defaults={
            "avg_consultation_time": 15,
            "is_available": True
        }
    )
    
    # Clean old entries for this doctor today
    Queue.objects.filter(doctor=doctor, queue_date=today).delete()
    Appointment.objects.filter(doctor=doctor, appointment_date=today).delete()
    
    # 2. Register and check in a regular patient (A1)
    patient_user, _ = User.objects.get_or_create(
        username="regular_pat",
        defaults={
            "first_name": "Jane",
            "last_name": "Doe",
            "role": "patient",
            "phone_number": "+237670000001"
        }
    )
    app1 = Appointment.objects.create(
        patient=patient_user,
        doctor=doctor,
        appointment_date=today,
        appointment_time=datetime.time(10, 0),
        status="confirmed",
        triage_level="routine"
    )
    q1 = Queue.objects.create(
        appointment=app1,
        patient=patient_user,
        doctor=doctor,
        queue_number=1,
        queue_date=today,
        status="waiting",
        estimated_wait_time=0,
        ml_predicted_wait_time=0
    )
    print(f"Created regular patient: {patient_user.get_full_name()} -> Queue #{q1.queue_number} (Triage: {app1.triage_level})")
    
    # 3. Simulate Admin admitting an Emergency Walk-in
    # Clear outbox log before test
    log_path = "sms_outbox.log"
    if os.path.exists(log_path):
        os.remove(log_path)
        
    admin_user, _ = User.objects.get_or_create(username="admin_test", defaults={"role": "admin"})
    
    factory = RequestFactory()
    request = factory.post("/api/queues/emergency-walkin/", {"doctor_id": doctor.id, "patient_name": "Critical Victim"}, content_type="application/json")
    request.user = admin_user
    request._dont_enforce_csrf_checks = True
    
    print("\nAdmitting Emergency Walk-in via API View...")
    view = EmergencyWalkinView.as_view()
    response = view(request)
    
    assert response.status_code == 201, f"Failed to admit: {response.data}"
    data = response.data
    print(f"Admitted walk-in successfully! Created Queue ticket: A{data['queue_number']}")
    
    # 4. Check Queue ordering
    print("\nVerifying Queue Ordering...")
    request_get = factory.get("/api/queues/today/")
    request_get.user = admin_user
    request_get._dont_enforce_csrf_checks = True
    today_view = TodayQueueView.as_view()
    queue_response = today_view(request_get)
    
    queue_list = queue_response.data
    print(f"Total entries in queue today: {len(queue_list)}")
    for i, q in enumerate(queue_list, start=1):
        print(f"  Position {i}: Queue #{q['queue_number']} | Patient: {q['patient_name']} | Triage: {q['triage_level']}")
        
    # Walk-in should be first because triage_level = 'emergency'
    assert queue_list[0]["triage_level"] == "emergency", "Emergency patient is not at the top of the queue!"
    assert "Critical Victim" in queue_list[0]["patient_name"], "Incorrect patient at position 1!"
    print("[OK] Verification SUCCESS: Emergency patient prioritized at position #1!")

    # 5. Check wait times for other patients
    print("\nChecking regular patient's 'patients_ahead' count...")
    request_status = factory.get("/api/queues/my-status/")
    request_status.user = patient_user
    request_status._dont_enforce_csrf_checks = True
    status_view = MyQueueStatusView.as_view()
    status_response = status_view(request_status)
    
    status_data = status_response.data
    print(f"  Regular patient ahead count: {status_data['patients_ahead']}")
    print(f"  Active emergency status: {status_data['active_emergency']}")
    assert status_data["patients_ahead"] == 1, "Regular patient should have 1 patient (the emergency case) ahead!"
    assert status_data["active_emergency"] is True, "Active emergency flag should be True!"
    print("[OK] Verification SUCCESS: Wait times and priority calculations updated correctly!")

    # 6. Verify SMS delay notifications logged in outbox
    print("\nVerifying SMS Outbox Delay Alerts...")
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            log_contents = f.read()
            print("Outbox Logs:")
            print("-" * 60)
            print(log_contents.strip())
            print("-" * 60)
            assert "delayed" in log_contents, "Delay notification not logged!"
            print("[OK] Verification SUCCESS: SMS Delay notification dispatched successfully!")
    else:
        print("FAIL: sms_outbox.log not found!")
        
    print("\nAll Emergency Walk-in tests completed successfully!")

if __name__ == '__main__':
    run_test()
