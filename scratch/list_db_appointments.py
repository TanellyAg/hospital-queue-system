import os
import sys
import django

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment

def list_appointments():
    print("Listing All Database Appointments...")
    print("=" * 70)
    appts = Appointment.objects.all().order_by('-created_at')
    if not appts.exists():
        print("No appointments found in the database.")
        return

    for app in appts:
        print(f"ID: {app.id} | Date: {app.appointment_date} | Time: {app.appointment_time} | Patient: {app.patient.username} | Doctor: {app.doctor.user.get_full_name()} | Status: {app.status} | Triage: {app.triage_level}")
    print("=" * 70)

if __name__ == '__main__':
    list_appointments()
