# FinSight AI — Institutional Wealth Management Engine

FinSight AI is an institutional-grade wealth management platform tailored for Indian financial markets. It combines institutional solvency auditing, machine learning-driven asset allocation, real-time National Stock Exchange (NSE) market data, and an AI conversational financial co-pilot.

---

## Architecture Overview

- **`backend/`**: Asynchronous FastAPI microservice providing solvency evaluation, quantitative Random Forest risk inference, live market ingestion, and conversational financial NLP.
- **`apps/web/`**: Institutional desktop portal with interactive balance sheet audits, radar metrics, and market feeds.
- **`apps/mobile/`**: React Native / Expo client workspace designed for on-the-go portfolio monitoring and guided wealth workflows.
- **`investor_app.py`**: Standalone Streamlit quantitative intelligence engine with interactive visualizations and sentiment analysis.

---

## Core Capabilities

- **Solvency & Capacity Auditing:** Quantitative balance sheet evaluation analyzing debt-to-income, CIBIL credit tiering, and emergency liquidity without synthetic data assumptions.
- **Multi-Factor Risk Modeling:** Machine learning engine mapping solvency parameters to targeted risk tiers (Conservative, Moderate, Aggressive).
- **Macro Market Ingestion:** Benchmark index tracking (NIFTY 50), 14-day price trajectory analytics, and financial sentiment synthesis with persistent price caching.
- **Conversational Co-Pilot:** Natural language assistant for valuation insights, macroeconomic updates, and portfolio guidance.
- **Cross-Platform Delivery:** Full-stack responsiveness across web, mobile simulator, and interactive dashboards.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Core** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Scikit-Learn (Random Forest Classifier), NumPy, Pandas |
| **Market Data** | Yahoo Finance (`yfinance`) with persistent fallback pricing cache |
| **Web Frontend** | Next.js, React, TypeScript, Tailwind CSS, Lucide Icons |
| **Mobile Client** | Expo SDK, React Native, TypeScript, Expo Router |
| **Dashboard Core** | Streamlit, Plotly, TextBlob |

---

## Local Development Setup

### 1. Backend Service (FastAPI)
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Web Portal (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

### 3. Mobile Client (Expo)
```bash
cd apps/mobile
npm install
npx expo start
```

### 4. Standalone Dashboard (Streamlit)
```bash
pip install -r requirements.txt
streamlit run investor_app.py
```
