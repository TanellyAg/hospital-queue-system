"""
Loads the trained Random Forest model and provides prediction function.
This is called by the queues app when a patient joins the queue.
"""

import joblib
import os
import pandas as pd

# Load the trained model once when the server starts
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'random_forest_model.pkl')
model = joblib.load(MODEL_PATH)


def predict_wait_time(patients_ahead, time_of_day, day_of_week, doctor_type, avg_consultation_time):
    """
    Predicts waiting time in minutes using the trained Random Forest model.

    Args:
        patients_ahead: Number of patients ahead in queue
        time_of_day: Hour of day (0-23)
        day_of_week: Day of week (0=Monday, 6=Sunday)
        doctor_type: 0=general, 1=specialist
        avg_consultation_time: Doctor's average consultation time in minutes

    Returns:
        Predicted wait time in minutes (integer)
    """
    # Create a dataframe with the same column names used during training
    input_data = pd.DataFrame([{
        'patients_ahead': patients_ahead,
        'time_of_day': time_of_day,
        'day_of_week': day_of_week,
        'doctor_type': doctor_type,
        'avg_consultation_time': avg_consultation_time
    }])

    prediction = model.predict(input_data)[0]

    # Round to nearest minute, ensure non-negative
    return max(0, round(prediction))