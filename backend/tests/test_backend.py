import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db
from app.services.health_service import health_service
from app.services.ml_service import ml_service
from app.services.chat_service import chat_service

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

@pytest.mark.asyncio
async def test_healthz_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

# ================= HEALTH SERVICE UNIT TESTS =================
def test_financial_health_good():
    # High salary, good credit, no loans, emergency fund
    res = health_service.evaluate(salary_inr=1500000, credit_score=800, has_loan=False, loan_amount=0, emergency_fund=True)
    assert res.health_tier == "Good"
    assert res.health_score >= 6
    assert not res.is_locked
    assert len(res.radar_metrics) == 5

def test_financial_health_poor_lockout():
    # Low salary, bad credit, heavy loans, no emergency fund
    res = health_service.evaluate(salary_inr=200000, credit_score=500, has_loan=True, loan_amount=1200000, emergency_fund=False)
    assert res.health_tier == "Poor"
    assert res.health_score <= 3
    assert res.is_locked

def test_financial_health_fair():
    res = health_service.evaluate(salary_inr=600000, credit_score=680, has_loan=True, loan_amount=300000, emergency_fund=True)
    assert res.health_tier == "Fair"
    assert not res.is_locked

# ================= ML SERVICE UNIT TESTS =================
def test_ml_risk_prediction_safe():
    tier, conf, importances, expl = ml_service.predict(risk_tolerance="Low", salary_inr=500000, has_loan=False)
    assert tier == "Safe"
    assert conf > 0.5
    assert "risk_tolerance" in importances

def test_ml_risk_prediction_aggressive():
    tier, conf, importances, expl = ml_service.predict(risk_tolerance="High", salary_inr=1800000, has_loan=False)
    assert tier == "Aggressive"
    assert conf > 0.5

def test_ml_risk_prediction_guardrail():
    # Low income with active debt CANNOT be Aggressive even if High risk requested
    tier, conf, importances, expl = ml_service.predict(risk_tolerance="High", salary_inr=250000, has_loan=True, loan_amount=400000)
    assert tier in ["Safe", "Moderate"]
    assert tier != "Aggressive"

# ================= CHAT SERVICE (NO LEAKY GLOBALS) =================
def test_chat_stateless_intent():
    res1 = chat_service.process_message("What is TCS stock price?")
    assert res1["intent"] == "price"
    assert "TCS" in res1["reply"]

    res2 = chat_service.process_message("Analyze my finances: salary 9L, credit 750, loan no")
    assert res2["intent"] == "health"
    assert "Financial Assessment" in res2["reply"]

    res3 = chat_service.process_message("Current market sentiment")
    assert res3["intent"] == "sentiment"

# ================= API INTEGRATION TESTS =================
@pytest.mark.asyncio
async def test_auth_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        import time
        email = f"test_investor_{int(time.time()*1000)}@finsight.app"
        password = "SecurePassword123!"

        # Register
        reg_res = await ac.post("/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test Investor"
        })
        assert reg_res.status_code in [200, 201]
        token = reg_res.json()["access_token"]
        assert token is not None

        # Login
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_res.status_code == 200
        assert login_res.json()["access_token"] is not None

        # Protected Me route
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == email

@pytest.mark.asyncio
async def test_health_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/health/evaluate", json={
            "salary_inr": 800000,
            "credit_score": 750,
            "has_loan": False,
            "loan_amount": 0,
            "emergency_fund": True
        })
        assert res.status_code == 200
        data = res.json()
        assert data["health_tier"] == "Good"
        assert len(data["radar_metrics"]) == 5

@pytest.mark.asyncio
async def test_recommend_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/recommend/", json={
            "risk_tolerance": "Medium",
            "salary_inr": 700000,
            "has_loan": False
        })
        assert res.status_code == 200
        data = res.json()
        assert data["risk_profile"] in ["Safe", "Moderate", "Aggressive"]
        assert len(data["recommended_stocks"]) > 0
        assert "Large & Mid Cap Equities" in data["target_asset_allocation"]
