import type { MediaPlan } from "@mpa/shared";
import { PLATFORMS } from "@/data/defaults";
import { calculatePlanTotals } from "./forecastEngine";
import { formatCurrency, formatNumber } from "./formatters";
import { safeDivide } from "@/lib/utils";

const platformLabel = (id: string) => PLATFORMS.find((p) => p.id === id)?.label ?? id;

/** Rule-based (NOT LLM) executive narrative for the dashboard + Excel summary. */
export function generatePlanSummary(plan: MediaPlan): string {
  const enabled = plan.platforms.filter((p) => p.enabled);
  const platformCount = enabled.length;
  const geoCount = plan.geographies.length;
  const totals = calculatePlanTotals(plan.rows);

  // Top two platforms by budget.
  const byPlatformBudget = new Map<string, number>();
  plan.rows.forEach((r) => byPlatformBudget.set(r.platform, (byPlatformBudget.get(r.platform) ?? 0) + r.budget));
  const topPlatforms = [...byPlatformBudget.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([p]) => platformLabel(p));

  // Fragmentation heuristic: many platforms/geos relative to budget.
  const monthlyPerCell = safeDivide(
    plan.netMediaBudget,
    Math.max(platformCount * geoCount, 1)
  );
  let fragmentation = "well-consolidated";
  if (platformCount * geoCount >= 12 || monthlyPerCell < 50000) fragmentation = "moderately fragmented";
  if (platformCount * geoCount >= 24 || monthlyPerCell < 20000) fragmentation = "highly fragmented";

  const carriers =
    topPlatforms.length > 0
      ? `${topPlatforms.join(" and ")} carrying the primary volume`
      : "no platforms enabled yet";

  const outcome =
    totals.leads > 0
      ? `an expected ${formatNumber(totals.leads)} leads at a blended ${formatCurrency(totals.blendedCPL, plan.currency)} CPL`
      : `${formatNumber(totals.clicks)} expected clicks`;

  const tail =
    fragmentation === "well-consolidated"
      ? "The structure is well-consolidated for stable learning."
      : `The current structure is ${fragmentation}, so platform and geography splits should be reviewed before launch.`;

  return `This plan allocates ${formatCurrency(plan.netMediaBudget, plan.currency)} across ${platformCount} ${platformCount === 1 ? "platform" : "platforms"} and ${geoCount} ${geoCount === 1 ? "geography group" : "geography groups"}, with ${carriers} — driving ${outcome}. ${tail}`;
}

export type GeoRecommendation = "Scale" | "Maintain" | "Watch" | "Test";

/**
 * Rule-based geography recommendation:
 * - High CPL (vs plan blended) → Watch
 * - Low budget + low/new priority → Test
 * - Low CPL + healthy budget → Scale
 * - otherwise → Maintain
 */
export function getGeographyRecommendation(params: {
  budgetShare: number;
  cpl: number;
  blendedCpl: number;
  priority?: "high" | "medium" | "low";
}): GeoRecommendation {
  const { budgetShare, cpl, blendedCpl, priority } = params;
  const cplRatio = blendedCpl > 0 ? cpl / blendedCpl : 1;

  if (cpl > 0 && cplRatio > 1.25) return "Watch";
  if (budgetShare < 12 && (priority === "low" || priority === undefined)) return "Test";
  if (cpl > 0 && cplRatio <= 0.9 && budgetShare >= 20) return "Scale";
  return "Maintain";
}

export const GEO_REC_VARIANT: Record<GeoRecommendation, "success" | "primary" | "warning" | "ai"> = {
  Scale: "success",
  Maintain: "primary",
  Watch: "warning",
  Test: "ai",
};

/** Generic, vertical-agnostic "why included" reason per platform + funnel role. */
export function platformWhyIncluded(platform: string, funnel: string): string {
  switch (platform) {
    case "google_search":
    case "bing":
      return "Captures high-intent demand at the bottom of the funnel.";
    case "google_pmax":
      return "Automated, conversion-focused reach across Google inventory.";
    case "meta":
      return funnel === "awareness"
        ? "Efficient reach and frequency across Facebook and Instagram."
        : "Builds scale and nurtures interest with flexible targeting.";
    case "youtube":
      return "Supports awareness and video reach, lifting brand recall.";
    case "linkedin":
      return "Reaches professional and high-value audiences with precise targeting.";
    case "tiktok":
      return "Useful for awareness and reaching younger audiences for testing.";
    case "google_demand_gen":
      return "Drives consideration with visually engaging, intent-adjacent placements.";
    case "google_display":
    case "programmatic":
      return "Expands reach through premium and programmatic inventory.";
    case "direct_publishers":
    case "partner_inventory":
      return "Adds category-relevant reach via direct or partner inventory.";
    default:
      return "Selected for funnel coverage relevant to the objective.";
  }
}

export const FUNNEL_ROLE_LABEL: Record<string, string> = {
  awareness: "Top of funnel",
  consideration: "Mid of funnel",
  decision: "Bottom of funnel",
  lead_gen: "Lead gen",
  retention: "Retention",
};
