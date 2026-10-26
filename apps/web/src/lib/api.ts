const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchNiftyUpdate() {
  const res = await fetch(`${BASE_URL}/market/nifty`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch NIFTY update");
  return res.json();
}

export async function fetchMarketSentiment() {
  const res = await fetch(`${BASE_URL}/market/sentiment`, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error("Failed to fetch market sentiment");
  return res.json();
}

export async function fetchStockQuote(ticker: string) {
  const res = await fetch(`${BASE_URL}/market/quote/${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error(`Failed to fetch quote for ${ticker}`);
  return res.json();
}

export async function evaluateFinancialHealth(data: {
  salary_inr: number;
  credit_score: number;
  has_loan: boolean;
  loan_amount: number;
  emergency_fund: boolean;
}) {
  const res = await fetch(`${BASE_URL}/health/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to evaluate health");
  return res.json();
}

export async function fetchRecommendations(data: {
  risk_tolerance: string;
  salary_inr?: number;
  has_loan?: boolean;
}) {
  const res = await fetch(`${BASE_URL}/recommend/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function fetchNormalizedComparison(tickers: string[]) {
  const res = await fetch(`${BASE_URL}/market/compare-normalized`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tickers, period: "2wk" }),
  });
  if (!res.ok) throw new Error("Failed to fetch normalized comparison");
  return res.json();
}

export async function searchStocks(query: string) {
  const res = await fetch(`${BASE_URL}/market/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendChatMessage(message: string) {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Chat query failed");
  return res.json();
}
