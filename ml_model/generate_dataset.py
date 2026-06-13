"""
Generates a synthetic hospital queue dataset for training the ML model.
Based on realistic patterns observed in Cameroonian outpatient settings.
This dataset simulates 2000 patient consultations with realistic patterns.
"""
import pandas as pd
import numpy as np
import os

#set random seed for reproducibility
np.random.seed(42)

NUM_RECORDS = 2000
def generate_dataset():
    # Day of week (0=Monday, 6=Sunday)
    # Hospitals busier on Monday and Friday
    day_of_week = np.random.choice(
        [0, 1, 2, 3, 4, 5],
        size=NUM_RECORDS,
        p=[0.25, 0.15, 0.15, 0.15, 0.20, 0.10]
    )

   # Time of day (hour: 7am to 5pm)
    # Mornings busier than afternoons
    hours = list(range(7, 18))  # 11 hours: 7am to 5pm
    probs = [0.15, 0.15, 0.12, 0.10, 0.08, 0.08, 0.08, 0.07, 0.07, 0.05, 0.05]
    probs = np.array(probs) / sum(probs)  # normalize so it sums exactly to 1

    time_of_day = np.random.choice(
        hours,
        size=NUM_RECORDS,
        p=probs
    )

    # doctor type (0=general, 1=specialist)
    # more general practioners than specialists
    doctor_type = np.random.choice([0, 1], size=NUM_RECORDS, p=[0.65, 0.35])

    # Patients ahead in queue (0 to 12) — realistic queue size
    patients_ahead = np.random.randint(0, 13, size=NUM_RECORDS)

    #Average historical consultation time (10 to 30 minutes)
    avg_consultation_time = np.where(
        doctor_type == 1,
        np.random.randint(20, 31, size=NUM_RECORDS),  #Specialists take longer
        np.random.randint(10, 21, size=NUM_RECORDS),  #General practitioners faster
    )

  # Generate realistic waiting time based on features
    # Base wait = patients ahead × avg consultation time
    base_wait = patients_ahead * avg_consultation_time

    # Morning rush adds extra time (7am-10am) — smaller effect
    morning_factor = np.where(time_of_day <= 10, 1.1, 1.0)

    # Monday and Friday are busier — smaller effect
    day_factor = np.where(
        (day_of_week == 0) | (day_of_week == 4), 1.1, 1.0
    )

    # Specialists add extra wait — smaller effect
    specialist_factor = np.where(doctor_type == 1, 1.05, 1.0)

    # Calculate final wait time with some random noise
    wait_time = (
        base_wait * morning_factor * day_factor * specialist_factor
        + np.random.normal(0, 5, size=NUM_RECORDS)  # Random noise ±5 mins
    ).clip(0, 120)  # Cap at 2 hours max — realistic

    # build the dataframe
    df = pd.DataFrame({
        'patients_ahead': patients_ahead,
        'time_of_day': time_of_day,
        'day_of_week': day_of_week,
        'doctor_type': doctor_type,
        'avg_consultation_time': avg_consultation_time,
        'wait_time_minutes': wait_time.astype(int)
    })

    # save to CVS
    output_path = os.path.join(os.path.dirname(__file__), 'data', 'hospital_queue_dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated: {NUM_RECORDS} records")
    print(f"Saved to: {output_path}")
    print(f"\nDataset preview:")
    print(df.head(10))
    print(f"\nDataset statistics:")
    print(df.describe())

    return df

if __name__ == '__main__':
    generate_dataset()