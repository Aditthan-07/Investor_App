from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, recommend, market, watchlist, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(health.router, prefix="/health", tags=["Financial Health"])
api_router.include_router(recommend.router, prefix="/recommend", tags=["Investment Recommendations"])
api_router.include_router(market.router, prefix="/market", tags=["Market Intelligence"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist"])
api_router.include_router(chat.router, prefix="/chat", tags=["Infoway Chat Assistant"])
