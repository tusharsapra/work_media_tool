import type { Currency } from "@mpa/shared";
import { CURRENCIES } from "@/data/defaults";

const currencyLocale = (currency: Currency) =>
  CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-US";

export function formatCurrency(value: number, currency: Currency = "USD"): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number, currency: Currency = "USD"): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (!isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

// --- V2 currency-aware number formatting -------------------------------------------------------
// INR uses the Indian grouping system (1,00,000 / 10,00,000) via the en-IN locale;
// international currencies use standard thousands grouping (100,000 / 1,000,000).

/** Group a raw number using the currency's locale (no currency symbol). */
export function formatNumberByCurrency(value: number, currency?: Currency): string {
  if (!isFinite(value)) return "—";
  const locale = currency ? currencyLocale(currency) : "en-US";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

/** Format a value for a live text input (grouping only, no symbol). Empty string for 0/blank. */
export function formatCurrencyInput(value: number | null | undefined, currency?: Currency): string {
  if (value === null || value === undefined || value === 0 || !isFinite(value)) return "";
  return formatNumberByCurrency(value, currency);
}

/** Parse a formatted input string back to a raw number. Strips separators/symbols. */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return isFinite(n) ? n : 0;
}

/** Compact form for charts/cards (e.g. 1.2M, 3.4L for INR). */
export function formatCompactNumber(value: number, currency?: Currency): string {
  if (!isFinite(value)) return "—";
  if (currency === "INR") {
    if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
    if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return String(Math.round(value));
  }
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  );
}

/** Format a KPI value — currency for cost KPIs (CPL/CPC/CPM/CPR/CPQL), percent for rate KPIs, count otherwise. */
export function formatKPIValue(kpi: string, value: number, currency?: Currency): string {
  const key = kpi.toUpperCase();
  const costKpis = ["CPM", "CPC", "CPL", "CPR", "CPQL", "CPLPV", "CPV", "CAC", "CPI", "COST PER VISIT"];
  const rateKpis = ["CTR", "CVR", "VTR", "ROAS", "QUALIFICATION RATE", "REGISTRATION CVR"];
  if (costKpis.includes(key)) return formatCurrency(value, currency ?? "USD");
  if (rateKpis.includes(key)) return key === "ROAS" ? `${value.toFixed(2)}x` : formatPercent(value);
  return formatNumber(value);
}

export function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function monthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (cursor <= endDate) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.length > 0 ? months : [start.slice(0, 7)];
}

export function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
