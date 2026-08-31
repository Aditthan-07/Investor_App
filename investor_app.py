import math
import time
import pandas as pd
import numpy as np
import yfinance as yf
import streamlit as st
import plotly.graph_objects as go
import requests
import xml.etree.ElementTree as ET
from textblob import TextBlob
from sklearn.ensemble import RandomForestClassifier
import warnings
import urllib.error
import socket
warnings.filterwarnings('ignore')

st.set_page_config(
    page_title="FinSight AI – ML Assistant",
    page_icon="🇮🇳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS remains unchanged
st.markdown("""
<style>
:root {
    --brand: #1f77b4;
    --warn: #e74c3c;
    --ok: #10b981;
    --accent: #ff7f0e;
    --bg-dark: #0d1117;
    --text-light: #f8f9fa;
    --card-bg: #161b22;
    --shadow: 0 4px 15px rgba(0,0,0,0.3);
}

body {
    background: var(--bg-dark);
    color: var(--text-light);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.main-header {
    font-size: 2.3rem;
    color: var(--brand);
    text-align: center;
    margin: 0.5rem 0 1.5rem;
    animation: fadeInScale 1.2s ease-out, glowText 3s infinite;
    letter-spacing: 0.5px;
}

.sub {
    font-size: 1rem;
    opacity: 0.85;
    text-align: center;
    margin-bottom: 1.5rem;
    animation: slideInUp 1s ease-out;
}

.step-header {
    font-size: 1.3rem;
    color: var(--accent);
    border-bottom: 3px solid var(--accent);
    padding-bottom: 0.4rem;
    margin-top: 1.5rem;
    animation: slideInLeft 0.9s ease-out;
    position: relative;
    overflow: hidden;
}

.step-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -100%;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: slideLine 2s infinite;
}

.pill {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: #2a4365;
    color: var(--text-light);
    font-weight: 600;
    margin-left: 0.5rem;
    animation: popIn 0.6s ease-out;
    transition: transform 0.3s ease, background 0.3s ease;
}

.pill:hover {
    transform: scale(1.05);
    background: #3b82f6;
}

.soft {
    background: var(--card-bg);
    border: 1px solid #30363d;
    padding: 1rem;
    border-radius: 0.8rem;
    transition: all 0.4s ease;
}

.soft:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
}

.glow {
    box-shadow: 0 0 0 2px #30363d inset, 0 0 20px rgba(31,119,180,0.3);
    animation: pulseGlow 2.5s infinite;
}

.hacker-alert {
    position: relative;
    background: #2d0000;
    color: #fff;
    padding: 1.5rem;
    border: 2px solid #ff0033;
    border-radius: 12px;
    font-weight: 800;
    font-size: 1.3rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    overflow: hidden;
    margin: 1.2rem 0;
    text-align: center;
    animation: shake 0.6s ease-in-out, flashBorder 1.5s infinite;
}

.hacker-alert::before, .hacker-alert::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, rgba(255,0,80,0.15), rgba(255,0,80,0.15) 3px, transparent 3px, transparent 6px);
    mix-blend-mode: lighten;
    pointer-events: none;
    animation: scan 2.5s linear infinite;
}

.hacker-alert::after {
    background: linear-gradient(180deg, transparent 0%, rgba(255,0,0,0.2) 50%, transparent 100%);
    animation: sweep 1.8s linear infinite;
}

.good {
    background: #0d2319;
    border: 1px solid #0f5132;
    color: #c6f6d5;
    animation: fadeInGreen 1.2s ease-out;
}

.info {
    background: #0d2030;
    border: 1px solid #0ea5e9;
    color: #dbeafe;
    animation: fadeInBlue 1.2s ease-out;
}

.headline-card {
    background: var(--card-bg);
    border: 1px solid #30363d;
    border-radius: 10px;
    padding: 1.2rem;
    margin-bottom: 0.8rem;
    transition: all 0.4s ease;
    animation: slideUpCard 0.7s ease-out;
}

.headline-card:hover {
    box-shadow: var(--shadow);
    transform: translateY(-4px);
}

.spacer {
    margin: 2.5rem 0;
}

.loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 4px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: var(--brand);
    animation: spin 1s ease-in-out infinite;
    margin-right: 12px;
}

.stButton>button {
    background: var(--brand);
    color: var(--text-light);
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    animation: popIn 0.5s ease-out;
    width: 100%;
}

.stButton>button:hover {
    background: #3b82f6;
    transform: scale(1.05);
    box-shadow: 0 2px 10px rgba(59,130,246,0.5);
}

.stButton>button:active {
    transform: scale(0.95);
}

.stExpander {
    background: var(--card-bg);
    border: 1px solid #30363d;
    border-radius: 10px;
    transition: all 0.4s ease;
    animation: slideIn 0.8s ease-out;
}

.stExpander:hover {
    box-shadow: var(--shadow);
}

.fade-in {
    animation: fadeIn 1s ease-out;
}

.slide-up {
    animation: slideUp 0.7s ease-out;
}

.bounce-in {
    animation: bounceIn 0.9s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInGreen {
    from { opacity: 0; background-color: transparent; }
    to { opacity: 1; background-color: #0d2319; }
}

@keyframes fadeInBlue {
    from { opacity: 0; background-color: transparent; }
    to { opacity: 1; background-color: #0d2030; }
}

@keyframes slideIn {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInLeft {
    from { transform: translateX(-40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideUpCard {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 2px #30363d inset, 0 0 20px rgba(31,119,180,0.3); }
    50% { box-shadow: 0 0 0 2px #30363d inset, 0 0 30px rgba(31,119,180,0.6); }
    100% { box-shadow: 0 0 0 2px #30363d inset, 0 0 20px rgba(31,119,180,0.3); }
}

@keyframes glowText {
    0% { text-shadow: 0 0 5px rgba(31,119,180,0.3); }
    50% { text-shadow: 0 0 15px rgba(31,119,180,0.7); }
    100% { text-shadow: 0 0 5px rgba(31,119,180,0.3); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
    20%, 40%, 60%, 80% { transform: translateX(6px); }
}

@keyframes scan {
    to { transform: translateX(10px); }
}

@keyframes sweep {
    50% { opacity: 0.1; }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes slideLine {
    0% { left: -100%; }
    100% { left: 100%; }
}

@keyframes flashBorder {
    0% { border-color: #ff0033; }
    50% { border-color: #ff6666; }
    100% { border-color: #ff0033; }
}

@keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
}

.typewriter {
    overflow: hidden;
    border-right: 0.15em solid var(--brand);
    white-space: nowrap;
    animation: typewriter 3.5s steps(40, end), blink-caret 0.8s step-end infinite;
}

@keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: var(--brand); }
}

.tooltip {
    position: relative;
    display: inline-block;
    cursor: help;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

@media (max-width: 768px) {
    .main-header {
        font-size: 1.8rem;
    }
    .step-header {
        font-size: 1.1rem;
    }
    .stButton>button {
        padding: 0.8rem 1.4rem;
    }
}
</style>
""", unsafe_allow_html=True)

# Initialize session states
if 'headlines' not in st.session_state:
    st.session_state.headlines = None
if 'headlines_time' not in st.session_state:
    st.session_state.headlines_time = 0
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "financial_health" not in st.session_state:
    st.session_state.financial_health = None
if "risk_profile" not in st.session_state:
    st.session_state.risk_profile = None
if "can_continue" not in st.session_state:
    st.session_state.can_continue = False
if "locked" not in st.session_state:
    st.session_state.locked = False
if "recommended_items" not in st.session_state:
    st.session_state.recommended_items = []
if "reco_expl" not in st.session_state:
    st.session_state.reco_expl = None
if "user_data" not in st.session_state:
    st.session_state.user_data = {'salary': 600000, 'has_loan': False, 'credit_score': 740, 'loan_amount': 0, 'emergency_fund': True}
if "loading" not in st.session_state:
    st.session_state.loading = False

st.markdown('<div class="main-header">FinSight AI: ML Assistant</div>', unsafe_allow_html=True)
st.markdown('<div class="sub">India-focused: INR, stocks (IN+global), ML insights, daily market updates.</div>', unsafe_allow_html=True)

def inr(x):
    try:
        if x is None:
            return "₹—"
        x = float(x)
        if math.isnan(x) or math.isinf(x):
            return "₹—"
    except (ValueError, TypeError):
        return "₹—"
    is_negative = x < 0
    absx = abs(x)
    sign = "-" if is_negative else ""
    if absx >= 1e7: return f"{sign}₹{absx/1e7:.2f} Cr"
    if absx >= 1e5: return f"{sign}₹{absx/1e5:.2f} L"
    return f"{sign}₹{absx:,.2f}"

def format_price(ticker, price):
    if price is None or price == 'N/A' or price == '':
        return '₹N/A'
    try:
        p = float(price)
        if math.isnan(p) or math.isinf(p) or p < 0:
            return '₹N/A'
        return inr(p)
    except (ValueError, TypeError):
        return '₹N/A'

import re

def validate_ticker(ticker):
    """
    Validates a stock ticker symbol.
    Returns: (is_valid: bool, cleaned_ticker: str, error_msg: str or None)
    """
    if ticker is None:
        return False, "", "Ticker symbol cannot be empty."
    ticker_str = str(ticker).strip().upper()
    if not ticker_str:
        return False, "", "Ticker symbol cannot be empty."
    if len(ticker_str) > 20:
        return False, ticker_str, f"Ticker symbol '{ticker_str}' is too long (maximum 20 characters)."
    if not re.match(r'^[A-Z0-9\.\-\^=]+$', ticker_str):
        return False, ticker_str, f"Ticker '{ticker_str}' contains invalid characters. Use letters, numbers, and allowed symbols (. - ^ =)."
    return True, ticker_str, None

TICKER_TO_NAME = {
    "HDFCBANK.NS": {"name": "HDFC Bank", "url": "https://www.hdfcbank.com"},
    "ICICIBANK.NS": {"name": "ICICI Bank", "url": "https://www.icicibank.com"},
    "RELIANCE.NS": {"name": "Reliance Industries", "url": "https://www.ril.com"},
    "SBIN.NS": {"name": "State Bank of India", "url": "https://www.sbi.co.in"},
    "AXISBANK.NS": {"name": "Axis Bank", "url": "https://www.axisbank.com"},
    "INFY.NS": {"name": "Infosys", "url": "https://www.infosys.com"},
    "TCS.NS": {"name": "Tata Consultancy Services", "url": "https://www.tcs.com"},
    "KOTAKBANK.NS": {"name": "Kotak Mahindra Bank", "url": "https://www.kotak.com"},
    "HCLTECH.NS": {"name": "HCL Technologies", "url": "https://www.hcltech.com"},
    "LTIM.NS": {"name": "L&T Infotech", "url": "https://www.ltimindtree.com"},
    "BAJFINANCE.NS": {"name": "Bajaj Finance", "url": "https://www.bajajfinserv.in"},
    "ADANIENT.NS": {"name": "Adani Enterprises", "url": "https://www.adanienterprises.com"},
    "TATAMOTORS.NS": {"name": "Tata Motors", "url": "https://www.tatamotors.com"},
    "BHARTIARTL.NS": {"name": "Bharti Airtel", "url": "https://www.airtel.in"},
    "ONGC.NS": {"name": "ONGC", "url": "https://www.ongcindia.com"},
    "AAPL": {"name": "Apple", "url": "https://www.apple.com"},
    "MSFT": {"name": "Microsoft", "url": "https://www.microsoft.com"},
    "GOOGL": {"name": "Google", "url": "https://www.google.com"},
    "TSLA": {"name": "Tesla", "url": "https://www.tesla.com"},
    "AMZN": {"name": "Amazon", "url": "https://www.amazon.com"}
}

GROWW_URLS = {
    "HDFCBANK.NS": "https://groww.in/charts/stocks/hdfc-bank-ltd",
    "ICICIBANK.NS": "https://groww.in/charts/stocks/icici-bank-ltd",
    "KOTAKBANK.NS": "https://groww.in/charts/stocks/kotak-mahindra-bank-ltd",
    "SBIN.NS": "https://groww.in/charts/stocks/state-bank-of-india",
    "AXISBANK.NS": "https://groww.in/charts/stocks/axis-bank-ltd",
    "INFY.NS": "https://groww.in/charts/stocks/infosys-ltd",
    "TCS.NS": "https://groww.in/charts/stocks/tata-consultancy-services-ltd",
    "HCLTECH.NS": "https://groww.in/charts/stocks/hcl-technologies-ltd",
    "LTIM.NS": "https://groww.in/charts/stocks/lt-finance-holdings-ltd",
    "BAJFINANCE.NS": "https://groww.in/charts/stocks/bajaj-housing-finance-ltd",
    "ADANIENT.NS": "https://groww.in/charts/stocks/adani-enterprises-ltd",
    "TATAMOTORS.NS": "https://groww.in/charts/stocks/tata-motors-ltd",
    "BHARTIARTL.NS": "https://groww.in/charts/stocks/bharti-airtel-ltd",
    "ONGC.NS": "https://groww.in/charts/stocks/oil-natural-gas-corporation-ltd",
    "RELIANCE.NS": "https://groww.in/charts/stocks/reliance-industries-ltd",
}

@st.cache_data(ttl=300)
def fetch_headlines(query="indian stock market OR nifty OR sensex", max_items=8):
    try:
        url = f"https://news.google.com/rss/search?q={requests.utils.quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"
        r = requests.get(url, timeout=8)
        if r.status_code != 200 or not r.text:
            return [{"title": "Market Update: Benchmark indices trade active", "link": "", "published": ""}]
        root = ET.fromstring(r.text)
        out = []
        for item in root.findall(".//item")[:max_items]:
            title = item.findtext("title") or "Headline"
            link = item.findtext("link") or ""
            pub = item.findtext("pubDate") or ""
            out.append({"title": title.strip(), "link": link.strip(), "published": pub.strip()})
        return out if out else [{"title": "Market Update: Indices show normal session activity", "link": "", "published": ""}]
    except Exception:
        return [
            {"title": "Fallback: Nifty and Sensex trade in range", "link": "", "published": ""},
            {"title": "Market update: Broad market participation observed", "link": "", "published": ""},
            {"title": "Economic review: Domestic liquidity remains stable", "link": "", "published": ""}
        ]

@st.cache_data(ttl=300)
def market_sentiment():
    try:
        heads = fetch_headlines()
        titles = [h["title"] for h in heads if h and h.get("title")]
        if not titles:
            return "Neutral 😐", 0.0, heads
        polarities = []
        for s in titles:
            try:
                p = float(TextBlob(s).sentiment.polarity)
                if not math.isnan(p):
                    polarities.append(p)
            except Exception:
                continue
        score = float(np.mean(polarities)) if polarities else 0.0
        if math.isnan(score):
            score = 0.0
        tag = "Bullish 🐂" if score > 0.1 else ("Bearish 🐻" if score < -0.1 else "Neutral 😐")
        return tag, score, heads
    except Exception:
        return "Neutral 😐", 0.0, [{"title": "Market sentiment data temporarily unavailable", "link": "", "published": ""}]

@st.cache_data(ttl=300)
def get_market_update():
    try:
        nifty = yf.Ticker("^NSEI")
        hist_df = nifty.history(period="5d", interval="1d")
        if hist_df is None or hist_df.empty or 'Close' not in hist_df.columns:
            return "N/A", 0.0, "No data available for Nifty 50."
        hist = hist_df['Close'].dropna()
        if hist.empty:
            return "N/A", 0.0, "No data available for Nifty 50."
        latest = float(hist.iloc[-1])
        if math.isnan(latest) or latest <= 0:
            return "N/A", 0.0, "Invalid market index value for Nifty 50."
        if len(hist) > 1:
            prev = float(hist.iloc[-2])
            if prev > 0 and not math.isnan(prev):
                change = ((latest - prev) / prev) * 100.0
            else:
                change = 0.0
        else:
            change = 0.0
        summary = f"Nifty 50: {inr(latest)} ({'+' if change >= 0 else ''}{change:.2f}% from previous close)"
        return latest, change, summary
    except Exception:
        return "N/A", 0.0, "Failed to fetch Nifty 50 data. Check connectivity or visit external sources like Groww or Moneycontrol."

def financial_health_check(salary_inr, credit_score, has_loan, loan_amount_inr, emergency_fund=True):
    # Validate salary
    try:
        salary_inr = float(salary_inr)
        if math.isnan(salary_inr) or math.isinf(salary_inr) or salary_inr < 0:
            raise ValueError("Annual salary must be a valid non-negative number.")
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid salary: {e}")
    
    # Validate credit score
    try:
        credit_score = float(credit_score)
        if math.isnan(credit_score) or math.isinf(credit_score) or credit_score < 300 or credit_score > 900:
            raise ValueError("Credit score must be between 300 and 900.")
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid credit score: {e}")
    
    # Validate loan parameters
    has_loan = bool(has_loan)
    try:
        loan_amount_inr = float(loan_amount_inr)
        if math.isnan(loan_amount_inr) or math.isinf(loan_amount_inr) or loan_amount_inr < 0:
            raise ValueError("Loan amount must be a valid non-negative number.")
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid loan amount: {e}")
    
    if not has_loan:
        loan_amount_inr = 0.0

    if salary_inr > 1e11:
        raise ValueError("Salary input exceeds realistic maximum limit (₹10,000 Cr).")
    if loan_amount_inr > 1e11:
        raise ValueError("Loan amount exceeds realistic maximum limit (₹10,000 Cr).")

    # Salary Score
    if salary_inr < 300000:
        salary_score = 0
    elif salary_inr < 800000:
        salary_score = 1
    else:
        salary_score = 2

    # Credit Score
    if credit_score < 600:
        credit_score_val = 0
    elif credit_score < 750:
        credit_score_val = 1
    else:
        credit_score_val = 2

    # Loan Score with zero-income handling
    if not has_loan or loan_amount_inr == 0:
        loan_score = 2
    elif salary_inr == 0:
        loan_score = 0
    else:
        if loan_amount_inr > salary_inr * 5:
            loan_score = 0
        elif loan_amount_inr > salary_inr * 2:
            loan_score = 1
        else:
            loan_score = 2

    emergency_bonus = 1 if emergency_fund else 0
    total = salary_score + credit_score_val + loan_score + emergency_bonus

    if total <= 3:
        return "Poor", "Financial health: Poor. Focus on basics—emergency fund, debt reduction. Avoid equities."
    elif total <= 5:
        return "Fair", "Financial health: Fair. Stick to safe/hybrid options."
    return "Good", "Financial health: Good. Ready for balanced investments."

@st.cache_data
def recommend_investments(risk_level, salary_inr, has_loan):
    ticker_map = {
        0: ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "SBIN.NS", "AXISBANK.NS"],
        1: ["INFY.NS", "TCS.NS", "HCLTECH.NS", "LTIM.NS", "BAJFINANCE.NS"],
        2: ["ADANIENT.NS", "TATAMOTORS.NS", "BHARTIARTL.NS", "ONGC.NS", "RELIANCE.NS"]
    }
    risk_level_str = str(risk_level).strip().capitalize() if risk_level else "Medium"
    risk_map = {"Low": 1, "Medium": 2, "High": 3}
    if risk_level_str not in risk_map:
        risk_level_str = "Medium"
    
    try:
        sal = float(salary_inr)
        if math.isnan(sal) or math.isinf(sal) or sal < 0:
            sal = 600000.0
    except (ValueError, TypeError):
        sal = 600000.0

    salary_level = 1 if sal < 400000 else (2 if sal < 1200000 else 3)
    has_loan_val = 1 if bool(has_loan) else 0

    try:
        data = {
            "risk_tolerance": [1,1,1,1,2,2,2,2,3,3,3,3,1,2,3],
            "salary_level": [1,2,3,1,1,2,3,2,1,2,3,3,2,1,3],
            "has_loan": [0,0,0,1,0,0,1,1,0,1,0,1,0,1,0],
            "investment_type": [0,0,0,0,1,1,1,1,2,2,2,2,0,1,2]
        }
        df = pd.DataFrame(data)
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(df[["risk_tolerance", "salary_level", "has_loan"]], df["investment_type"])
        
        input_feats = pd.DataFrame(
            [[risk_map[risk_level_str], salary_level, has_loan_val]],
            columns=["risk_tolerance", "salary_level", "has_loan"]
        )
        pred = clf.predict(input_feats)
        inv_code = int(pred[0]) if len(pred) > 0 and pred[0] in [0, 1, 2] else 1
        probas = clf.predict_proba(input_feats)[0]
        importances = clf.feature_importances_
        
        confidence = probas[inv_code] if inv_code < len(probas) else 1.0
        bucket = ["Safe", "Moderate", "Aggressive"][inv_code]
        expl = (f"ML Insights: Risk tolerance ({importances[0]:.2f} importance), "
                f"Salary level ({importances[1]:.2f}), Loan ({importances[2]:.2f}). "
                f"Confidence: {confidence:.2%} for {bucket}")
    except Exception:
        inv_code = 0 if risk_level_str == "Low" else (1 if risk_level_str == "Medium" else 2)
        bucket = ["Safe", "Moderate", "Aggressive"][inv_code]
        expl = f"Rule-based Insights: Profile assigned as {bucket} based on {risk_level_str} risk tolerance and current salary level."

    tickers = ticker_map.get(inv_code, ticker_map[1])
    return bucket, tickers, expl

