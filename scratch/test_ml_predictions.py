import os
import sys

# Add project root to python path so we can import django settings and apps
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from ml_model.predictor import predict_wait_time

print("Testing ML Wait Time Predictions (Random Forest):")
print("-" * 60)
print(f"{'Patients Ahead':<15} {'Time of Day':<12} {'Day of Week':<12} {'Doctor Type':<12} {'Avg Consult Time':<18} {'Predicted Wait':<15} {'Static Wait':<12}")
print("-" * 90)

scenarios = [
    (0, 9, 0, 0, 15), # 0 ahead, Mon 9am, general, avg 15m
    (1, 9, 0, 0, 15), # 1 ahead, Mon 9am, general, avg 15m
    (2, 9, 0, 0, 15), # 2 ahead, Mon 9am, general, avg 15m
    (3, 9, 0, 0, 15), # 3 ahead, Mon 9am, general, avg 15m
    (5, 14, 2, 1, 30), # 5 ahead, Wed 2pm, specialist, avg 30m
    (10, 16, 4, 1, 30), # 10 ahead, Fri 4pm, specialist, avg 30m
]

for patients_ahead, time_of_day, day_of_week, doctor_type, avg_consultation_time in scenarios:
    ml_pred = predict_wait_time(patients_ahead, time_of_day, day_of_week, doctor_type, avg_consultation_time)
    static_pred = patients_ahead * avg_consultation_time
    doc_type_str = "Specialist" if doctor_type == 1 else "General"
    print(f"{patients_ahead:<15} {time_of_day:<12} {day_of_week:<12} {doc_type_str:<12} {avg_consultation_time:<18} {ml_pred:<15} {static_pred:<12}")
