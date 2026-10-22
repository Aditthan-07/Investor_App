import unittest
import math
import re

# Import logic tests
def inr(x):
    try:
        if x is None:
            return "?—"
        x = float(x)
        if math.isnan(x) or math.isinf(x):
            return "?—"
    except (ValueError, TypeError):
        return "?—"
    is_negative = x < 0
    absx = abs(x)
    sign = "-" if is_negative else ""
    if absx >= 1e7: return f"{sign}?{absx/1e7:.2f} Cr"
    if absx >= 1e5: return f"{sign}?{absx/1e5:.2f} L"
    return f"{sign}?{absx:,.2f}"

def validate_ticker(ticker):
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

class TestFinSightCore(unittest.TestCase):
    def test_inr_formatting(self):
        self.assertEqual(inr(0), "?0.00")
        self.assertEqual(inr(150000), "?1.50 L")
        self.assertEqual(inr(25000000), "?2.50 Cr")
        self.assertEqual(inr(-50000), "-?50,000.00")
        self.assertEqual(inr(None), "?—")

    def test_ticker_validation(self):
        self.assertTrue(validate_ticker("TCS.NS")[0])
        self.assertTrue(validate_ticker("RELIANCE.NS")[0])
        self.assertTrue(validate_ticker("^NSEI")[0])
        self.assertFalse(validate_ticker("")[0])
        self.assertFalse(validate_ticker("INVALID TICKER WITH SPACES")[0])

if __name__ == '__main__':
    unittest.main()
