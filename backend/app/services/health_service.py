from typing import Tuple, List, Dict
from app.schemas.all_schemas import HealthEvaluationOut, RadarMetric

class HealthService:
    @staticmethod
    def evaluate(
        salary_inr: float,
        credit_score: int,
        has_loan: bool,
        loan_amount: float,
        emergency_fund: bool
    ) -> HealthEvaluationOut:
        sal = max(0.0, float(salary_inr))
        credit = max(300, min(900, int(credit_score)))
        loan_amt = max(0.0, float(loan_amount)) if has_loan else 0.0

        # Salary scoring (0 to 2)
        if sal < 300000:
            salary_score = 0
        elif sal < 800000:
            salary_score = 1
        else:
            salary_score = 2

        # Credit scoring (0 to 2)
        if credit < 600:
            credit_score_val = 0
        elif credit < 750:
            credit_score_val = 1
        else:
            credit_score_val = 2

        # Debt scoring (0 to 2)
        if not has_loan or loan_amt == 0:
            debt_score = 2
        elif sal == 0:
            debt_score = 0
        else:
            debt_ratio = loan_amt / sal
            if debt_ratio > 4.0:
                debt_score = 0
            elif debt_ratio > 1.5:
                debt_score = 1
            else:
                debt_score = 2

        # Emergency fund (0 or 1)
        emergency_score = 1 if emergency_fund else 0

        # Total composite score (0 to 7)
        total_score = salary_score + credit_score_val + debt_score + emergency_score

        if total_score <= 3:
            health_tier = "Poor"
            is_locked = True
            msg = (
                "Financial health: Poor. High vulnerability detected. "
                "Immediate priority: Establish a 3-month emergency fund and amortize high-interest debt "
                "before taking equity market exposure."
            )
        elif total_score <= 5:
            health_tier = "Fair"
            is_locked = False
            msg = (
                "Financial health: Fair. Core foundations in place. "
                "Stick to balanced, conservative hybrid instruments and sovereign gold buffers."
            )
        else:
            health_tier = "Good"
            is_locked = False
            msg = (
                "Financial health: Good. Strong solvency and liquidity profile. "
                "You are ready for structured, multi-cap equity allocations."
            )

        # Calculate dynamic radar polygon vertices (0 to 100)
        # 1. Solvency: salary tier
        solvency_pct = min(100.0, (sal / 1500000.0) * 100.0) if sal > 0 else 10.0
        
        # 2. Liquidity: emergency reserves
        liquidity_pct = 95.0 if emergency_fund else 20.0
        
        # 3. Debt Safety: inverse of debt load
        if not has_loan or loan_amt == 0:
            debt_safety_pct = 100.0
        elif sal == 0:
            debt_safety_pct = 10.0
        else:
            debt_safety_pct = max(10.0, min(100.0, 100.0 - ((loan_amt / sal) * 20.0)))
            
        # 4. Credit score: normalized (300-900 -> 0-100)
        credit_pct = round(((credit - 300) / 600.0) * 100.0, 1)

        # 5. Financial Horizon: composite sustainability
        horizon_pct = round((solvency_pct * 0.3 + liquidity_pct * 0.3 + debt_safety_pct * 0.2 + credit_pct * 0.2), 1)

        radar_metrics = [
            RadarMetric(subject="Solvency", score=round(solvency_pct, 1)),
            RadarMetric(subject="Liquidity", score=round(liquidity_pct, 1)),
            RadarMetric(subject="Debt Safety", score=round(debt_safety_pct, 1)),
            RadarMetric(subject="Credit Score", score=round(credit_pct, 1)),
            RadarMetric(subject="Horizon", score=round(horizon_pct, 1)),
        ]

        return HealthEvaluationOut(
            health_score=total_score,
            health_tier=health_tier,
            is_locked=is_locked,
            salary_score=salary_score,
            credit_score_val=credit_score_val,
            debt_score=debt_score,
            emergency_score=emergency_score,
            recommendation_summary=msg,
            radar_metrics=radar_metrics
        )

health_service = HealthService()
