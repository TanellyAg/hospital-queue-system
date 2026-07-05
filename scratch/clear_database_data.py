import os
import sys
import django

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment
from queues.models import Queue, ConsultationLog

print("Clearing all appointments, queues, and logs from the database...")
print("=" * 60)

queue_count = Queue.objects.all().count()
appt_count = Appointment.objects.all().count()
log_count = ConsultationLog.objects.all().count()

Queue.objects.all().delete()
Appointment.objects.all().delete()
ConsultationLog.objects.all().delete()

print(f"Cleared {queue_count} queue entries.")
print(f"Cleared {appt_count} appointments.")
print(f"Cleared {log_count} consultation logs.")
print("=" * 60)
print("Database is now clean and ready for testing!")
