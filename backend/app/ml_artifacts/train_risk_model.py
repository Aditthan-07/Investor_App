"""
Offline Model Training Script for FinSight AI
Trains an explainable RandomForestClassifier on financial risk profiles
and serializes the artifact to risk_model.joblib
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

def generate_training_dataset():
    """
    Generates a realistic synthetic dataset for Indian retail investor risk profiling.
    Features:
      - risk_tolerance: 1 (Low), 2 (Medium), 3 (High)
      - salary_level: 1 (< ₹4L), 2 (₹4L - ₹12L), 3 (> ₹12L)
      - debt_ratio_level: 0 (No debt), 1 (Manageable < 2x salary), 2 (Heavy > 2x salary)
    Target:
      - 0: Safe (Capital Preservation & Fixed Income)
      - 1: Moderate (Balanced Growth & Large/Mid Cap)
      - 2: Aggressive (High Growth Equities & Thematic)
    """
    np.random.seed(42)
    
    records = []
    # Exhaustive rules matrix covering combinations
    for risk in [1, 2, 3]:
        for salary in [1, 2, 3]:
            for debt in [0, 1, 2]:
                # Replicate each profile with slight noise for statistical stability
                for _ in range(25):
                    # Base target decision rules
                    if risk == 1:
                        target = 0
                    elif risk == 2:
                        if debt == 2 or salary == 1:
                            target = 0 if debt == 2 else 1
                        else:
                            target = 1
                    else:  # risk == 3 (High)
                        if debt == 2 and salary <= 2:
                            target = 1  # Safety guardrail: cannot be aggressive with high debt
                        elif salary == 1 and debt >= 1:
                            target = 1
                        else:
                            target = 2
                    
                    records.append({
                        "risk_tolerance": risk,
                        "salary_level": salary,
                        "debt_ratio_level": debt,
                        "investment_type": target
                    })
                    
    return pd.DataFrame(records)

def train_and_export():
    df = generate_training_dataset()
    X = df[["risk_tolerance", "salary_level", "debt_ratio_level"]]
    y = df["investment_type"]

    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=5,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X, y)

    y_pred = clf.predict(X)
    print("=== FinSight AI Model Training Report ===")
    print(classification_report(y, y_pred, target_names=["Safe", "Moderate", "Aggressive"]))
    print(f"Feature Importances: {dict(zip(X.columns, np.round(clf.feature_importances_, 3)))}")

    artifact_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(artifact_dir, "risk_model.joblib")
    
    metadata = {
        "model": clf,
        "feature_names": ["risk_tolerance", "salary_level", "debt_ratio_level"],
        "class_mapping": {0: "Safe", 1: "Moderate", 2: "Aggressive"},
        "version": "2.0.0"
    }
    
    joblib.dump(metadata, model_path)
    print(f"[SUCCESS] Model artifact saved to: {model_path}")

if __name__ == "__main__":
    train_and_export()
