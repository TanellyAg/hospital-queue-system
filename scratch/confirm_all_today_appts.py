import os
import sys
import django
from django.utils import timezone

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment

today = timezone.now().date()
pending_appts = Appointment.objects.filter(appointment_date=today, status='pending')

print(f"Checking pending appointments for today ({today})...")
if pending_appts.exists():
    count = pending_appts.count()
    pending_appts.update(status='confirmed')
    print(f"Successfully confirmed {count} pending appointments!")
else:
    print("No pending appointments found for today.")
