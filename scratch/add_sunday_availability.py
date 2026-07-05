import os
import sys
import django
import datetime

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import DoctorProfile
from appointments.models import DoctorAvailability

print("Adding Sunday availability for all doctors...")
print("=" * 60)

doctors = DoctorProfile.objects.all()
added_count = 0

for doc in doctors:
    # Check if Sunday (day_of_week=6) availability already exists
    exists = DoctorAvailability.objects.filter(doctor=doc, day_of_week=6).exists()
    if not exists:
        DoctorAvailability.objects.create(
            doctor=doc,
            day_of_week=6, # Sunday
            start_time=datetime.time(8, 0),
            end_time=datetime.time(17, 0),
            is_available=True
        )
        print(f"Added Sunday availability for Dr. {doc.user.get_full_name()}")
        added_count += 1
    else:
        print(f"Dr. {doc.user.get_full_name()} already has Sunday availability.")

print("=" * 60)
print(f"Successfully added Sunday availability for {added_count} doctors!")
