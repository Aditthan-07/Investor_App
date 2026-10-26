/**
 * Utility formatters for Indian financial numbers and currencies.
 */

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatIndianCurrencyPreview(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return "₹0 / yr";
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr} Cr / yr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹${lk} Lakhs / yr`;
  }
  return `₹${amount.toLocaleString("en-IN")} / yr`;
}

export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0.00%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

export function getCibilCategory(score: number): { label: string; color: string } {
  if (score >= 750) return { label: "Excellent", color: "#10B981" };
  if (score >= 700) return { label: "Good", color: "#C5A880" };
  if (score >= 600) return { label: "Fair", color: "#F59E0B" };
  return { label: "Poor", color: "#EF4444" };
}