@st.cache_data(ttl=300)
def get_stock_data(ticker, period="2wk"):
    is_valid, clean_ticker, err_msg = validate_ticker(ticker)
    if not is_valid:
        return 'N/A', 0.0, pd.Series(dtype=float), f"Invalid stock symbol '{ticker}': {err_msg}"
    
    company_name = TICKER_TO_NAME.get(clean_ticker, {'name': clean_ticker})['name']
    
    for attempt in range(3):
        try:
            stock = yf.Ticker(clean_ticker)
            info = getattr(stock, 'info', {}) or {}
            
            price = info.get('currentPrice', info.get('regularMarketPrice', 'N/A'))
            hist_df = stock.history(period=period, interval="1d")
            if hist_df is None or hist_df.empty or 'Close' not in hist_df.columns:
                hist = pd.Series(dtype=float)
            else:
                hist = hist_df['Close'].dropna()
                hist = pd.to_numeric(hist, errors='coerce').dropna()

            if (price == 'N/A' or price is None or (isinstance(price, (int, float)) and math.isnan(price))) and not hist.empty:
                price = float(hist.iloc[-1])

            if price == 'N/A' or price is None or (isinstance(price, (int, float)) and (math.isnan(price) or price <= 0)):
                return 'N/A', 0.0, hist if not hist.empty else pd.Series(dtype=float), f"No current price data available for {company_name} ({clean_ticker})."

            if hist.empty or len(hist) < 2:
                return float(price), 0.0, hist if not hist.empty else pd.Series(dtype=float), f"Insufficient historical data for {company_name} ({clean_ticker})."

            p_start = float(hist.iloc[0])
            p_end = float(hist.iloc[-1])
            if p_start > 0 and not math.isnan(p_start) and not math.isnan(p_end):
                change = ((p_end - p_start) / p_start) * 100.0
            else:
                change = 0.0

            return float(price), float(change), hist, None
        except (urllib.error.URLError, socket.gaierror) as e:
            if attempt < 2:
                time.sleep(1.5 ** attempt)
                continue
            return 'N/A', 0.0, pd.Series(dtype=float), f"Failed to fetch data for {company_name} ({clean_ticker}): Network error. Check connectivity or try again later."
        except Exception as e:
            if attempt < 2:
                time.sleep(1.5 ** attempt)
                continue
            return 'N/A', 0.0, pd.Series(dtype=float), f"Failed to fetch data for {company_name} ({clean_ticker}): {str(e)}."
            
    return 'N/A', 0.0, pd.Series(dtype=float), f"Failed to fetch data for {company_name} ({clean_ticker}) after retries."

