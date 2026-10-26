import sys
import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def log_test(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    symbol = "OK" if passed else "ERR"
    print(f"[{symbol}] {status} - {name}: {detail}")
    return passed

def request_json(url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.getcode(), json.loads(response.read().decode("utf-8"))

def run_tests():
    print("=" * 60)
    print("FINSIGHT AI: LIVE SYSTEM VERIFICATION & SMOKE TEST SUITE")
    print("=" * 60)
    all_passed = True

    # 1. Healthcheck
    try:
        code, body = request_json(f"{BASE_URL}/healthz")
        p = code == 200 and body.get("status") == "healthy"
        all_passed = log_test("Backend Core Healthcheck (/healthz)", p, f"code={code}, status={body.get('status')}") and all_passed
    except Exception as e:
        all_passed = log_test("Backend Core Healthcheck (/healthz)", False, str(e)) and all_passed

    # 2. Market Nifty
    try:
        code, body = request_json(f"{BASE_URL}/api/v1/market/nifty")
        p = code == 200 and "latest_price" in body and body["latest_price"] > 0
        all_passed = log_test("Live Market Ticker (/api/v1/market/nifty)", p, f"price=INR {body.get('latest_price')}, change={body.get('change_pct')}%") and all_passed
    except Exception as e:
        all_passed = log_test("Live Market Ticker (/api/v1/market/nifty)", False, str(e)) and all_passed

    # 3. Solvency Health Evaluation
    try:
        payload = {
            "salary_inr": 1200000.0,
            "credit_score": 780,
            "has_loan": False,
            "loan_amount": 0.0,
            "emergency_fund": True
        }
        code, body = request_json(f"{BASE_URL}/api/v1/health/evaluate", method="POST", data=payload)
        p = code == 200 and body.get("health_tier") in ["Good", "Fair", "Poor"] and len(body.get("radar_metrics", [])) == 5
        detail = f"Tier={body.get('health_tier')}, Score={body.get('health_score')}/7, RadarMetricsCount={len(body.get('radar_metrics', []))}"
        all_passed = log_test("Solvency Evaluation (/api/v1/health/evaluate)", p, detail) and all_passed
    except Exception as e:
        all_passed = log_test("Solvency Evaluation (/api/v1/health/evaluate)", False, str(e)) and all_passed

    # 4. ML Recommendations across tiers
    for tier in ["Low", "Medium", "High"]:
        try:
            payload = {
                "risk_tolerance": tier,
                "salary_inr": 1200000.0,
                "has_loan": False
            }
            code, body = request_json(f"{BASE_URL}/api/v1/recommend/", method="POST", data=payload)
            stocks = body.get("recommended_stocks", [])
            p = code == 200 and body.get("confidence", 0) > 0 and len(stocks) > 0
            detail = f"Tier={tier} -> Profile={body.get('risk_profile')}, Conf={(body.get('confidence', 0)*100):.1f}%, Stocks={len(stocks)}"
            all_passed = log_test(f"ML Recommendation ({tier}) (/api/v1/recommend/)", p, detail) and all_passed
        except Exception as e:
            all_passed = log_test(f"ML Recommendation ({tier})", False, str(e)) and all_passed

    # 5. AI Co-Pilot Chat
    try:
        payload = {"message": "Analyze Reliance risk"}
        code, body = request_json(f"{BASE_URL}/api/v1/chat/message", method="POST", data=payload)
        reply = body.get("reply") or body.get("response", "")
        p = code == 200 and len(reply) > 5
        clean_snippet = reply.encode("ascii", "replace").decode("ascii")[:50]
        detail = f"Intent={body.get('intent')}, ReplySnippet={clean_snippet}..."
        all_passed = log_test("AI Co-Pilot NLP (/api/v1/chat/message)", p, detail) and all_passed
    except Exception as e:
        all_passed = log_test("AI Co-Pilot NLP (/api/v1/chat/message)", False, str(e)) and all_passed

    print("=" * 60)
    print("TEST EXECUTION COMPLETE: " + ("ALL PASSED" if all_passed else "SOME TESTS FAILED"))
    print("=" * 60)
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_tests())
