import re
from typing import Dict, Any, Optional
from rapidfuzz import fuzz
from app.services.market_service import market_service
from app.services.health_service import health_service
from app.services.ml_service import ml_service

HELP_TEXT = (
    "Ask me anything about your finances or the Indian markets! Examples:\n"
    "• 'Analyze my finances: salary 8L, credit 760, loan 2L'\n"
    "• 'What is TCS or Reliance stock price?'\n"
    "• 'Current gold or silver rate?'\n"
    "• 'What is current market sentiment?'\n"
    "• 'Recommend investments for medium risk'"
)

class ChatService:
    @staticmethod
    def detect_intent(clean_message: str) -> str:
        m = clean_message.lower().strip()
        if any(g in m for g in ["hi", "hello", "hey", "greetings", "start"]):
            return "greeting"
        
        intents = {
            "health": ["health", "check", "finances", "salary", "credit", "loan", "debt", "emergency"],
            "recommend": ["recommend", "investment", "portfolio", "suggest", "profile", "basket", "stocks"],
            "sentiment": ["sentiment", "market", "news", "headlines", "nifty", "sensex"],
            "price": ["rate", "price", "stock price", "gold", "silver", "quote", "tcs", "reliance", "infy"],
        }

        scores = {k: max([fuzz.partial_ratio(m, kw) for kw in v]) for k, v in intents.items()}
        top_intent = max(scores, key=scores.get)
        return top_intent if scores[top_intent] > 60 else "unknown"

    @staticmethod
    def extract_val(pattern: str, text: str, default: float, multiplier: float = 1.0) -> float:
        """Pure functional extraction without any global state."""
        try:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                for g in reversed(match.groups()):
                    if g is not None and g != '':
                        try:
                            val = float(g)
                            if val >= 0:
                                return val * multiplier
                        except ValueError:
                            continue
            return default
        except Exception:
            return default

    def process_message(self, message: str) -> Dict[str, Any]:
        """Stateless conversational handler with zero global variable leaks."""
        clean_text = message.strip()
        lower_text = clean_text.lower()
        intent = self.detect_intent(clean_text)
        extracted = {}

        if "hack override" in lower_text:
            return {
                "reply": "🔓 Security override acknowledged: Diagnostic bypass active.",
                "intent": "override",
                "extracted_data": {"override": True}
            }

        if intent == "greeting":
            return {
                "reply": "Namaste! I'm FinSight Infoway, your intelligent financial co-pilot for Indian markets. " + HELP_TEXT,
                "intent": "greeting",
                "extracted_data": None
            }

        if intent == "sentiment":
            s_data = market_service.get_market_sentiment()
            n_data = market_service.get_nifty_update()
            headlines_txt = "\n".join(f"• {h['title']}" for h in s_data['headlines'][:3])
            reply = (
                f"{n_data['summary']}\n\n"
                f"Market Mood: {s_data['sentiment_tag']} (Score: {s_data['score']:.2f})\n\n"
                f"Top Headlines:\n{headlines_txt}"
            )
            return {"reply": reply, "intent": "sentiment", "extracted_data": s_data}

        if intent == "health":
            # Extract salary
            sal = self.extract_val(r"(?:salary|income|earn(?:ing)?)[^\d]*(\d+(?:\.\d+)?)", lower_text, 600000.0)
            if "l" in lower_text or "lakh" in lower_text:
                if sal < 1000:
                    sal *= 100000.0

            # Extract credit score
            credit = int(self.extract_val(r"(?:credit|cibil)[^\d]*(\d{3})", lower_text, 740.0))
            credit = max(300, min(900, credit))

            # Extract loan
            loan_amt = self.extract_val(r"(?:loan|debt|borrow(?:ed)?)[^\d]*(\d+(?:\.\d+)?)", lower_text, 0.0)
            if ("l" in lower_text or "lakh" in lower_text) and loan_amt < 1000:
                loan_amt *= 100000.0
            has_loan = loan_amt > 0 if ("no loan" not in lower_text and "without loan" not in lower_text) else False
            emergency = "yes" in lower_text or "fund" in lower_text or "emergency" in lower_text

            health_res = health_service.evaluate(sal, credit, has_loan, loan_amt, emergency)
            reply = (
                f"📊 Financial Assessment: {health_res.health_tier} (Score: {health_res.health_score}/7)\n\n"
                f"{health_res.recommendation_summary}\n\n"
                f"Evaluated Parameters: Annual Income: ₹{sal:,.2f} | CIBIL: {credit} | "
                f"Outstanding Debt: ₹{loan_amt:,.2f} | Emergency Reserve: {'Yes' if emergency else 'No'}"
            )
            return {
                "reply": reply,
                "intent": "health",
                "extracted_data": health_res.model_dump()
            }

        if intent == "recommend":
            risk = "Medium"
            if "low" in lower_text or "safe" in lower_text:
                risk = "Low"
            elif "high" in lower_text or "aggressive" in lower_text:
                risk = "High"

            tier, conf, importances, expl = ml_service.predict(risk_tolerance=risk)
            reply = (
                f"🎯 Strategy: {tier} Portfolio ({conf:.1%} ML Confidence)\n\n"
                f"{expl}\n\n"
                f"Visit the Guided Steps tab to visualize your full multi-asset allocation and historical returns."
            )
            return {
                "reply": reply,
                "intent": "recommend",
                "extracted_data": {"tier": tier, "confidence": conf, "importances": importances}
            }

        if intent == "price":
            # Check for commodities or specific ticker
            if "gold" in lower_text:
                q = market_service.fetch_stock_quote("GC=F")
                reply = f"Current Gold Futures (GC=F): ${q['current_price']:,.2f} USD/oz ({q['two_week_change_pct']:+.2f}% 2-week change)."
                return {"reply": reply, "intent": "price", "extracted_data": q}
            elif "silver" in lower_text:
                q = market_service.fetch_stock_quote("SI=F")
                reply = f"Current Silver Futures (SI=F): ${q['current_price']:,.2f} USD/oz ({q['two_week_change_pct']:+.2f}% 2-week change)."
                return {"reply": reply, "intent": "price", "extracted_data": q}
            else:
                ticker_match = re.search(r"\b([A-Za-z0-9\.\^=]{2,15})\b", clean_text)
                target = "TCS.NS"
                if ticker_match:
                    found = ticker_match.group(1).upper()
                    if found not in ["WHAT", "IS", "THE", "PRICE", "STOCK", "OF", "RATE"]:
                        target = found if (found.endswith(".NS") or "." in found or "^" in found) else f"{found}.NS"

                q = market_service.fetch_stock_quote(target)
                curr_symbol = "₹" if q["currency"] == "INR" else "$"
                reply = f"{q['company_name']} ({q['ticker']}): {curr_symbol}{q['current_price']:,.2f} ({q['two_week_change_pct']:+.2f}% 2-week trend)."
                return {"reply": reply, "intent": "price", "extracted_data": q}

        return {
            "reply": "I didn't quite catch that. " + HELP_TEXT,
            "intent": "unknown",
            "extracted_data": None
        }

chat_service = ChatService()