def block_headlines():
    st.markdown('<div class="step-header">📰 Daily Market Updates</div>', unsafe_allow_html=True)
    current_time = time.time()
    if st.session_state.headlines is None or current_time - st.session_state.headlines_time > 300:
        with st.spinner('Fetching latest market updates...'):
            tag, score, heads = market_sentiment()
            nifty_price, nifty_change, nifty_summary = get_market_update()
            try:
                nifty = yf.Ticker("^NSEI")
                hist_df = nifty.history(period="2wk", interval="1d")
                if hist_df is not None and not hist_df.empty and 'Close' in hist_df.columns:
                    nifty_hist = hist_df['Close'].dropna()
                    nifty_hist = pd.to_numeric(nifty_hist, errors='coerce').dropna()
                else:
                    nifty_hist = pd.Series(dtype=float)
            except Exception:
                nifty_hist = pd.Series(dtype=float)
            st.session_state.headlines = (tag, score, heads, nifty_price, nifty_change, nifty_summary, nifty_hist)
            st.session_state.headlines_time = current_time
    else:
        tag, score, heads, nifty_price, nifty_change, nifty_summary, nifty_hist = st.session_state.headlines
    
    st.subheader("Market Overview")
    if nifty_price != "N/A":
        if nifty_change > 0:
            st.success(f"{nifty_summary}")
        elif nifty_change < 0:
            st.error(f"{nifty_summary}")
        else:
            st.info(f"{nifty_summary}")
    else:
        st.error(nifty_summary)
    
    if nifty_hist is not None and not nifty_hist.empty and len(nifty_hist) > 0:
        try:
            st.subheader("Nifty 50 Price Movement (Last 2 Weeks)")
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=nifty_hist.index,
                y=nifty_hist,
                mode='lines+markers+text',
                name='Nifty 50',
                line=dict(width=3, color='#1f77b4'),
                marker=dict(size=8, opacity=0.7),
                text=[f"₹{v:,.2f}" for v in nifty_hist],
                textposition="top center",
                textfont=dict(size=10),
                hovertemplate='Price: ₹%{y:,.2f}<extra></extra>'
            ))
            fig.update_layout(
                title="Nifty 50 Price Movement (Last 2 Weeks)",
                xaxis_title="Date",
                yaxis_title="Index Value (₹)",
                width=1200,
                height=600,
                template="plotly_dark",
                showlegend=True,
                hovermode="x unified",
                xaxis=dict(
                    type="date",
                    tickformat="%b %d",
                    dtick=86400000.0
                ),
                yaxis=dict(
                    autorange=True
                )
            )
            st.plotly_chart(fig, use_container_width=True)
            st.markdown("For additional Nifty 50 chart insights, visit [Groww Nifty Chart](https://groww.in/charts/indices/nifty)", unsafe_allow_html=True)
        except Exception:
            st.warning("Chart visualization temporarily unavailable for Nifty 50.")
    
    st.subheader("Latest Market News")
    if score > 0.1:
        st.success(f"Market Sentiment: {tag}  •  Score: {score:.2f}")
    elif score < -0.1:
        st.error(f"Market Sentiment: {tag}  •  Score: {score:.2f}")
    else:
        st.info(f"Market Sentiment: {tag}  •  Score: {score:.2f}")
    
    for i, h in enumerate(heads):
        title = h.get('title', 'Market News')
        with st.expander(f"**{title}**", expanded=False):
            if h.get("link"):
                st.markdown(f"[Read more]({h['link']})")
            if h.get("published"):
                st.caption(h["published"])

