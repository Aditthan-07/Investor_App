from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_current_user_optional, get_current_user_required
from app.models.entities import FinancialHealthAssessment
from app.schemas.all_schemas import HealthInput, HealthEvaluationOut
from app.services.health_service import health_service

router = APIRouter()

@router.post("/evaluate", response_model=HealthEvaluationOut)
async def evaluate_health(
    payload: HealthInput,
    user_id: Optional[str] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = health_service.evaluate(
        salary_inr=payload.salary_inr,
        credit_score=payload.credit_score,
        has_loan=payload.has_loan,
        loan_amount=payload.loan_amount,
        emergency_fund=payload.emergency_fund
    )

    # If user is authenticated, persist assessment in database
    if user_id:
        record = FinancialHealthAssessment(
            user_id=user_id,
            salary_inr=payload.salary_inr,
            credit_score=payload.credit_score,
            has_loan=payload.has_loan,
            loan_amount=payload.loan_amount,
            emergency_fund=payload.emergency_fund,
            salary_score=result.salary_score,
            credit_score_val=result.credit_score_val,
            debt_score=result.debt_score,
            emergency_score=result.emergency_score,
            health_score=result.health_score,
            health_tier=result.health_tier,
            is_locked=result.is_locked,
            recommendation_summary=result.recommendation_summary
        )
        db.add(record)
        await db.commit()

    return result

@router.get("/history", response_model=List[HealthEvaluationOut])
async def get_health_history(
    user_id: str = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(FinancialHealthAssessment)
        .where(FinancialHealthAssessment.user_id == user_id)
        .order_by(FinancialHealthAssessment.assessed_at.desc())
        .limit(10)
    )
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    out = []
    for r in records:
        eval_res = health_service.evaluate(
            salary_inr=r.salary_inr,
            credit_score=r.credit_score,
            has_loan=r.has_loan,
            loan_amount=r.loan_amount,
            emergency_fund=r.emergency_fund
        )
        out.append(eval_res)
    return out
