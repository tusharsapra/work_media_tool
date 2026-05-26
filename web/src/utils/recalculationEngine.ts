import type { ForecastAssumption, MediaPlan, MediaPlanRow } from "@mpa/shared";
import { buildMediaPlanRow } from "./forecastEngine";

/**
 * Recalculate every row in a plan that depends on the given assumption.
 * Assumptions are keyed by platform (and optionally geographyId).
 */
export function recalculateRowsForAssumption(
  rows: MediaPlanRow[],
  updated: ForecastAssumption
): MediaPlanRow[] {
  return rows.map((row) => {
    if (row.platform !== updated.platform) return row;
    if (updated.geographyId && row.geographyId !== updated.geographyId) return row;
    return buildMediaPlanRow(
      {
        id: row.id,
        month: row.month,
        geographyId: row.geographyId,
        geographyName: row.geographyName,
        platform: row.platform,
        funnelStage: row.funnelStage,
        dealType: row.dealType,
        budget: row.budget,
      },
      updated
    );
  });
}

export function updateAssumptionInPlan(
  plan: MediaPlan,
  assumptionId: string,
  patch: Partial<ForecastAssumption>
): MediaPlan {
  const assumption = plan.assumptions.find((a) => a.id === assumptionId);
  if (!assumption) return plan;
  const updated: ForecastAssumption = { ...assumption, ...patch, source: "user_override" };
  const newAssumptions = plan.assumptions.map((a) => (a.id === assumptionId ? updated : a));
  const newRows = recalculateRowsForAssumption(plan.rows, updated);
  return { ...plan, assumptions: newAssumptions, rows: newRows, updatedAt: new Date().toISOString() };
}