def block_fin_health():
    st.markdown('<div class="step-header">🏦 Step 1: Financial Health (INR)</div>', unsafe_allow_html=True)
    disabled = st.session_state.locked
    c1, c2, c3 = st.columns(3)
    with c1:
        salary = st.number_input(
            "Annual Salary (₹)",
            min_value=0,
            value=int(st.session_state.user_data.get('salary', 600000)),
            step=10000,
            key="fin_salary_input",
            disabled=disabled,
            format="%d",
            help="Enter your annual salary in INR."
        )
        if st.session_state.get('fin_salary_input') is not None and st.session_state.get('fin_salary_input') != st.session_state.user_data.get('salary', 600000):
            st.session_state.user_data['salary'] = salary
    with c2:
        credit = st.slider("Credit Score", 300, 900, st.session_state.user_data.get('credit_score', 740), key="fin_credit_slider", disabled=disabled, help="Your CIBIL or equivalent credit score.")
        has_loan = st.selectbox("Outstanding loans?", ["No", "Yes"], index=0 if not st.session_state.user_data.get('has_loan', False) else 1, key="fin_loan_select", disabled=disabled, help="Do you have any active loans?")
    with c3:
        loan_amt = st.number_input(
            "Loan Amount (₹)",
            min_value=0,
            value=int(st.session_state.user_data.get('loan_amount', 0 if has_loan == "No" else 300000)),
            step=10000,
            key="fin_loan_amt_input",
            disabled=disabled or has_loan == "No",
            format="%d",
            help="Total outstanding loan amount in INR."
        )
        emergency = st.selectbox("Emergency fund (≥3 months)?", ["Yes", "No"], index=0 if st.session_state.user_data.get('emergency_fund', True) else 1, key="fin_emergency_select", disabled=disabled, help="Do you have savings covering at least 3 months of expenses?")
    
    if st.button("Evaluate Health", key="fin_health_btn", disabled=disabled):
        st.session_state.loading = True
        with st.spinner('Analyzing your financial health...'):
            time.sleep(1.5)
            try:
                label, msg = financial_health_check(salary, credit, has_loan == "Yes", loan_amt, emergency == "Yes")
                st.session_state.financial_health = label
                st.session_state.can_continue = label in ["Fair", "Good"]
                st.session_state.locked = label == "Poor"
                st.session_state.user_data.update({
                    'salary': salary,
                    'has_loan': has_loan == "Yes",
                    'credit_score': credit,
                    'loan_amount': loan_amt,
                    'emergency_fund': emergency == "Yes"
                })
                if label == "Poor":
                    st.markdown('<div class="hacker-alert">ALERT! ACCESS DENIED — POOR HEALTH DETECTED.</div>', unsafe_allow_html=True)
                    st.error(msg)
                elif label == "Fair":
                    st.info(msg)
                else:
                    st.success(msg)
            except ValueError as e:
                st.error(f"Input validation error: {str(e)}")
            except Exception as e:
                st.error(f"An unexpected error occurred: {str(e)}")
            finally:
                st.session_state.loading = False

