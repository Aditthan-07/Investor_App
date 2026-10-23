# FinSight AI — Institutional Wealth Management Platform

[![Expo SDK](https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-ML_Engine-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **FinSight AI** is an autonomous, quantitative wealth advisory ecosystem tailored for Indian retail and accredited investors. Built with a clean-slate mobile architecture and backed by an asynchronous FastAPI core, FinSight unifies institutional solvency auditing, machine learning risk classification, and real-time National Stock Exchange (NSE) market intelligence.


---

## 📱 Mobile Visual Showcase

| Step 01: Solvency Audit | 5-Axis Polygon Radar | Step 02: Equities Basket |
| :---: | :---: | :---: |
| <img src="docs/assets/mobile_step1_solvency.png" width="260" alt="Solvency Audit"/> | <img src="docs/assets/mobile_step1_radar.png" width="260" alt="Radar Metrics"/> | <img src="docs/assets/mobile_step2_equities.png" width="260" alt="Strategy Equities"/> |

| Step 03: Macro Allocation | Market Pulse Live Feed | AI Financial Co-Pilot |
| :---: | :---: | :---: |
| <img src="docs/assets/mobile_step3_allocation.png" width="260" alt="Asset Allocation"/> | <img src="docs/assets/mobile_market_pulse.png" width="260" alt="Market Pulse"/> | <img src="docs/assets/mobile_copilot_chat.png" width="260" alt="AI Co-Pilot"/> |


---

## 🛡️ Step 01: Foundational Solvency & Balance Sheet Audit

The application enforces a **clean-slate initialization**—no synthetic mock data or pre-assumed financial standing. Users input authentic figures with instant Indian numbering word previews (`₹ Lakhs / Cr`):

- **Debt & Liability Capacity:** Evaluates fixed obligations, active loan EMIs, and debt-to-income (DTI) health with quick-increment pills (`+₹1 Lakh`, `+₹5 Lakh`, `+₹10 Lakh`).
- **Credit Standing:** Credit bureau scoring normalized with color-coded risk bands (Poor, Fair, Prime).
- **5-Axis Solvency Polygon Radar:** Dynamic SVG polygon plotting **Solvency (80%)**, **Liquidity (20%)**, **Debt Safety (50%)**, **Credit Score (47%)**, and **Horizon (49%)**.
- **Vulnerable Solvency Safety Intercept:** If personal metrics indicate financial vulnerability (`POOR` tier), an automated risk confirmation modal intercepts capital deployment into volatile equities until emergency cash runways are established.


---

## 📈 Step 02: Risk-Adaptive Quantitative Equity Engine

Rather than offering generic stock screens, FinSight AI leverages a trained **Scikit-Learn Random Forest Classifier** to map multidimensional solvency indices to personalized risk profiles:

- **Conservative:** High-solvency capital preservation focusing on blue-chip dividend compounders (`HDFCBANK.NS`, `ITC.NS`, `TCS.NS`, `RELIANCE.NS`), sovereign debt, and lower volatility anchors.
- **Moderate:** Balanced growth targeting defensive large-caps combined with resilient mid-cap compounders (`INFY.NS`, `ICICIBANK.NS`, `BHARTIARTL.NS`, `LT.NS`).
- **Aggressive:** Alpha generation strategies featuring momentum-driven high-beta equities (`BAJFINANCE.NS`, `TATAMOTORS.NS`, `TITAN.NS`, `LTIM.NS`) with strict stop triggers.
- **Interactive Groww Charts:** In-app interactive price sheets with instant external browser fallbacks (`Open on Groww ↗`).


---

## ⚖️ Step 03: Macro Capital Architecture & Rebalancing Policy

Step 3 establishes the portfolio's top-level capital framework:

- **Segmented SVG Donut Ring:** Multi-colored asset distribution dividing total net worth across Domestic Equities (Emerald `#10B981`), Sovereign Debt/Bonds (Champagne Gold `#C5A880`), Commodities/Gold (Warm Amber `#F59E0B`), and Liquid Cash Reserves (Slate Blue `#64748B`).
- **Institutional Rebalancing Rules:** Automated threshold parameters triggering rebalancing notifications whenever an asset class deviates by more than **±5.0%** from target weight.
- **Drift Tolerance Policies:** Preserves capital during market volatility by preventing premature churning while systematically locking in equity profits.


---

## ⚡ Market Pulse & Real-Time Intelligence

A dedicated real-time terminal built directly into the mobile experience:

- **Live Benchmark Tracking:** Continuous NIFTY 50 price quotes, daily delta points, and percentage movements.
- **14-Day Trajectory Sparklines:** Dynamic SVG wave trendline visualization capturing momentum, support levels, and consolidation patterns.
- **Domestic Sentiment Index:** Automated aggregation of market breadth indicators classifying market bias as Bullish, Neutral, or Risk-Off.
- **Integrated News Feed:** Institutional wire summaries with modal reader support and external publisher fallback links (`Read Source ↗`).


---

## 🤖 Context-Aware AI Financial Co-Pilot

FinSight AI includes an embedded conversational assistant:

- **Balance Sheet Memory:** Directly reads personal solvency outcomes to tailor recommendations without re-prompting.
- **Quantitative Inquiry:** Real-time analysis of valuation multiples (P/E, P/B, EV/EBITDA), tax provisions (LTCG / STCG under Indian tax laws), and asset allocation trade-offs.
- **Non-Custodial Guidance:** Advisory strictly focused on capital allocation discipline, liquidity safeguards, and risk management without unauthorized execution.


---

## 🏛️ Monorepo System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               FinSight AI Mobile Client                │
│     (Expo SDK 51 / React Native / Expo Router v3)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Axios)
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Asynchronous Gateway               │
├───────────────────────────┬────────────────────────────┤
│ • Solvency Radar Service  │ • ML Inference Service     │
│ • Yahoo Finance Cache     │ • Financial NLP Assistant  │
└─────────────┬─────────────┴─────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   Random Forest Model     │ │   Yahoo Finance Feed     │
│  (Scikit-Learn Joblib)    │ │   (Persistent Cache)     │
└───────────────────────────┘ └──────────────────────────┘
```

The monorepo separates presentation, orchestration, and intelligence layers cleanly:
- **`apps/mobile/`**: Cross-platform Expo 51 application running natively on iOS, Android, and web simulators with dark executive aesthetics.
- **`apps/web/`**: Next.js 14 institutional desktop portal with interactive balance sheet audits, radar metrics, and market feeds.
- **`backend/`**: Asynchronous FastAPI microservice serving ML predictions, live market ingestion, and solvency scoring.
- **`investor_app.py`**: Standalone Streamlit engine with interactive visualizations and news sentiment analytics.


---

## ⚙️ Backend Microservice Setup Guide

The asynchronous FastAPI backend powers solvency calculation, ML risk allocation, market feeds, and conversational AI.

### 1. Prerequisites
- **Python 3.11+** installed
- SQLite3 or PostgreSQL

### 2. Environment Setup & Launch
```bash
# Navigate to the backend directory
cd backend

# Create isolated Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install locked production dependencies
pip install -r requirements.txt

# Start the asynchronous Uvicorn microservice
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. API Health & Interactive Documentation
- **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Probe:** [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz) (`{"status": "healthy"}`)


---

## 📲 Expo Mobile & Web Simulator Guide

The mobile application is built on **Expo SDK 51**, **React Native 0.74**, and **Expo Router v3**, featuring dark/gold executive theming, 100% in-app chart modals, and full offline fallback resilience.

### 1. Prerequisites
- **Node.js 20+ LTS**
- **npm** or **bun**

### 2. Environment Setup & Launch
```bash
# Navigate to the mobile workspace
cd apps/mobile

# Install client dependencies
npm install

# Option A: Launch In-Browser Web Simulator
npx expo start --web --port 8081

# Option B: Launch Native Tunnel / QR Code for Physical iOS & Android Devices (Expo Go)
npx expo start --tunnel
```

### 3. Verification & Live Simulator Access
- **Local Web Simulator:** Access the responsive mobile application frame directly at [http://localhost:8081](http://localhost:8081).
- **Physical Device:** Open the **Expo Go** app on your phone and scan the Metro terminal QR code.


---

## 🔌 API Endpoint Contracts & Schemas

The FastAPI microservice strictly validates inputs using **Pydantic v2** models:

| Method | Endpoint | Description | Request Body Summary | Response Key Attributes |
| :---: | :--- | :--- | :--- | :--- |
| `GET` | `/healthz` | Microservice liveness & readiness probe | _None_ | `status: "healthy"` |
| `POST` | `/api/v1/health` | Audits personal solvency & radar polygon | `{ salary, credit_score, has_loan, loan_amount, emergency_fund }` | `health_score`, `health_tier`, `radar_metrics` |
| `POST` | `/api/v1/recommend/` | Predicts ML risk profile & stock picks | `{ salary, credit_score, loan_amount, emergency_fund, risk_tolerance }` | `risk_tier`, `recommended_equities`, `allocation` |
| `GET` | `/api/v1/market/nifty` | Real-time NIFTY 50 quotes & 14-day wave | _None_ | `current_price`, `change_percent`, `sparkline_14d` |
| `POST` | `/api/v1/chat` | Contextual AI co-pilot NLP queries | `{ query, context: { health_tier, allocation } }` | `reply`, `suggestions`, `citations` |


---

## 👥 Contributors & Community

- **Lead Architect:** [Aditthan J K](https://github.com/Aditthan-07)
- **Repository:** [Aditthan-07/Investor_App](https://github.com/Aditthan-07/Investor_App)

---

## 📄 License & Regulatory Disclaimer

This project is open-source under the terms of the [MIT License](LICENSE).

> **Regulatory Disclaimer:** FinSight AI is an algorithmic decision-support tool created for educational and quantitative research purposes. It does not provide SEBI-registered investment advice or act as a licensed custodian. All financial market trading and equity investment entail risk of capital loss. Always perform independent due diligence before executing orders.
