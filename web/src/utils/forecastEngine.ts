import type { BudgetWarning, ForecastAssumption, MediaPlanRow } from "@mpa/shared";
import { safeDivide } from "@/lib/utils";

export interface ForecastResult {
  impressions: number;
  reach?: number;
  frequency?: number;
  views?: number;
  clicks: number;
  lpvs: number;
  leads: number;
  registrations?: number;
  qualifiedLeads?: number;
  cpm: number;
  ctr: number;
  cpc: number;
  cpl: number;
  cpr?: number;
  cpql?: number;
}

/**
 * Compute forecast volumes and cost-per-KPI from a budget and an assumption set.
 * All formulas use safeDivide so empty assumption rows never produce NaN/Infinity.
 */
export function calculateForecast(budget: number, a: ForecastAssumption): ForecastResult {
  const impressions = safeDivide(budget, a.cpm) * 1000;
  const clicks = impressions * a.ctr;
  const views = a.vtr !== undefined ? impressions * a.vtr : undefined;
  const lpvs = clicks * a.lpvRate;
  const leads = lpvs * a.cvr;
  const registrations =
    a.registrationRate !== undefined ? lpvs * a.registrationRate : undefined;
  const qualifiedLeads = a.qualifiedRate !== undefined ? leads * a.qualifiedRate : undefined;

  const cpc = safeDivide(budget, clicks);
  const cpl = safeDivide(budget, leads);
  const cpr = registrations !== undefined ? safeDivide(budget, registrations) : undefined;
  const cpql = qualifiedLeads !== undefined ? safeDivide(budget, qualifiedLeads) : undefined;

  return {
    impressions,
    views,
    clicks,
    lpvs,
    leads,
    registrations,
    qualifiedLeads,
    cpm: a.cpm,
    ctr: a.ctr,
    cpc,
    cpl,
    cpr,
    cpql,
  };
}

export interface PlanTotals {
  budget: number;
  impressions: number;
  clicks: number;
  views: number;
  lpvs: number;
  leads: number;
  registrations: number;
  qualifiedLeads: number;
  blendedCPM: number;
  blendedCTR: number;
  blendedCPC: number;
  blendedCPL: number;
  blendedCPR: number;
  blendedCPQL: number;
}

export function calculatePlanTotals(rows: MediaPlanRow[]): PlanTotals {
  const totals = rows.reduce(
    (acc, r) => {
      acc.budget += r.budget;
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.views += r.views ?? 0;
      acc.lpvs += r.lpvs;
      acc.leads += r.leads;
      acc.registrations += r.registrations ?? 0;
      acc.qualifiedLeads += r.qualifiedLeads ?? 0;
      return acc;
    },
    {
      budget: 0,
      impressions: 0,
      clicks: 0,
      views: 0,
      lpvs: 0,
      leads: 0,
      registrations: 0,
      qualifiedLeads: 0,
    }
  );

  return {
    ...totals,
    blendedCPM: safeDivide(totals.budget, totals.impressions) * 1000,
    blendedCTR: safeDivide(totals.clicks, totals.impressions),
    blendedCPC: safeDivide(totals.budget, totals.clicks),
    blendedCPL: safeDivide(totals.budget, totals.leads),
    blendedCPR: safeDivide(totals.budget, totals.registrations),
    blendedCPQL: safeDivide(totals.budget, totals.qualifiedLeads),
  };
}

export interface BuildRowParams {
  id: string;
  month: string;
  geographyId: string;
  geographyName: string;
  platform: ForecastAssumption["platform"];
  funnelStage: MediaPlanRow["funnelStage"];
  dealType: MediaPlanRow["dealType"];
  budget: number;
}

export function buildMediaPlanRow(
  params: BuildRowParams,
  assumption: ForecastAssumption
): MediaPlanRow {
  const f = calculateForecast(params.budget, assumption);
  return {
    id: params.id,
    month: params.month,
    geographyId: params.geographyId,
    geographyName: params.geographyName,
    platform: params.platform,
    funnelStage: params.funnelStage,
    dealType: params.dealType,
    budget: params.budget,
    impressions: f.impressions,
    views: f.views,
    clicks: f.clicks,
    lpvs: f.lpvs,
    leads: f.leads,
    registrations: f.registrations,
    qualifiedLeads: f.qualifiedLeads,
    cpm: f.cpm,
    ctr: f.ctr,
    cpc: f.cpc,
    cpl: f.cpl,
    cpr: f.cpr,
    cpql: f.cpql,
  };
}

export type PhasingPattern = "even" | "ramp_up" | "ramp_down" | "peak_mid";

/**
 * Returns a Record<month, monthlyBudget> that sums to netBudget.
 * For Phase 1 we only use "even"; other patterns are wired for later phases.
 */
export function generateMonthlyPhasing(
  netBudget: number,
  months: string[],
  pattern: PhasingPattern = "even"
): Record<string, number> {
  const n = months.length;
  if (n === 0) return {};
  const out: Record<string, number> = {};

  let weights: number[];
  switch (pattern) {
    case "ramp_up":
      weights = months.map((_, i) => i + 1);
      break;
    case "ramp_down":
      weights = months.map((_, i) => n - i);
      break;
    case "peak_mid": {
      const mid = (n - 1) / 2;
      weights = months.map((_, i) => n - Math.abs(i - mid));
      break;
    }
    case "even":
    default:
      weights = months.map(() => 1);
  }
  const weightSum = weights.reduce((s, w) => s + w, 0);
  months.forEach((m, i) => {
    out[m] = (netBudget * weights[i]) / weightSum;
  });
  return out;
}

export function generateBudgetWarnings(
  netBudget: number,
  platformCount: number,
  geoCount: number,
  months: number
): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];
  const monthlyBudget = netBudget / Math.max(months, 1);
  const perPlatformMonthly = monthlyBudget / Math.max(platformCount, 1);

  if (perPlatformMonthly < 500) {
    warnings.push({
      code: "platform_budget_too_small",
      severity: "warning",
      message: `Average monthly budget per platform is ${Math.round(perPlatformMonthly)}. Consider reducing the number of platforms or increasing the budget to stay above the learning threshold.`,
    });
  }

  if (platformCount > 7) {
    warnings.push({
      code: "too_many_platforms",
      severity: "warning",
      message: `${platformCount} platforms enabled. Fragmenting the budget across this many channels can reduce learning velocity. Consider consolidating.`,
    });
  }

  if (geoCount > 6 && netBudget / geoCount < 5000) {
    warnings.push({
      code: "geo_fragmentation",
      severity: "warning",
      message: `${geoCount} geography groups may fragment the budget. Consider grouping regions to improve learning.`,
    });
  }

  if (platformCount === 1) {
    warnings.push({
      code: "single_platform",
      severity: "info",
      message: "Only one platform is enabled. Consider adding a complementary channel to balance funnel coverage.",
    });
  }

  return warnings;
}