def block_reco():
    st.markdown('<div class="step-header">💡 Step 2: Investment Recommendations</div>', unsafe_allow_html=True)
    if not st.session_state.can_continue:
        st.warning("Complete Step 1 first.")
        return
    disabled = st.session_state.locked
    c1, c2 = st.columns(2)
    with c1:
        risk = st.selectbox("Risk tolerance", ["Low", "Medium", "High"], key="reco_risk_select", disabled=disabled, help="Your comfort level with investment risk.")
    with c2:
        salary = st.session_state.user_data.get('salary', 600000)
        st.write(f"Annual Salary (₹): {inr(salary)}")
    loan_checkbox_disabled = disabled or not st.session_state.user_data.get('has_loan', False)
    has_loan_flag = st.checkbox("Outstanding loans", value=st.session_state.user_data.get('has_loan', False), key="reco_loan_check", disabled=loan_checkbox_disabled, help="Check if you have loans.")
    
    if st.button("Get Recommendations", key="reco_btn", disabled=disabled):
        st.session_state.loading = True
        with st.spinner('Generating personalized recommendations...'):
            time.sleep(1.5)
            bucket, tickers, expl = recommend_investments(risk, salary, has_loan_flag)
            valid_tickers = []
            errors = []
            for t in tickers:
                price, _, _, error = get_stock_data(t, period="2wk")
                if error:
                    errors.append(error)
                if price != 'N/A':
                    valid_tickers.append(t)
            if not valid_tickers:
                st.error("No valid stock data available for recommendations. Try a different risk level or check external sources.")
                for error in errors:
                    st.warning(error)
                st.session_state.loading = False
                return
            st.session_state.risk_profile = bucket
            st.session_state.recommended_items = valid_tickers
            st.session_state.reco_expl = expl
            st.session_state.loading = False

    if st.session_state.risk_profile:
        st.info(f"Investment Profile: **{st.session_state.risk_profile}** | {st.session_state.reco_expl}")
        st.write("Recommended Stocks:")
        for t in st.session_state.recommended_items:
            st.write(f"- {TICKER_TO_NAME.get(t, {'name': t})['name']}")

