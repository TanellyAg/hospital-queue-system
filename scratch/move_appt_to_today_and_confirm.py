import os
import sys
import django
from django.utils import timezone
import datetime

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment

try:
    # Get the patient's pending appointment (ID 9)
    appt = Appointment.objects.get(id=9)
    
    # Update to today's date and set status to confirmed
    today = timezone.now().date()
    # Let's set it to a valid slot time, e.g. 09:00:00
    appt.appointment_date = today
    appt.appointment_time = datetime.time(9, 0)
    appt.status = 'confirmed'
    appt.save()
    
    print(f"Success! Appointment ID 9 updated to TODAY ({today}) at 09:00 and marked as CONFIRMED.")
except Appointment.DoesNotExist:
    print("Appointment ID 9 not found in database.")
