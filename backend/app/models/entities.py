import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    assessments = relationship("FinancialHealthAssessment", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    watchlist_items = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")

class FinancialHealthAssessment(Base):
    __tablename__ = "financial_health_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Financial Inputs
    salary_inr = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    has_loan = Column(Boolean, default=False, nullable=False)
    loan_amount = Column(Float, default=0.0, nullable=False)
    emergency_fund = Column(Boolean, default=True, nullable=False)

    # Evaluated Scores
    salary_score = Column(Integer, nullable=False)
    credit_score_val = Column(Integer, nullable=False)
    debt_score = Column(Integer, nullable=False)
    emergency_score = Column(Integer, nullable=False)
    health_score = Column(Integer, nullable=False)  # Total out of 7
    health_tier = Column(String(20), nullable=False)  # "Poor", "Fair", "Good"
    is_locked = Column(Boolean, default=False, nullable=False)
    recommendation_summary = Column(Text, nullable=True)
    
    assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    user = relationship("User", back_populates="assessments")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), default="Primary Wealth Portfolio", nullable=False)
    strategy_tier = Column(String(50), default="Moderate", nullable=False)  # Safe, Moderate, Aggressive
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")

class Holding(Base):
    __tablename__ = "holdings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    ticker = Column(String(20), nullable=False, index=True)
    company_name = Column(String(150), nullable=False)
    shares = Column(Float, default=1.0, nullable=False)
    buy_price = Column(Float, nullable=False)
    asset_class = Column(String(50), default="Equity", nullable=False)  # Equity, Debt, Gold, Cash
    added_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    portfolio = relationship("Portfolio", back_populates="holdings")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ticker = Column(String(20), nullable=False, index=True)
    company_name = Column(String(150), nullable=True)
    added_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship
    user = relationship("User", back_populates="watchlist_items")
