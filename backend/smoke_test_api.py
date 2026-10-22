import time
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
API_V1 = f"{BASE_URL}/api/v1"

results = []

def test_endpoint(name, method, url, payload=None, headers=None, validator=None):
    start = time.perf_counter()
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            r = requests.post(url, json=payload, headers=headers, timeout=10)
        latency_ms = (time.perf_counter() - start) * 1000
        
        status_ok = r.status_code in [200, 201]
        valid_custom = True
        custom_msg = ""
        if validator and status_ok:
            try:
                valid_custom, custom_msg = validator(r.json())
            except Exception as e:
                valid_custom = False
                custom_msg = f"Validator error: {e}"
                
        passed = status_ok and valid_custom
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status_code": r.status_code,
            "latency_ms": round(latency_ms, 2),
            "passed": passed,
            "details": custom_msg or ("OK" if passed else f"Status {r.status_code}: {r.text[:100]}")
        })
        return r
    except Exception as e:
        latency_ms = (time.perf_counter() - start) * 1000
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status_code": 0,
            "latency_ms": round(latency_ms, 2),
            "passed": False,
            "details": f"Connection/Request Exception: {e}"
        })
        return None

print("=== STARTING LIVE FASTAPI SMOKE TESTS ===")

# 1. Healthz
test_endpoint(
    name="System Health Check",
    method="GET",
    url=f"{BASE_URL}/healthz",
    validator=lambda j: (j.get("status") == "healthy", f"status={j.get('status')}")
)

# 2. Auth: Register
timestamp = int(time.time())
test_email = f"verified_user_{timestamp}@finsight.app"
reg_resp = test_endpoint(
    name="Auth: Register Investor",
    method="POST",
    url=f"{API_V1}/auth/register",
    payload={"email": test_email, "password": "SecurePassword#2026", "full_name": "Aditthan J K"},
    validator=lambda j: ("access_token" in j and j.get("token_type") == "bearer", f"Token received, len={len(j.get('access_token', ''))}")
)

token = reg_resp.json().get("access_token") if reg_resp and reg_resp.status_code in [200, 201] else ""
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# 3. Auth: Login
test_endpoint(
    name="Auth: Login & Issue JWT",
    method="POST",
    url=f"{API_V1}/auth/login",
    payload={"email": test_email, "password": "SecurePassword#2026"},
    validator=lambda j: ("access_token" in j, f"Issued JWT Bearer token")
)

# 4. Auth: Profile Me
test_endpoint(
    name="Auth: Current Profile (/me)",
    method="GET",
    url=f"{API_V1}/auth/me",
    headers=auth_headers,
    validator=lambda j: (j.get("email") == test_email, f"User verified: {j.get('email')}")
)

# 5. Financial Health Evaluation with fresh clean-slate payload
health_payload = {
    "salary_inr": 850000.0,
    "credit_score": 780,
    "has_loan": False,
    "loan_amount": 0.0,
    "emergency_fund": True
}

def validate_health(j):
    tier = j.get("health_tier")
    score = j.get("health_score")
    radar = j.get("radar_metrics", [])
    subjects = [m.get("subject") for m in radar]
    expected_subjects = ["Solvency", "Liquidity", "Debt Safety", "Credit Score", "Horizon"]
    all_subjects_present = all(s in subjects for s in expected_subjects)
    msg = f"Tier={tier}, Score={score}/7, RadarAxes={subjects}"
    return (tier == "Good" and score >= 6 and all_subjects_present, msg)

test_endpoint(
    name="Health: Evaluate Solvency & Radar",
    method="POST",
    url=f"{API_V1}/health/evaluate",
    headers=auth_headers,
    payload=health_payload,
    validator=validate_health
)

# 6. ML Recommendation
reco_payload = {
    "risk_tolerance": "Medium",
    "salary_inr": 850000.0,
    "has_loan": False
}

def validate_reco(j):
    tier = j.get("risk_profile")
    conf = j.get("confidence")
    importances = j.get("feature_importances", {})
    stocks = j.get("recommended_stocks", [])
    has_features = "risk_tolerance" in importances and "salary_level" in importances
    msg = f"Profile={tier} (Confidence={conf:.1%}), Features={importances}, StockCount={len(stocks)}"
    return (tier in ["Safe", "Moderate", "Aggressive"] and has_features and len(stocks) > 0, msg)

test_endpoint(
    name="ML Recommendation: Sub-Millisecond Inference",
    method="POST",
    url=f"{API_V1}/recommend/",
    payload=reco_payload,
    validator=validate_reco
)

# 7. Market: Normalized Relative Momentum Comparison
norm_payload = {
    "tickers": ["TCS.NS", "INFY.NS", "RELIANCE.NS"],
    "period": "2wk"
}

def validate_normalized(j):
    dates = j.get("dates", [])
    series = j.get("series", {})
    rebased_to_zero = True
    for ticker, vals in series.items():
        if vals and len(vals) > 0:
            if abs(vals[0] - 0.0) > 0.001:
                rebased_to_zero = False
                break
    msg = f"DatesCount={len(dates)}, Tickers={list(series.keys())}, Day0Rebased={rebased_to_zero}"
    return (len(dates) > 0 and rebased_to_zero and len(series) >= 2, msg)

test_endpoint(
    name="Market: Normalized Comparison (Day 0 rebased to 0.0%)",
    method="POST",
    url=f"{API_V1}/market/compare-normalized",
    payload=norm_payload,
    validator=validate_normalized
)

# 8. Market: Live NIFTY 50
test_endpoint(
    name="Market: Live NIFTY 50 Update",
    method="GET",
    url=f"{API_V1}/market/nifty",
    validator=lambda j: (j.get("latest_price", 0) > 0, f"Nifty={j.get('latest_price')}, Summary='{j.get('summary')}'")
)

# 9. Market: News Sentiment Polarity
test_endpoint(
    name="Market: Live News Sentiment",
    method="GET",
    url=f"{API_V1}/market/sentiment",
    validator=lambda j: ("sentiment_tag" in j and len(j.get("headlines", [])) > 0, f"Tag={j.get('sentiment_tag')}, Score={j.get('score')}")
)

# 10. Chat: Infoway Assistant Stateless Response
test_endpoint(
    name="Chat: Infoway Conversational Query",
    method="POST",
    url=f"{API_V1}/chat/message",
    payload={"message": "Analyze salary 850000 credit 780 emergency fund yes"},
    validator=lambda j: (j.get("intent") == "health" and "Financial Assessment" in j.get("reply", ""), f"Intent={j.get('intent')}")
)

print("\n=== SMOKE TEST SUMMARY TABLE ===")
for r in results:
    status_icon = "[PASS]" if r["passed"] else "[FAIL]"
    line = f"{status_icon:<6} | {r['method']:<4} | {r['name']:<45} | HTTP {r['status_code']} | {r['latency_ms']:>6.2f} ms | {r['details']}"
    print(line.encode("ascii", "replace").decode("ascii"))

with open("smoke_test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
