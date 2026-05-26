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
