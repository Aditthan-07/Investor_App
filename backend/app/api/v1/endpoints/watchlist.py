from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import get_current_user_required
from app.models.entities import Watchlist
from app.schemas.all_schemas import WatchlistCreate, WatchlistItemOut
from app.services.market_service import market_service
from app.services.ml_service import TICKER_METADATA

router = APIRouter()

@router.get("/", response_model=List[WatchlistItemOut])
async def get_watchlist(
    user_id: str = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Watchlist).where(Watchlist.user_id == user_id).order_by(Watchlist.added_at.desc())
    res = await db.execute(stmt)
    items = res.scalars().all()

    out = []
    for item in items:
        quote = market_service.fetch_stock_quote(item.ticker)
        out.append(
            WatchlistItemOut(
                id=item.id,
                ticker=item.ticker,
                company_name=item.company_name or quote["company_name"],
                current_price=quote["current_price"],
                change_pct=quote["two_week_change_pct"],
                added_at=item.added_at
            )
        )
    return out

@router.post("/", response_model=WatchlistItemOut, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    payload: WatchlistCreate,
    user_id: str = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    clean_ticker = payload.ticker.strip().upper()
    formatted = clean_ticker if (clean_ticker.endswith(".NS") or "." in clean_ticker or "^" in clean_ticker or "=" in clean_ticker) else f"{clean_ticker}.NS"

    # Check if already in watchlist
    stmt = select(Watchlist).where(Watchlist.user_id == user_id, Watchlist.ticker == formatted)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock is already in your watchlist.")

    quote = market_service.fetch_stock_quote(formatted)
    company_name = payload.company_name or TICKER_METADATA.get(formatted, {}).get("name") or quote["company_name"]

    new_item = Watchlist(
        user_id=user_id,
        ticker=formatted,
        company_name=company_name
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)

    return WatchlistItemOut(
        id=new_item.id,
        ticker=new_item.ticker,
        company_name=new_item.company_name,
        current_price=quote["current_price"],
        change_pct=quote["two_week_change_pct"],
        added_at=new_item.added_at
    )

@router.delete("/{ticker}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(
    ticker: str,
    user_id: str = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db)
):
    clean = ticker.strip().upper()
    stmt = select(Watchlist).where(Watchlist.user_id == user_id, Watchlist.ticker == clean)
    res = await db.execute(stmt)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist item not found.")
    await db.delete(item)
    await db.commit()
