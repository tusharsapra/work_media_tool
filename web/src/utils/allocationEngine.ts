import type { Objective, Platform, PlatformPlan } from "@mpa/shared";
import { PLATFORMS } from "@/data/defaults";
import { uid } from "@/lib/utils";

export interface AllocationRecommendation {
  platform: Platform;
  budgetShare: number; // 0–100
}

/**
 * Generic objective-driven default allocations. Industry tunes at the margin
 * (e.g., B2B SaaS lifts LinkedIn; D2C lifts Meta) — never vertical-locked.
 * Retargeting is intentionally NOT a platform; it's a tactic applied within
 * Meta/Google/LinkedIn/YouTube in Phase 6's audience layer.
 */
const ALLOCATION_BY_OBJECTIVE: Record<Objective, Partial<Record<Platform, number>>> = {
  awareness: { meta: 30, youtube: 25, google_display: 15, google_demand_gen: 15, tiktok: 15 },
  reach: { meta: 30, youtube: 25, google_display: 20, programmatic: 15, tiktok: 10 },
  video_views: { youtube: 40, meta: 25, tiktok: 20, google_demand_gen: 15 },
  traffic: { meta: 35, google_search: 25, google_demand_gen: 15, google_display: 15, tiktok: 10 },
  lpv: { google_search: 35, meta: 30, google_demand_gen: 15, linkedin: 10, bing: 10 },
  lead_gen: { google_search: 30, meta: 35, linkedin: 15, google_demand_gen: 10, bing: 10 },
  registration: { google_search: 30, meta: 30, linkedin: 15, google_demand_gen: 15, bing: 10 },
  revenue: { google_search: 30, google_pmax: 25, meta: 25, programmatic: 10, bing: 10 },
  app_installs: { meta: 35, google_pmax: 30, tiktok: 25, youtube: 10 },
  store_visits: { meta: 30, google_search: 25, google_pmax: 20, youtube: 15, programmatic: 10 },
  custom: { meta: 40, google_search: 30, linkedin: 15, google_demand_gen: 15 },
};

/**
 * Apply lightweight industry adjusters as percentage-point shifts.
 * Keep the rules generic; never vertical-locked.
 */
function applyIndustryAdjusters(
  base: Partial<Record<Platform, number>>,
  industry?: string
): Partial<Record<Platform, number>> {
  if (!industry) return base;
  const adjusted: Partial<Record<Platform, number>> = { ...base };
  const bump = (p: Platform, delta: number) => {
    adjusted[p] = (adjusted[p] ?? 0) + delta;
  };
  switch (industry) {
    case "B2B SaaS":
      bump("linkedin", 10);
      bump("meta", -5);
      bump("tiktok", -5);
      break;
    case "E-Commerce / D2C":
      bump("meta", 5);
      bump("google_pmax", 5);
      bump("linkedin", -5);
      break;
    case "BFSI":
      bump("google_search", 5);
      bump("linkedin", 3);
      bump("tiktok", -5);
      break;
    case "Healthcare":
      bump("google_search", 5);
      bump("tiktok", -5);
      break;
    case "Real Estate":
      bump("meta", 5);
      bump("google_search", 5);
      bump("youtube", -5);
      break;
    default:
      break;
  }
  return adjusted;
}

/**
 * Returns an allocation array for the platforms the user has enabled.
 * Re-normalizes to 100% so we never recommend more than the available budget.
 */
export function recommendAllocation(
  objective: Objective,
  enabledPlatforms: Platform[],
  industry?: string
): AllocationRecommendation[] {
  const base = applyIndustryAdjusters(ALLOCATION_BY_OBJECTIVE[objective], industry);
  const filtered = enabledPlatforms.map((p) => ({ platform: p, raw: base[p] ?? 0 }));

  // If none of the enabled platforms appear in the default mix, distribute evenly.
  const rawSum = filtered.reduce((s, x) => s + x.raw, 0);
  if (rawSum === 0) {
    const even = 100 / Math.max(enabledPlatforms.length, 1);
    return enabledPlatforms.map((p) => ({ platform: p, budgetShare: even }));
  }

  return filtered.map((x) => ({
    platform: x.platform,
    budgetShare: (x.raw / rawSum) * 100,
  }));
}

/**
 * Convert percentage allocations + the net media budget into PlatformPlan rows.
 */
export function applyAllocationToBudget(
  netBudget: number,
  allocations: AllocationRecommendation[]
): PlatformPlan[] {
  return allocations.map((a) => {
    const info = PLATFORMS.find((p) => p.id === a.platform);
    return {
      id: uid("plat"),
      platform: a.platform,
      funnelStage: info?.defaultFunnelStage ?? "consideration",
      dealType: info?.defaultDealType ?? "CPM",
      primaryKPI: "",
      budgetShare: a.budgetShare,
      budget: (netBudget * a.budgetShare) / 100,
      enabled: true,
    };
  });
}