def block_recommended_analysis():
    st.markdown('<div class="step-header">📊 Step 3: Recommended Stocks Analysis</div>', unsafe_allow_html=True)
    if not st.session_state.can_continue:
        st.warning("Complete prior steps.")
        return
    if not st.session_state.recommended_items:
        st.warning("Get recommendations from Step 2 first.")
        return
    disabled = st.session_state.locked
    
    if st.button("Analyze Recommendations", key="analysis_btn", disabled=disabled):
        st.session_state.loading = True
        with st.spinner('Fetching market data...'):
            stock_data = {}
            daily_data = {}
            valid_tickers = []
            errors = []
            for t in st.session_state.recommended_items:
                price, two_week_change, hist, error = get_stock_data(t, period="1mo")
                if error:
                    errors.append(error)
                if price != 'N/A' and hist is not None and not hist.empty:
                    company_info = TICKER_TO_NAME.get(t, {'name': t, 'url': '#'})
                    color = "#10b981" if two_week_change >= 0 else "#e74c3c"
                    stock_data[t] = {
                        'Company': company_info['name'],
                        'Website': f'<a href="{company_info["url"]}" target="_blank">Visit</a>',
                        'Groww Chart': f'<a href="{GROWW_URLS.get(t, "#")}" target="_blank">View Chart</a>',
                        'Current Price': format_price(t, price),
                        '2-Week Change (%)': f'<span style="color: {color};">{two_week_change:.2f}%</span>'
                    }
                    daily_data[t] = hist.tail(20)
                    valid_tickers.append(t)
            
            if not valid_tickers:
                st.error("No valid stock data available for analysis. Try different stocks or check external sources.")
                for error in errors:
                    st.warning(error)
                st.session_state.loading = False
                return
            
            analysis_df = pd.DataFrame.from_dict(stock_data, orient='index').reset_index().rename(columns={'index': 'Ticker'})
            analysis_df = analysis_df[['Company', 'Website', 'Groww Chart', 'Current Price', '2-Week Change (%)']]
            st.subheader("Recommended Stocks Summary")
            st.markdown(analysis_df.to_html(escape=False, index=False), unsafe_allow_html=True)
            
            daily_df = pd.DataFrame()
            for t in valid_tickers:
                if t in daily_data and not daily_data[t].empty:
                    temp_df = daily_data[t].reset_index()
                    temp_df.columns = ['Date', 'Close'] if len(temp_df.columns) == 2 else temp_df.columns
                    temp_df['Company'] = TICKER_TO_NAME.get(t, {'name': t})['name']
                    if 'Date' in temp_df.columns and 'Close' in temp_df.columns:
                        temp_df = temp_df[['Company', 'Date', 'Close']]
                        temp_df['Date'] = pd.to_datetime(temp_df['Date']).dt.strftime('%Y-%m-%d')
                        daily_df = pd.concat([daily_df, temp_df], ignore_index=True)
            
            if not daily_df.empty:
                st.subheader("Daily Closing Prices (Last 20 Days)")
                display_df = daily_df.copy()
                display_df['Close'] = display_df['Close'].apply(lambda x: inr(x))
                pivot_table = display_df.pivot_table(index='Date', columns='Company', values='Close', aggfunc='first')
                st.dataframe(pivot_table, use_container_width=True)
            
            st.markdown('<div class="spacer"></div>', unsafe_allow_html=True)
            st.subheader("Stock Price Movements (Last 2 Weeks)")
            try:
                fig = go.Figure()
                dash_styles = ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot']
                has_chart_traces = False
                for i, t in enumerate(valid_tickers):
                    _, _, hist, _ = get_stock_data(t, period="2wk")
                    if hist is not None and not hist.empty:
                        clean_h = hist.dropna()
                        if not clean_h.empty:
                            fig.add_trace(go.Scatter(
                                x=clean_h.index,
                                y=clean_h,
                                mode='lines+markers+text',
                                name=TICKER_TO_NAME.get(t, {'name': t})['name'],
                                line=dict(width=3, dash=dash_styles[i % len(dash_styles)]),
                                marker=dict(size=8, opacity=0.7),
                                text=[f"₹{v:,.2f}" for v in clean_h],
                                textposition="top center",
                                textfont=dict(size=10),
                                hovertemplate='Price: ₹%{y:,.2f}<extra></extra>'
                            ))
                            has_chart_traces = True
                if has_chart_traces:
                    fig.update_layout(
                        title="Stock Price Movements (Last 2 Weeks)",
                        xaxis_title="Date",
                        yaxis_title="Price (₹)",
                        width=1200,
                        height=600,
                        template="plotly_dark",
                        showlegend=True,
                        hovermode="x unified",
                        xaxis=dict(
                            type="date",
                            tickformat="%b %d",
                            dtick=86400000.0
                        ),
                        yaxis=dict(
                            autorange=True
                        )
                    )
                    st.plotly_chart(fig, use_container_width=True)
            except Exception:
                st.warning("Chart visualization could not be generated for current stocks.")
            st.session_state.loading = False

