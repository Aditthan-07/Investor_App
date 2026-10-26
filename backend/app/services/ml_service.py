import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from app.schemas.all_schemas import RecommendOut, StockRecommendation

# Static corporate metadata dictionary
TICKER_METADATA = {
    "HDFCBANK.NS": {"name": "HDFC Bank Ltd", "url": "https://www.hdfcbank.com", "groww": "https://groww.in/charts/stocks/hdfc-bank-ltd"},
    "ICICIBANK.NS": {"name": "ICICI Bank Ltd", "url": "https://www.icicibank.com", "groww": "https://groww.in/charts/stocks/icici-bank-ltd"},
    "KOTAKBANK.NS": {"name": "Kotak Mahindra Bank", "url": "https://www.kotak.com", "groww": "https://groww.in/charts/stocks/kotak-mahindra-bank-ltd"},
    "SBIN.NS": {"name": "State Bank of India", "url": "https://www.sbi.co.in", "groww": "https://groww.in/charts/stocks/state-bank-of-india"},
    "AXISBANK.NS": {"name": "Axis Bank Ltd", "url": "https://www.axisbank.com", "groww": "https://groww.in/charts/stocks/axis-bank-ltd"},
    "INFY.NS": {"name": "Infosys Ltd", "url": "https://www.infosys.com", "groww": "https://groww.in/charts/stocks/infosys-ltd"},
    "TCS.NS": {"name": "Tata Consultancy Services", "url": "https://www.tcs.com", "groww": "https://groww.in/charts/stocks/tata-consultancy-services-ltd"},
    "HCLTECH.NS": {"name": "HCL Technologies", "url": "https://www.hcltech.com", "groww": "https://groww.in/charts/stocks/hcl-technologies-ltd"},
    "LTIM.NS": {"name": "LTIMindtree Ltd", "url": "https://www.ltimindtree.com", "groww": "https://groww.in/charts/stocks/lt-finance-holdings-ltd"},
    "BAJFINANCE.NS": {"name": "Bajaj Finance Ltd", "url": "https://www.bajajfinserv.in", "groww": "https://groww.in/charts/stocks/bajaj-housing-finance-ltd"},
    "ADANIENT.NS": {"name": "Adani Enterprises", "url": "https://www.adanienterprises.com", "groww": "https://groww.in/charts/stocks/adani-enterprises-ltd"},
    "TATAMOTORS.NS": {"name": "Tata Motors Ltd", "url": "https://www.tatamotors.com", "groww": "https://groww.in/charts/stocks/tata-motors-ltd"},
    "BHARTIARTL.NS": {"name": "Bharti Airtel Ltd", "url": "https://www.airtel.in", "groww": "https://groww.in/charts/stocks/bharti-airtel-ltd"},
    "ONGC.NS": {"name": "Oil & Natural Gas Corp", "url": "https://www.ongcindia.com", "groww": "https://groww.in/charts/stocks/oil-natural-gas-corporation-ltd"},
    "RELIANCE.NS": {"name": "Reliance Industries", "url": "https://www.ril.com", "groww": "https://groww.in/charts/stocks/reliance-industries-ltd"},
    "ITC.NS": {"name": "ITC Ltd", "url": "https://www.itcportal.com", "groww": "https://groww.in/charts/stocks/itc-ltd"},
    "POWERGRID.NS": {"name": "Power Grid Corporation", "url": "https://www.powergrid.in", "groww": "https://groww.in/charts/stocks/power-grid-corporation-of-india-ltd"},
    "LT.NS": {"name": "Larsen & Toubro Ltd", "url": "https://www.larsentoubro.com", "groww": "https://groww.in/charts/stocks/larsen-toubro-ltd"},
    "TRENT.NS": {"name": "Trent Ltd", "url": "https://www.trentlimited.com", "groww": "https://groww.in/charts/stocks/trent-ltd"},
    "DIXON.NS": {"name": "Dixon Technologies Ltd", "url": "https://www.dixoninfo.com", "groww": "https://groww.in/charts/stocks/dixon-technologies-india-ltd"},
}

