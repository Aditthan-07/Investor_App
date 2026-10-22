from fastapi import APIRouter
from app.schemas.all_schemas import RecommendInput, RecommendOut, StockRecommendation
from app.services.ml_service import ml_service, STOCK_BASKETS, TICKER_METADATA, ASSET_ALLOCATIONS
from app.services.market_service import market_service

router = APIRouter()

@router.post("/", response_model=RecommendOut)
async def generate_recommendation(payload: RecommendInput):
    salary = payload.salary_inr if payload.salary_inr is not None else 600000.0
    has_loan = payload.has_loan if payload.has_loan is not None else False

    predicted_tier, confidence, importances, expl = ml_service.predict(
        risk_tolerance=payload.risk_tolerance,
        salary_inr=salary,
        has_loan=has_loan
    )

    tickers = STOCK_BASKETS.get(predicted_tier, STOCK_BASKETS["Moderate"])
    target_allocation = ASSET_ALLOCATIONS.get(predicted_tier, ASSET_ALLOCATIONS["Moderate"])

    # Fetch live quotes for recommended stocks
    stocks_out = []
    equal_weight = round(100.0 / len(tickers), 1)

    for t in tickers:
        quote = market_service.fetch_stock_quote(t)
        meta = TICKER_METADATA.get(t, {"name": quote["company_name"], "url": "#", "groww": "#"})
        stocks_out.append(
            StockRecommendation(
                ticker=t,
                company_name=meta["name"],
                current_price=quote["current_price"],
                two_week_change_pct=quote["two_week_change_pct"],
                allocation_pct=equal_weight,
                asset_class="Equity",
                website_url=meta.get("url"),
                chart_url=meta.get("groww")
            )
        )

    return RecommendOut(
        risk_profile=predicted_tier,
        confidence=confidence,
        feature_importances=importances,
        explanation=expl,
        target_asset_allocation=target_allocation,
        recommended_stocks=stocks_out
    )
