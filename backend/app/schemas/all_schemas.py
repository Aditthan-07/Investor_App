from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# ================= AUTH SCHEMAS =================
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ================= HEALTH SCHEMAS =================
class HealthInput(BaseModel):
    salary_inr: float = Field(..., ge=0, description="Annual Salary in INR")
    credit_score: int = Field(..., ge=300, le=900, description="CIBIL or equivalent credit score (300-900)")
    has_loan: bool = Field(default=False, description="Whether user has outstanding loans")
    loan_amount: float = Field(default=0.0, ge=0, description="Total outstanding debt in INR")
    emergency_fund: bool = Field(default=True, description="Reserve covering >= 3 months expenses")

class RadarMetric(BaseModel):
    subject: str  # Solvency, Liquidity, Debt Safety, Credit Score, Financial Horizon
    score: float  # 0 to 100
    full_mark: float = 100.0

class HealthEvaluationOut(BaseModel):
    health_score: int  # 0 to 7
    health_tier: str   # "Poor", "Fair", "Good"
    is_locked: bool
    salary_score: int
    credit_score_val: int
    debt_score: int
    emergency_score: int
    recommendation_summary: str
    radar_metrics: List[RadarMetric]

# ================= RECOMMENDATION SCHEMAS =================
class RecommendInput(BaseModel):
    risk_tolerance: str = Field(default="Medium", description="Low, Medium, or High")
    salary_inr: Optional[float] = Field(default=None, ge=0)
    has_loan: Optional[bool] = Field(default=None)

class StockRecommendation(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    two_week_change_pct: float
    allocation_pct: float
    asset_class: str
    website_url: Optional[str] = None
    chart_url: Optional[str] = None

class RecommendOut(BaseModel):
    risk_profile: str  # "Safe", "Moderate", "Aggressive"
    confidence: float
    feature_importances: Dict[str, float]
    explanation: str
    target_asset_allocation: Dict[str, float]
    recommended_stocks: List[StockRecommendation]

# ================= MARKET SCHEMAS =================
class StockQuote(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    two_week_change_pct: float
    currency: str = "INR"
    last_updated: str
    history: List[Dict[str, Any]] = []

class NiftyUpdate(BaseModel):
    latest_price: float
    change_pct: float
    summary: str
    history: List[Dict[str, Any]] = []

class HeadlineItem(BaseModel):
    title: str
    link: str
    published: str

class SentimentOut(BaseModel):
    sentiment_tag: str  # "Bullish 🐂", "Bearish 🐻", "Neutral 😐"
    score: float
    headlines: List[HeadlineItem]

class NormalizedHistorySeries(BaseModel):
    dates: List[str]
    series: Dict[str, List[float]]  # Ticker -> List of normalized percentage returns from Day 0 (e.g. 0.0, 1.2, -0.5)

# ================= PORTFOLIO & HOLDINGS =================
class HoldingCreate(BaseModel):
    ticker: str
    company_name: str
    shares: float = Field(default=1.0, gt=0)
    buy_price: float = Field(..., gt=0)
    asset_class: str = "Equity"

class HoldingOut(BaseModel):
    id: str
    portfolio_id: str
    ticker: str
    company_name: str
    shares: float
    buy_price: float
    current_price: Optional[float] = None
    total_invested: float
    current_value: Optional[float] = None
    pnl_inr: Optional[float] = None
    pnl_pct: Optional[float] = None
    asset_class: str
    added_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PortfolioOut(BaseModel):
    id: str
    name: str
    strategy_tier: str
    total_invested: float
    current_valuation: float
    holdings: List[HoldingOut]
    model_config = ConfigDict(from_attributes=True)

# ================= WATCHLIST SCHEMAS =================
class WatchlistCreate(BaseModel):
    ticker: str
    company_name: Optional[str] = None

class WatchlistItemOut(BaseModel):
    id: str
    ticker: str
    company_name: str
    current_price: Optional[float] = None
    change_pct: Optional[float] = None
    added_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ================= CHAT SCHEMAS =================
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    intent: str
    extracted_data: Optional[Dict[str, Any]] = None
