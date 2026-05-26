import type { ForecastAssumption, MediaPlan, ValidationIssue, WizardState } from "@mpa/shared";

const sumWithinTolerance = (sum: number, target: number, tolerance = 0.5) =>
  Math.abs(sum - target) <= tolerance;

export function validateWizardStep1(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!w.name?.trim()) issues.push({ code: "name_required", severity: "error", field: "name", message: "Plan name is required." });
  if (!w.planningStart) issues.push({ code: "start_required", severity: "error", field: "planningStart", message: "Planning start date is required." });
  if (!w.planningEnd) issues.push({ code: "end_required", severity: "error", field: "planningEnd", message: "Planning end date is required." });
  if (w.planningStart && w.planningEnd && new Date(w.planningEnd) <= new Date(w.planningStart)) {
    issues.push({ code: "end_after_start", severity: "error", field: "planningEnd", message: "End date must be after start date." });
  }
  if (!w.totalBudget || w.totalBudget <= 0) {
    issues.push({ code: "budget_positive", severity: "error", field: "totalBudget", message: "Total budget must be greater than 0." });
  }
  if (w.agencyFeePct < 0 || w.agencyFeePct > 25) {
    issues.push({ code: "fee_range", severity: "error", field: "agencyFeePct", message: "Agency fee must be between 0% and 25%." });
  }
  return issues;
}

export function validateWizardStep2(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (w.geographies.length === 0) {
    issues.push({ code: "no_geo", severity: "error", message: "Select or add at least one geography group." });
    return issues;
  }
  const sum = w.geographies.reduce((s, g) => s + (g.budgetShare || 0), 0);
  if (!sumWithinTolerance(sum, 100)) {
    issues.push({
      code: "geo_share_sum",
      severity: "error",
      message: `Geography budget shares must sum to 100%. Currently ${sum.toFixed(1)}%.`,
    });
  }
  return issues;
}

export function validateWizardStep3(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!w.objective) issues.push({ code: "objective_required", severity: "error", message: "Select a primary objective." });
  if (!w.primaryKPI) issues.push({ code: "kpi_required", severity: "error", message: "Select a primary KPI." });
  const funnelSum =
    w.funnelSplit.awareness +
    w.funnelSplit.consideration +
    w.funnelSplit.decision +
    w.funnelSplit.lead_gen;
  if (!sumWithinTolerance(funnelSum, 100)) {
    issues.push({
      code: "funnel_sum",
      severity: "error",
      message: `Funnel split must sum to 100%. Currently ${funnelSum.toFixed(1)}%.`,
    });
  }
  return issues;
}

export function validateWizardStep4(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const enabled = w.platforms.filter((p) => p.enabled);
  if (enabled.length === 0) {
    issues.push({ code: "no_platforms", severity: "error", message: "Enable at least one platform." });
    return issues;
  }
  const sum = enabled.reduce((s, p) => s + (p.budgetShare || 0), 0);
  if (!sumWithinTolerance(sum, 100)) {
    issues.push({
      code: "platform_share_sum",
      severity: "error",
      message: `Platform budget shares must sum to 100%. Currently ${sum.toFixed(1)}%.`,
    });
  }
  return issues;
}

export function validateWizardStep5(w: WizardState): ValidationIssue[] {
  return validateAssumptions(w.assumptions);
}

export function validateAssumptions(assumptions: ForecastAssumption[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const a of assumptions) {
    if (a.cpm <= 0) issues.push({ code: "cpm_positive", severity: "error", message: `CPM must be > 0 (${a.platform}).` });
    const inRange = (v: number) => v >= 0 && v <= 1;
    if (!inRange(a.ctr)) issues.push({ code: "ctr_range", severity: "error", message: `CTR must be 0–1 (${a.platform}).` });
    if (!inRange(a.lpvRate)) issues.push({ code: "lpv_range", severity: "error", message: `LPV rate must be 0–1 (${a.platform}).` });
    if (!inRange(a.cvr)) issues.push({ code: "cvr_range", severity: "error", message: `CVR must be 0–1 (${a.platform}).` });
    if (a.vtr !== undefined && !inRange(a.vtr)) issues.push({ code: "vtr_range", severity: "error", message: `VTR must be 0–1 (${a.platform}).` });
    if (a.ctr > 0.15) issues.push({ code: "ctr_unrealistic", severity: "warning", message: `CTR ${(a.ctr * 100).toFixed(1)}% looks unusually high (${a.platform}).` });
    if (a.cvr > 0.2) issues.push({ code: "cvr_unrealistic", severity: "warning", message: `CVR ${(a.cvr * 100).toFixed(1)}% looks unusually high (${a.platform}).` });
  }
  return issues;
}

export function validatePlan(plan: MediaPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (plan.totalBudget <= 0) issues.push({ code: "budget_positive", severity: "error", message: "Total budget must be > 0." });
  const geoSum = plan.geographies.reduce((s, g) => s + g.budgetShare, 0);
  if (!sumWithinTolerance(geoSum, 100)) {
    issues.push({ code: "geo_share_sum", severity: "error", message: `Geography shares sum to ${geoSum.toFixed(1)}%; should be 100%.` });
  }
  const enabled = plan.platforms.filter((p) => p.enabled);
  const platSum = enabled.reduce((s, p) => s + p.budgetShare, 0);
  if (!sumWithinTolerance(platSum, 100)) {
    issues.push({ code: "platform_share_sum", severity: "error", message: `Platform shares sum to ${platSum.toFixed(1)}%; should be 100%.` });
  }
  return [...issues, ...validateAssumptions(plan.assumptions)];
}
