import type { ForecastAssumption, MediaPlan, ValidationIssue, WizardState } from "@mpa/shared";

const sumWithinTolerance = (sum: number, target: number, tolerance = 0.5) =>
  Math.abs(sum - target) <= tolerance;

const shareGap = (sum: number) => {
  const diff = 100 - sum;
  if (diff > 0) return `Add ${diff.toFixed(1)}% more`;
  return `Remove ${Math.abs(diff).toFixed(1)}%`;
};

export function validateWizardStep1(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!w.name?.trim())
    issues.push({ code: "name_required", severity: "error", field: "name", message: "Add a plan name before continuing." });
  if (!w.currency)
    issues.push({ code: "currency_required", severity: "error", field: "currency", message: "Select a currency for this plan." });
  if (!w.planningStart)
    issues.push({ code: "start_required", severity: "error", field: "planningStart", message: "Choose a planning start date." });
  if (!w.planningEnd)
    issues.push({ code: "end_required", severity: "error", field: "planningEnd", message: "Choose a planning end date." });
  if (w.planningStart && w.planningEnd && new Date(w.planningEnd) <= new Date(w.planningStart)) {
    issues.push({ code: "end_after_start", severity: "error", field: "planningEnd", message: "End date should be after the start date." });
  }
  if (!w.totalBudget || w.totalBudget <= 0) {
    issues.push({ code: "budget_positive", severity: "error", field: "totalBudget", message: "Add the total media budget before continuing." });
  }
  return issues;
}

export function validateWizardStep2(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (w.geographies.length === 0) {
    issues.push({ code: "no_geo", severity: "error", message: "Add at least one geography group to continue." });
    return issues;
  }
  const unnamed = w.geographies.filter((g) => !g.name.trim()).length;
  if (unnamed > 0) {
    issues.push({ code: "geo_unnamed", severity: "error", message: `Name every geography group — ${unnamed} still need a name.` });
  }
  const sum = w.geographies.reduce((s, g) => s + (g.budgetShare || 0), 0);
  if (!sumWithinTolerance(sum, 100)) {
    issues.push({
      code: "geo_share_sum",
      severity: "error",
      message: `Geography split must total 100%. You're currently at ${sum.toFixed(1)}%. ${shareGap(sum)} or use "Normalize to 100%".`,
    });
  }
  return issues;
}

export function validateWizardStep3(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!w.objective) issues.push({ code: "objective_required", severity: "error", message: "Pick a primary objective." });
  if (!w.primaryKPI) issues.push({ code: "kpi_required", severity: "error", message: "Pick a primary KPI." });
  const funnelSum =
    w.funnelSplit.awareness +
    w.funnelSplit.consideration +
    w.funnelSplit.decision +
    w.funnelSplit.lead_gen;
  if (!sumWithinTolerance(funnelSum, 100)) {
    issues.push({
      code: "funnel_sum",
      severity: "error",
      message: `Funnel split must total 100%. You're at ${funnelSum.toFixed(1)}%. ${shareGap(funnelSum)}.`,
    });
  }
  return issues;
}

export function validateWizardStep4(w: WizardState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const enabled = w.platforms.filter((p) => p.enabled);
  if (enabled.length === 0) {
    issues.push({ code: "no_platforms", severity: "error", message: "Turn on at least one platform to continue." });
    return issues;
  }
  const sum = enabled.reduce((s, p) => s + (p.budgetShare || 0), 0);
  if (!sumWithinTolerance(sum, 100)) {
    issues.push({
      code: "platform_share_sum",
      severity: "error",
      message: `Platform split must total 100%. You're at ${sum.toFixed(1)}%. ${shareGap(sum)} or use "Normalize to 100%".`,
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