def block_resources():
    st.markdown('<div class="step-header">📚 Investment Resources</div>', unsafe_allow_html=True)
    st.write("Here are some recommended YouTube videos for beginners on stock market investment:")
    videos = [
        {"title": "Stock Market For Beginners | How can Beginners Start Investing in Share Market | Hindi", "url": "https://www.youtube.com/watch?v=3UF0ymVdYLA"},
        {"title": "Stock Market Classes with Pranjal Kamra - Lesson 1 | Stock Market Basics for Beginners in Hindi", "url": "https://www.youtube.com/watch?v=RieqxXMds64"},
        {"title": "Basics of Stock Market For Beginners Lecture 1 By CA Rachana Phadke Ranade", "url": "https://www.youtube.com/watch?v=Xn7KWR9EOGQ"},
    ]
    for v in videos:
        st.markdown(f"- [{v['title']}]({v['url']})")

HELP_TEXT = "Ask naturally: e.g., 'Analyze my finances: salary 7L, credit 760, loan yes 3L', 'Recommend for high risk', 'Market news?', 'What is TCS stock price?', 'Gold rate'."

def detect_intent(message: str):
    m = message.lower().strip()
    if any(g in m for g in ["hi", "hello", "hey", "greetings"]):
        return "greeting"
    intents = {
        "health": ["health", "check", "finances", "salary", "credit", "loan"],
        "recommend": ["recommend", "investment", "suggest", "profile"],
        "sentiment": ["sentiment", "market", "news", "headlines"],
        "price": ["rate", "price", "stock price", "current price"],
        "analysis": ["analyze", "graph", "chart"]
    }
    from rapidfuzz import fuzz
    scores = {k: max([fuzz.partial_ratio(m, kw) for kw in v]) for k, v in intents.items()}
    top_intent = max(scores, key=scores.get)
    return top_intent if scores[top_intent] > 60 else "unknown"

def extract_val(pattern, default, multiplier=1):
    import re
    try:
        match = re.search(pattern, m)
        if match:
            for g in reversed(match.groups()):
                if g is not None and g != '':
                    try:
                        val = float(g)
                        if not math.isnan(val) and not math.isinf(val) and val >= 0:
                            return val * multiplier
                    except ValueError:
                        continue
        return default
    except Exception:
        return default

