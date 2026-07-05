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
from queues.models import Queue, ConsultationLog
from django.test import RequestFactory
from queues.views import UpdateQueueStatusView

def run_test():
    print("Testing Queue Status Transitions and Log Writing...")
    print("=" * 60)

    today = timezone.now().date()
    patient_user, _ = User.objects.get_or_create(username="testpatient")
    doctor_profile = DoctorProfile.objects.first()
    
    if not doctor_profile:
        print("Fail: No doctor profile found in database.")
        return

    # Clean previous records
    Queue.objects.all().delete()
    Appointment.objects.all().delete()
    ConsultationLog.objects.all().delete()

    # 1. Create a dummy appointment and queue entry
    appt = Appointment.objects.create(
        patient=patient_user,
        doctor=doctor_profile,
        appointment_date=today,
        appointment_time=datetime.time(10, 0),
        status="confirmed",
        triage_level="routine"
    )
    queue_entry = Queue.objects.create(
        appointment=appt,
        patient=patient_user,
        doctor=doctor_profile,
        queue_number=1,
        queue_date=today,
        status="waiting"
    )
    print(f"Created queue entry #{queue_entry.id} with status 'waiting'.")

    # Setup RequestFactory
    admin_user, _ = User.objects.get_or_create(username="admin_test", defaults={"role": "admin"})
    factory = RequestFactory()
    view = UpdateQueueStatusView.as_view()

    # 2. Update to 'in_progress'
    print("Transitioning status to 'in_progress'...")
    request_ip = factory.patch(f"/api/queues/{queue_entry.id}/status/", {"status": "in_progress"}, content_type="application/json")
    request_ip.user = admin_user
    request_ip._dont_enforce_csrf_checks = True
    
    res_ip = view(request_ip, pk=queue_entry.id)
    assert res_ip.status_code == 200, f"Failed transition to in_progress: {res_ip.data}"
    
    # Reload and check start time
    queue_entry.refresh_from_db()
    assert queue_entry.status == "in_progress", "Status was not updated to in_progress!"
    assert queue_entry.actual_start_time is not None, "actual_start_time was not recorded!"
    print("[OK] Transitioned to 'in_progress' and actual_start_time recorded.")

    # 3. Update to 'completed'
    print("\nTransitioning status to 'completed'...")
    # Sleep slightly or manually offset actual_start_time to simulate 10 minutes duration
    queue_entry.actual_start_time = timezone.now() - datetime.timedelta(minutes=10)
    queue_entry.save()

    request_comp = factory.patch(f"/api/queues/{queue_entry.id}/status/", {"status": "completed"}, content_type="application/json")
    request_comp.user = admin_user
    request_comp._dont_enforce_csrf_checks = True

    res_comp = view(request_comp, pk=queue_entry.id)
    assert res_comp.status_code == 200, f"Failed transition to completed: {res_comp.data}"
    
    queue_entry.refresh_from_db()
    assert queue_entry.status == "completed", "Status was not updated to completed!"
    assert queue_entry.actual_end_time is not None, "actual_end_time was not recorded!"
    print("[OK] Transitioned to 'completed' and actual_end_time recorded.")

    # 4. Check that ConsultationLog was written
    log = ConsultationLog.objects.filter(doctor=doctor_profile).first()
    assert log is not None, "ConsultationLog was not created!"
    print(f"\n[OK] ConsultationLog successfully created:")
    print(f"  Doctor         : Dr. {log.doctor.user.get_full_name()}")
    print(f"  Day of Week    : {log.day_of_week}")
    print(f"  Time of Day    : {log.time_of_day}")
    print(f"  Patient Ahead  : {log.patient_ahead}")
    print(f"  Actual Duration: {log.actual_duration} mins")
    
    print("=" * 60)
    print("All status transition tests passed successfully!")

if __name__ == '__main__':
    run_test()