STOCK_BASKETS = {
    "Safe": ["HDFCBANK.NS", "ITC.NS", "TCS.NS", "RELIANCE.NS", "POWERGRID.NS"],
    "Moderate": ["INFY.NS", "ICICIBANK.NS", "LT.NS", "BHARTIARTL.NS", "TATAMOTORS.NS"],
    "Aggressive": ["ADANIENT.NS", "BAJFINANCE.NS", "TRENT.NS", "DIXON.NS", "BHARTIARTL.NS"],
}

ASSET_ALLOCATIONS = {
    "Safe": {
        "Large Cap Equities": 30.0,
        "Government Bonds & Debt": 40.0,
        "Sovereign Gold / Commodities": 15.0,
        "Liquid Emergency Buffer": 15.0
    },
    "Moderate": {
        "Large & Mid Cap Equities": 55.0,
        "Corporate Debt & Fixed Income": 25.0,
        "Sovereign Gold / Commodities": 10.0,
        "Liquid Emergency Buffer": 10.0
    },
    "Aggressive": {
        "High Growth Equities": 70.0,
        "Thematic & Mid-Caps": 15.0,
        "Sovereign Gold / Hedge": 10.0,
        "Liquid Cash Buffer": 5.0
    }
}

class MLService:
    def __init__(self):
        self.model = None
        self.feature_names = ["risk_tolerance", "salary_level", "debt_ratio_level"]
        self.load_model()

    def load_model(self):
        artifact_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_artifacts", "risk_model.joblib")
        if os.path.exists(artifact_path):
            try:
                data = joblib.load(artifact_path)
                self.model = data.get("model")
                self.feature_names = data.get("feature_names", self.feature_names)
            except Exception as e:
                print(f"[WARN] Failed to load risk_model.joblib: {e}")
                self.model = None

    def predict(
        self,
        risk_tolerance: str = "Medium",
        salary_inr: float = 600000.0,
        has_loan: bool = False,
        loan_amount: float = 0.0
    ) -> Tuple[str, float, Dict[str, float], str]:
        # Encode features
        risk_map = {"Low": 1, "Medium": 2, "High": 3}
        risk_code = risk_map.get(risk_tolerance.capitalize(), 2)

        # Salary tier: 1 (< 4L), 2 (4L-12L), 3 (> 12L)
        sal = max(0.0, float(salary_inr))
        sal_tier = 1 if sal < 400000 else (2 if sal < 1200000 else 3)

        # Debt level
        if not has_loan or loan_amount <= 0:
            debt_tier = 0
        elif sal > 0 and loan_amount > (sal * 2):
            debt_tier = 2
        else:
            debt_tier = 1

        feature_vector = pd.DataFrame(
            [[risk_code, sal_tier, debt_tier]],
            columns=self.feature_names
        )

        tier_labels = ["Safe", "Moderate", "Aggressive"]

        if self.model is not None:
            pred_idx = int(self.model.predict(feature_vector)[0])
            probas = self.model.predict_proba(feature_vector)[0]
            confidence = float(probas[pred_idx])
            importances = dict(zip(self.feature_names, [float(x) for x in self.model.feature_importances_]))
        else:
            # Deterministic heuristic fallback
            if risk_code == 1 or debt_tier == 2:
                pred_idx = 0
            elif risk_code == 2 or sal_tier == 1:
                pred_idx = 1
            else:
                pred_idx = 2
            confidence = 0.85
            importances = {"risk_tolerance": 0.50, "salary_level": 0.30, "debt_ratio_level": 0.20}

        # Apply Safety Guardrail: Low income with active debt cannot be Aggressive
        if sal_tier == 1 and debt_tier >= 1 and pred_idx == 2:
            pred_idx = 1

        predicted_tier = tier_labels[pred_idx]

        explanation = (
            f"Machine Learning model predicts a '{predicted_tier}' portfolio "
            f"with {confidence:.1%} confidence. Key decision drivers: "
            f"Risk Appetite ({importances.get('risk_tolerance', 0.5):.0%}), "
            f"Income Tier ({importances.get('salary_level', 0.3):.0%}), "
            f"Debt Exposure ({importances.get('debt_ratio_level', 0.2):.0%})."
        )

        return predicted_tier, confidence, importances, explanation

ml_service = MLService()
