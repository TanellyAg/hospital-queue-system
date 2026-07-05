import os
import sys
import django

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from appointments.models import Appointment

appointments = Appointment.objects.all().select_related('patient', 'doctor__user')
print(f"Total appointments in database: {len(appointments)}")
for app in appointments:
    print(f"ID: {app.id} | Date: {app.appointment_date} | Time: {app.appointment_time} | Patient: {app.patient.username} | Doctor: {app.doctor.user.get_full_name()} | Status: {app.status}")
