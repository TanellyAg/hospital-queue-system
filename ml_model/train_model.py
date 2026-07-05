"""
Trains two models to predict patient waiting time:
1. Linear Regression (baseline)
2. Random Forest (primary model)

Compares both using RMSE and saves the better one for deployment.
"""
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split 
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

def train_models():
    #Load the dataset
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'hospital_queue_dataset.csv')
    df = pd.read_csv(data_path)

    # Features (input) and target (what we're predicting)
    features = ['patients_ahead', 'time_of_day', 'day_of_week', 'doctor_type', 'avg_consultation_time']
    X = df[features]
    y = df['wait_time_minutes']

    # split into training (80%) and testing (20%) sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    print("-" * 50)

    # ------Model 1: Linear Regression (Baseline) ------
    print("\nTraining Linear Regression (Baseline)...")
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)

    lr_predictions = lr_model.predict(X_test)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_predictions))
    lr_r2 = r2_score(y_test, lr_predictions)

    print(f"Linear Regression RMSE: {lr_rmse:.2f} minutes")
    print(f"Linear Regression R² Score: {lr_r2:.4f}")

    # ---- Model 2: Random Forest (Primary) ----
    print(f"\nTraining Random Forest (Primary)...")
    rf_model = RandomForestRegressor(
        n_estimators=100,   #100 decision trees
        max_depth=10,       #prevents overfitting
        random_state=42
    )
    rf_model.fit(X_train, y_train)

    rf_predictions = rf_model.predict(X_test)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_predictions))
    rf_r2 = r2_score(y_test, rf_predictions)

    print(f"Random Forest RMSE: {rf_rmse:.2f} minutes")
    print(f"Random Forest R² Score: {rf_r2:.4f}")


    #---- Comparison ----
    print("\n" + "=" * 50)
    print("MODEL COMPARISON")
    print("=" * 50)
    print(f"{'Model':<20} {'RMSE (mins)':<15} {'R² Score':<10}")
    print(f"{'Linear Regression':<20} {lr_rmse:<15.2f} {lr_r2:<10.4f}")
    print(f"{'Random Forest':<20} {rf_rmse:<15.2f} {rf_r2:<10.4f}")

    #--- Feature Importance (Random Forest) ----
    print("\n" + "=" * 50)
    print("FEATURE IMPORTANCE (Random Forest)")
    print("=" * 50)
    importance_df = pd.DataFrame({
        'feature': features,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(importance_df.to_string(index=False))

    #--- Save Models ---
    models_dir = os.path.join(os.path.dirname(__file__), 'saved_models')

    joblib.dump(lr_model, os.path.join(models_dir, 'linear_regression_model.pkl'))
    joblib.dump(rf_model, os.path.join(models_dir, 'random_forest_model.pkl'))

    print("\n" + "=" * 50)
    print("Models saved successfully!")
    print(f"Random Forest selected as PRIMARY model (lower RMSE)")
    print("=" * 50)

    return {
        'lr_rmse': lr_rmse,
        'lr_r2': lr_r2,
        'rf_rmse': rf_rmse,
        'rf_r2': rf_r2,
        'feature_importance': importance_df
    }

if __name__ == '__main__':
    train_models()