def parse_chat(message: str):
    global m
    if st.session_state.locked and "hack override" not in message.lower():
        return "Your financial health is locked due to poor status. Focus on building an emergency fund and reducing debt first. (Easter egg: 'hack override' to bypass for demo.)"
    
    intent = detect_intent(message)
    m = message.lower()
    
    if intent == "greeting":
        return "Hey there! I'm Infoway, your AI investment buddy for Indian markets, powered by ML insights. Ready to analyze your finances or recommend stocks? Try: " + HELP_TEXT
    
    if intent == "sentiment":
        tag, score, heads = market_sentiment()
        _, _, nifty_summary = get_market_update()
        out = f"{nifty_summary}\nMarket Sentiment: {tag} (Score: {score:.2f})\nRecent Headlines:\n" + "\n".join(f"- {h['title']} ({h['link']})" for h in heads[:5])
        return out
    
    if intent == "health":
        salary = extract_val(r"(salary|income|earning)[^\d]*(\d+(\.\d+)?)", st.session_state.user_data.get('salary', 600000))
        if "l" in m or "lakh" in m: salary *= 100000
        credit = extract_val(r"(credit|cibil)[^\d]*(\d{3})", st.session_state.user_data.get('credit_score', 740))
        loan_amt = extract_val(r"(loan|debt)[^\d]*(\d+(\.\d+)?)", st.session_state.user_data.get('loan_amount', 0))
        if "l" in m or "lakh" in m: loan_amt *= 100000
        has_loan = loan_amt > 0 if ("no loan" not in m and "without loan" not in m) else False
        emergency = "yes" in m or "fund" in m or st.session_state.user_data.get('emergency_fund', True)
        
        try:
            label, msg = financial_health_check(salary, credit, has_loan, loan_amt, emergency)
            st.session_state.financial_health = label
            st.session_state.can_continue = label in ["Fair", "Good"]
            st.session_state.locked = label == "Poor"
            st.session_state.user_data.update({
                'salary': salary,
                'has_loan': has_loan,
                'credit_score': credit,
                'loan_amount': loan_amt,
                'emergency_fund': emergency
            })
            if label == "Poor":
                st.markdown('<div class="hacker-alert">ALERT! ACCESS DENIED — POOR HEALTH DETECTED.</div>', unsafe_allow_html=True)
            return (f"{msg}\nDetails: Salary {inr(salary)}, Credit Score {int(credit)}, "
                    f"Loan {inr(loan_amt)}, Emergency Fund: {'Yes' if emergency else 'No'}")
        except ValueError as e:
            return f"Input error: {str(e)}"
        except Exception as e:
            return f"Unable to assess financial health: {str(e)}"
    
    if intent == "recommend":
        risk = "Medium"
        if "low" in m: risk = "Low"
        if "high" in m: risk = "High"
        salary = st.session_state.user_data.get('salary', 600000)
        has_loan = st.session_state.user_data.get('has_loan', False)
        bucket, tickers, expl = recommend_investments(risk, salary, has_loan)
        valid_tickers = []
        errors = []
        for t in tickers:
            price, _, _, error = get_stock_data(t, period="2wk")
            if error:
                errors.append(error)
            if price != 'N/A':
                valid_tickers.append(t)
        if not valid_tickers:
            error_msg = "No valid stock data available for recommendations. Try a different risk level or check external sources."
            if errors:
                error_msg += "\nErrors encountered:\n" + "\n".join(errors)
            return error_msg
        st.session_state.recommended_items = valid_tickers
        st.session_state.risk_profile = bucket
        st.session_state.reco_expl = expl
        return (f"Based on your details (Salary: {inr(salary)}, Loan: {'Yes' if has_loan else 'No'}), "
                f"your investment profile is {bucket}. {expl}\nRecommended Stocks:\n" +
                "\n".join(f"- {TICKER_TO_NAME.get(x, {'name': x})['name']}" for x in valid_tickers) +
                "\nHead to the Guided Steps tab to analyze these further!")
    
    if intent == "analysis":
        if not st.session_state.recommended_items:
            return "I need to recommend some stocks first. Try asking for recommendations or completing Step 2 in the Guided Steps tab."
        tickers = st.session_state.recommended_items
        stock_data = {}
        errors = []
        for t in tickers:
            price, change, _, error = get_stock_data(t, period="2wk")
            stock_data[t] = (price, change)
            if error:
                errors.append(error)
        valid_tickers = [t for t in tickers if stock_data[t][0] != 'N/A']
        if not valid_tickers:
            error_msg = "No valid stock data available for analysis. Try different stocks or check external sources."
            if errors:
                error_msg += "\nErrors encountered:\n" + "\n".join(errors)
            return error_msg
        return ("I've analyzed your recommended stocks using ML-driven data fetching. Check the Guided Steps tab for the table and interactive graphs with daily prices. Quick summary:\n" +
                "\n".join(f"- {TICKER_TO_NAME.get(t, {'name': t})['name']}: Current Price {format_price(t, stock_data[t][0])}, "
                         f"2-Week Change: {stock_data[t][1]:.2f}%" for t in valid_tickers))
    
    if intent == "price":
        import re
        asset_match = re.search(r"(gold|silver|[a-zA-Z0-9\.\^=]+)", m)
        if asset_match:
            asset = asset_match.group(1).upper()
            if asset == "GOLD":
                price, _, _, error = get_stock_data("GC=F", period="2wk")
                if error:
                    return f"Failed to fetch gold price: {error}"
                return f"Current gold price (based on futures): {format_price('GC=F', price)}. For accurate Indian rates, check external sources."
            elif asset == "SILVER":
                price, _, _, error = get_stock_data("SI=F", period="2wk")
                if error:
                    return f"Failed to fetch silver price: {error}"
                return f"Current silver price (based on futures): {format_price('SI=F', price)}. For accurate Indian rates, check external sources."
            else:
                ticker_to_fetch = asset if (asset.endswith('.NS') or '.' in asset or asset.startswith('^') or '=' in asset) else f"{asset}.NS"
                price, _, _, error = get_stock_data(ticker_to_fetch, period="2wk")
                if error and not asset.endswith('.NS'):
                    price_raw, _, _, error_raw = get_stock_data(asset, period="2wk")
                    if not error_raw and price_raw != 'N/A':
                        price, error, ticker_to_fetch = price_raw, None, asset
                if error:
                    return f"Failed to fetch price for {TICKER_TO_NAME.get(ticker_to_fetch, {'name': ticker_to_fetch})['name']} ({ticker_to_fetch}): {error}"
                company_info = TICKER_TO_NAME.get(ticker_to_fetch, {'name': ticker_to_fetch, 'url': '#'})
                return f"Current price for {company_info['name']} ({ticker_to_fetch}): {format_price(ticker_to_fetch, price)}"
        return "Could you specify the stock or asset (e.g., 'gold rate', 'TCS price', or 'AAPL price')?"
    
    if "hack override" in m:
        st.session_state.locked = False
        return "Override activated! You're in—proceed with caution."
    
    return "Hmm, I'm not sure about that one. Could you rephrase? Or try one of these: " + HELP_TEXT

with st.sidebar:
    st.header("User Profile")
    st.write(f"Salary: {inr(st.session_state.user_data.get('salary', 0))}")
    st.write(f"Credit Score: {st.session_state.user_data.get('credit_score', 'N/A')}")
    st.write(f"Has Loan: {'Yes' if st.session_state.user_data.get('has_loan', False) else 'No'}")
    st.write(f"Loan Amount: {inr(st.session_state.user_data.get('loan_amount', 0))}")
    st.write(f"Emergency Fund: {'Yes' if st.session_state.user_data.get('emergency_fund', False) else 'No'}")
    if st.button("Reset All Data"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

t1, t2 = st.tabs(["💬 Infoway", "🧭 Guided Steps"])
with t1:
    block_headlines()
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
    prompt = st.chat_input("Ask naturally...")
    if prompt:
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        with st.chat_message("assistant"):
            with st.spinner('Thinking...'):
                time.sleep(0.5)
                reply = parse_chat(prompt)
                st.markdown(reply)
        st.session_state.chat_history.append({"role": "assistant", "content": reply})

with t2:
    with st.expander("Step 1: Financial Health", expanded=True):
        block_fin_health()
    with st.expander("Step 2: Investment Recommendations"):
        block_reco()
    with st.expander("Step 3: Recommended Stocks Analysis"):
        block_recommended_analysis()
    with st.expander("Investment Resources"):
        block_resources()

if st.session_state.loading:
    st.markdown("""
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(0,0,0,0.7); padding: 20px; border-radius: 10px;">
        <div class="loading-spinner"></div>
        <span>Processing...</span>
    </div>
    """, unsafe_allow_html=True)

st.caption("Disclaimer: Educational only. Not advice. Use at own risk.")