from typing import List, Dict, Any
from fastapi import APIRouter, Query, Body
from app.schemas.all_schemas import StockQuote, NiftyUpdate, SentimentOut, NormalizedHistorySeries
from app.services.market_service import market_service
from app.services.ml_service import TICKER_METADATA

router = APIRouter()

@router.get("/nifty", response_model=NiftyUpdate)
async def get_nifty():
    data = market_service.get_nifty_update()
    return NiftyUpdate(**data)

@router.get("/quote/{ticker}", response_model=StockQuote)
async def get_quote(ticker: str, period: str = Query(default="2wk")):
    data = market_service.fetch_stock_quote(ticker=ticker, period=period)
    return StockQuote(**data)

@router.get("/sentiment", response_model=SentimentOut)
async def get_sentiment():
    data = market_service.get_market_sentiment()
    return SentimentOut(**data)

@router.post("/compare-normalized", response_model=NormalizedHistorySeries)
async def compare_normalized(tickers: List[str] = Body(..., embed=True), period: str = Body(default="2wk")):
    data = market_service.get_normalized_comparison(tickers=tickers, period=period)
    return NormalizedHistorySeries(**data)

@router.get("/search")
async def search_stocks(q: str = Query(default="")):
    """Searches stock universe for tickers and company names."""
    query = q.strip().upper()
    results = []
    
    # Check catalog
    for ticker, info in TICKER_METADATA.items():
        if query in ticker or query in info["name"].upper():
            results.append({
                "ticker": ticker,
                "company_name": info["name"]
            })
            
    if not results and query:
        # Allow searching custom NSE ticker
        formatted_ticker = query if (query.endswith(".NS") or "." in query or "^" in query) else f"{query}.NS"
        results.append({
            "ticker": formatted_ticker,
            "company_name": f"{query} (NSE)"
        })
        
    return results[:10]
