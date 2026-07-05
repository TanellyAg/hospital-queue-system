import os
import sys
import django
from django.utils import timezone

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment
from queues.models import Queue
from accounts.models import DoctorProfile, User

today = timezone.now().date()
print(f"Current Date: {today}")
print("=" * 60)

# Doctors
doctors = DoctorProfile.objects.all()
print(f"Doctors ({len(doctors)}):")
for doc in doctors:
    print(f" - ID: {doc.id} | Name: {doc.user.get_full_name()} | Avg Consult Time: {doc.avg_consultation_time} min | Speciality: {doc.specialization}")

# Today's appointments
appointments = Appointment.objects.filter(appointment_date=today)
print(f"\nToday's Appointments ({len(appointments)}):")
for app in appointments:
    print(f" - ID: {app.id} | Patient: {app.patient.get_full_name()} (ID: {app.patient.id}) | Doctor: {app.doctor.user.get_full_name()} (ID: {app.doctor.id}) | Time: {app.appointment_time} | Status: {app.status}")

# Today's queue
queues = Queue.objects.filter(queue_date=today)
print(f"\nToday's Queue Entries ({len(queues)}):")
for q in queues:
    print(f" - Queue #{q.queue_number} | ID: {q.id} | Patient: {q.patient.get_full_name()} (ID: {q.patient.id}) | Doctor: {q.doctor.user.get_full_name()} (ID: {q.doctor.id}) | Status: {q.status} | ML Est: {q.ml_predicted_wait_time} min | Static Est: {q.estimated_wait_time} min")
