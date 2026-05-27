import ExcelJS from "exceljs";
import type { ClientWorkspace, MediaPlan, PlanningNotes } from "@mpa/shared";
import { calculatePlanTotals, generateBudgetWarnings } from "@/utils/forecastEngine";
import { formatMonth } from "@/utils/formatters";
import {
  generatePlanSummary,
  getGeographyRecommendation,
  platformWhyIncluded,
  FUNNEL_ROLE_LABEL,
} from "@/utils/insightEngine";
import { OBJECTIVES, PLATFORMS } from "@/data/defaults";

const GEO_PLAN_LABEL: Record<string, string> = {
  india: "India",
  global: "Global / International",
  custom: "Custom",
};
const INDIA_STRUCT_LABEL: Record<string, string> = {
  city: "City-level",
  state: "State-level",
  region: "Region-level",
  tier: "Tier-level",
  account_based: "Account-based / custom grouping",
};
import {
  CURRENCY_FORMAT,
  NUMBER_FORMAT,
  PERCENT_FORMAT,
  STYLE_BAD,
  STYLE_BODY,
  STYLE_GOOD,
  STYLE_HEADER,
  STYLE_LABEL,
  STYLE_MUTED_NOTE,
  STYLE_SECTION_HEADER,
  STYLE_TOTALS,
  STYLE_WATCH,
} from "./excelStyles";

const platformLabel = (id: string) => PLATFORMS.find((p) => p.id === id)?.label ?? id;
const objectiveLabel = (id: string) => OBJECTIVES.find((o) => o.id === id)?.label ?? id;

function applyHeaderStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => Object.assign(cell, STYLE_HEADER));
  row.height = 22;
}

function applyTotalsStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => Object.assign(cell, STYLE_TOTALS));
  row.height = 20;
}

export async function exportPlanToExcel(plan: MediaPlan, client: ClientWorkspace): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ARM Media Planning OS";
  wb.created = new Date();

  const currencyFormat = CURRENCY_FORMAT[plan.currency] ?? CURRENCY_FORMAT.USD;
  const totals = calculatePlanTotals(plan.rows);
  const warnings = generateBudgetWarnings(
    plan.netMediaBudget,
    plan.platforms.filter((p) => p.enabled).length,
    plan.geographies.length,
    new Set(plan.rows.map((r) => r.month)).size || 1
  );

  buildPlanningInputsSheet(wb, plan, client, currencyFormat);
  buildMonthlyMediaPlanSheet(wb, plan, currencyFormat);
  buildAssumptionsSheet(wb, plan);
  buildSummaryAndWarningsSheet(wb, plan, totals, warnings, currencyFormat);

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ----- Sheet 1: Planning Inputs -----------------------------------------------------------------
function buildPlanningInputsSheet(
  wb: ExcelJS.Workbook,
  plan: MediaPlan,
  client: ClientWorkspace,
  currencyFormat: string
) {
  const ws = wb.addWorksheet("Planning Inputs", { properties: { tabColor: { argb: "FF16A7E0" } } });
  ws.columns = [{ width: 28 }, { width: 50 }];

  const sectionRow = (title: string) => {
    const r = ws.addRow([title]);
    ws.mergeCells(`A${r.number}:B${r.number}`);
    r.eachCell((c) => Object.assign(c, STYLE_SECTION_HEADER));
    r.height = 22;
  };
  const kv = (label: string, value: string | number) => {
    const r = ws.addRow([label, value]);
    Object.assign(r.getCell(1), STYLE_LABEL);
    Object.assign(r.getCell(2), STYLE_BODY);
  };

  sectionRow("Project");
  kv("Project name", client.name);
  kv("Group", client.projectGroup === "bajaj" ? "Bajaj" : "Non-Bajaj");
  kv("Category", client.industry ?? "—");
  kv("Website", client.website ?? "—");
  if (client.projectContext) kv("Context", client.projectContext);

  ws.addRow([]);
  sectionRow("Plan");
  kv("Plan name", plan.name);
  kv("Type", plan.type);
  kv("Status", plan.status);
  kv("Currency", plan.currency);
  kv("Planning period", `${plan.planningStart} to ${plan.planningEnd}`);

  ws.addRow([]);
  sectionRow("Budget");
  const mediaRow = ws.addRow(["Media budget", plan.totalBudget]);
  Object.assign(mediaRow.getCell(1), STYLE_LABEL);
  mediaRow.getCell(2).numFmt = currencyFormat;
  Object.assign(mediaRow.getCell(2), STYLE_BODY);

  ws.addRow([]);
  sectionRow("Geography structure");
  kv("Plan type", GEO_PLAN_LABEL[plan.geographyPlanType ?? "custom"] ?? "Custom");
  if (plan.geographyPlanType === "india" && plan.indiaStructure) {
    kv("India structure", INDIA_STRUCT_LABEL[plan.indiaStructure] ?? plan.indiaStructure);
  }

  ws.addRow([]);
  sectionRow("Objective & KPIs");
  kv("Primary objective", objectiveLabel(plan.objective));
  kv("Primary KPI", plan.primaryKPI);
  if (plan.primaryKPITarget !== undefined) {
    kv("Primary KPI target", plan.primaryKPITarget);
  }
  kv("Secondary KPIs", plan.secondaryKPIs.join(", ") || "—");

  ws.addRow([]);
  sectionRow("Funnel split");
  kv("Awareness", `${plan.funnelSplit.awareness}%`);
  kv("Consideration", `${plan.funnelSplit.consideration}%`);
  kv("Decision", `${plan.funnelSplit.decision}%`);
  kv("Lead generation", `${plan.funnelSplit.lead_gen}%`);

  ws.addRow([]);
  sectionRow("Geographies");
  const geoHeader = ws.addRow(["Group", "Budget share", "Notes"]);
  applyHeaderStyle(geoHeader);
  plan.geographies.forEach((g) => {
    const r = ws.addRow([g.name, `${g.budgetShare.toFixed(1)}%`, g.notes ?? ""]);
    r.eachCell((c) => Object.assign(c, STYLE_BODY));
  });

  ws.addRow([]);
  sectionRow("Platforms");
  const platHeader = ws.addRow(["Platform", "Budget share / Allocation", "Notes"]);
  applyHeaderStyle(platHeader);
  plan.platforms
    .filter((p) => p.enabled)
    .forEach((p) => {
      const r = ws.addRow([platformLabel(p.platform), `${p.budgetShare.toFixed(1)}%`, p.notes ?? ""]);
      r.eachCell((c) => Object.assign(c, STYLE_BODY));
    });

  if (hasNotes(plan.notes)) {
    ws.addRow([]);
    sectionRow("Planning notes");
    addPlanningNotes(ws, plan.notes!, kv);
  }

  ws.addRow([]);
  const note = ws.addRow([`Generated by ARM Media Planning OS — ${new Date().toLocaleString()}`]);
  ws.mergeCells(`A${note.number}:B${note.number}`);
  Object.assign(note.getCell(1), STYLE_MUTED_NOTE);
}

const NOTE_LABELS: { key: keyof PlanningNotes; label: string }[] = [
  { key: "budgetRationale", label: "Budget rationale" },
  { key: "geographyRationale", label: "Geography rationale" },
  { key: "platformRationale", label: "Platform rationale" },
  { key: "assumptions", label: "Assumption notes" },
  { key: "internal", label: "Internal notes" },
  { key: "client", label: "Client notes" },
];

function hasNotes(notes?: PlanningNotes): boolean {
  return !!notes && NOTE_LABELS.some(({ key }) => (notes[key] ?? "").trim().length > 0);
}

function addPlanningNotes(
  ws: ExcelJS.Worksheet,
  notes: PlanningNotes,
  kv: (label: string, value: string | number) => void
) {
  NOTE_LABELS.forEach(({ key, label }) => {
    const v = (notes[key] ?? "").trim();
    if (v) kv(label, v);
  });
}

// ----- Sheet 2: Monthly Media Plan --------------------------------------------------------------
function buildMonthlyMediaPlanSheet(wb: ExcelJS.Workbook, plan: MediaPlan, currencyFormat: string) {
  const ws = wb.addWorksheet("Monthly Media Plan", {
    properties: { tabColor: { argb: "FF16A7E0" } },
    views: [{ state: "frozen", xSplit: 2, ySplit: 1 }],
  });

  const headers = [
    "Month",
    "Geography",
    "Platform",
    "Funnel",
    "Deal type",
    "Budget",
    "Impressions",
    "Clicks",
    "LPVs",
    "Leads",
    "Qualified leads",
    "CPM",
    "CTR",
    "CPC",
    "CPL",
  ];
  ws.columns = headers.map((h, i) => ({
    header: h,
    key: `c${i}`,
    width: i === 1 ? 22 : i === 2 ? 22 : 14,
  }));
  applyHeaderStyle(ws.getRow(1));
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  const target = plan.primaryKPITarget;
  const targetKpiIsCPL = (plan.primaryKPI || "").toUpperCase() === "CPL";

  plan.rows.forEach((row) => {
    const r = ws.addRow([
      formatMonth(row.month),
      row.geographyName,
      platformLabel(row.platform),
      row.funnelStage,
      row.dealType,
      row.budget,
      row.impressions,
      row.clicks,
      row.lpvs,
      row.leads,
      row.qualifiedLeads ?? 0,
      row.cpm,
      row.ctr,
      row.cpc,
      row.cpl,
    ]);
    r.eachCell((c) => Object.assign(c, STYLE_BODY));
    // Currency columns: F, L, N, O (Budget, CPM, CPC, CPL)
    [6, 12, 14, 15].forEach((col) => (r.getCell(col).numFmt = currencyFormat));
    // Number columns: G–K (Impressions through QL)
    [7, 8, 9, 10, 11].forEach((col) => (r.getCell(col).numFmt = NUMBER_FORMAT));
    // Percent: M (CTR)
    r.getCell(13).numFmt = PERCENT_FORMAT;

    // Conditional formatting on CPL column (col 15) against optional target
    if (targetKpiIsCPL && target !== undefined && target > 0) {
      if (row.cpl <= target) Object.assign(r.getCell(15), STYLE_GOOD);
      else if (row.cpl > target * 1.25) Object.assign(r.getCell(15), STYLE_BAD);
    }
  });

  // Totals row
  const totals = calculatePlanTotals(plan.rows);
  const totalsRow = ws.addRow([
    "TOTAL",
    "",
    "",
    "",
    "",
    totals.budget,
    totals.impressions,
    totals.clicks,
    totals.lpvs,
    totals.leads,
    totals.qualifiedLeads,
    totals.blendedCPM,
    totals.blendedCTR,
    totals.blendedCPC,
    totals.blendedCPL,
  ]);
  applyTotalsStyle(totalsRow);
  [6, 12, 14, 15].forEach((col) => (totalsRow.getCell(col).numFmt = currencyFormat));
  [7, 8, 9, 10, 11].forEach((col) => (totalsRow.getCell(col).numFmt = NUMBER_FORMAT));
  totalsRow.getCell(13).numFmt = PERCENT_FORMAT;
}

// ----- Sheet 3: Assumptions ---------------------------------------------------------------------
function buildAssumptionsSheet(wb: ExcelJS.Workbook, plan: MediaPlan) {
  const ws = wb.addWorksheet("Assumptions", {
    properties: { tabColor: { argb: "FF6D5DFB" } },
  });
  const headers = [
    "Platform",
    "Geography",
    "CPM",
    "CTR",
    "LPV rate",
    "CVR",
    "VTR",
    "Registration rate",
    "Qualified rate",
    "Source",
  ];
  ws.columns = headers.map((h) => ({ header: h, width: 18 }));
  applyHeaderStyle(ws.getRow(1));

  plan.assumptions.forEach((a) => {
    const geoName = a.geographyId
      ? plan.geographies.find((g) => g.id === a.geographyId)?.name ?? "—"
      : "All";
    const r = ws.addRow([
      platformLabel(a.platform),
      geoName,
      a.cpm,
      a.ctr,
      a.lpvRate,
      a.cvr,
      a.vtr ?? "",
      a.registrationRate ?? "",
      a.qualifiedRate ?? "",
      a.source.replace(/_/g, " "),
    ]);
    r.eachCell((c) => Object.assign(c, STYLE_BODY));
    r.getCell(3).numFmt = NUMBER_FORMAT;
    [4, 5, 6, 7, 8, 9].forEach((col) => (r.getCell(col).numFmt = PERCENT_FORMAT));
  });
}

// ----- Sheet 4: Summary & Warnings -------------------------------------------------------------
function buildSummaryAndWarningsSheet(
  wb: ExcelJS.Workbook,
  plan: MediaPlan,
  totals: ReturnType<typeof calculatePlanTotals>,
  warnings: ReturnType<typeof generateBudgetWarnings>,
  currencyFormat: string
) {
  const ws = wb.addWorksheet("Summary & Warnings", {
    properties: { tabColor: { argb: "FF22C55E" } },
  });
  ws.columns = [{ width: 28 }, { width: 30 }];

  const sectionRow = (title: string) => {
    const r = ws.addRow([title]);
    ws.mergeCells(`A${r.number}:B${r.number}`);
    r.eachCell((c) => Object.assign(c, STYLE_SECTION_HEADER));
    r.height = 22;
  };
  const kv = (label: string, value: string | number, numFmt?: string) => {
    const r = ws.addRow([label, value]);
    Object.assign(r.getCell(1), STYLE_LABEL);
    Object.assign(r.getCell(2), STYLE_BODY);
    if (numFmt) r.getCell(2).numFmt = numFmt;
  };

  // Executive summary (rule-based)
  sectionRow("Executive summary");
  const summaryRow = ws.addRow([generatePlanSummary(plan)]);
  ws.mergeCells(`A${summaryRow.number}:B${summaryRow.number}`);
  Object.assign(summaryRow.getCell(1), STYLE_BODY);
  summaryRow.getCell(1).alignment = { wrapText: true, vertical: "top" };
  summaryRow.height = 64;

  ws.addRow([]);
  sectionRow("Forecast totals");
  kv("Media budget", totals.budget, currencyFormat);
  kv("Impressions", totals.impressions, NUMBER_FORMAT);
  kv("Clicks", totals.clicks, NUMBER_FORMAT);
  kv("LPVs", totals.lpvs, NUMBER_FORMAT);
  kv("Leads", totals.leads, NUMBER_FORMAT);
  kv("Qualified leads", totals.qualifiedLeads, NUMBER_FORMAT);
  kv("Blended CPM", totals.blendedCPM, currencyFormat);
  kv("Blended CTR", totals.blendedCTR, PERCENT_FORMAT);
  kv("Blended CPC", totals.blendedCPC, currencyFormat);
  kv("Blended CPL", totals.blendedCPL, currencyFormat);

  // Geography recommendations (rule-based)
  if (plan.geographies.length > 0) {
    ws.addRow([]);
    sectionRow("Geography recommendations");
    const geoHeader = ws.addRow(["Region", "Recommendation"]);
    applyHeaderStyle(geoHeader);
    plan.geographies.forEach((g) => {
      const geoRows = plan.rows.filter((r) => r.geographyId === g.id);
      const geoTotals = calculatePlanTotals(geoRows);
      const rec = getGeographyRecommendation({
        budgetShare: g.budgetShare,
        cpl: geoTotals.blendedCPL,
        blendedCpl: totals.blendedCPL,
        priority: g.priority,
      });
      const r = ws.addRow([g.name, rec]);
      Object.assign(r.getCell(1), STYLE_BODY);
      Object.assign(
        r.getCell(2),
        rec === "Scale" ? STYLE_GOOD : rec === "Watch" ? STYLE_WATCH : STYLE_BODY
      );
    });
  }

  // Platform role summary
  const enabledPlatforms = plan.platforms.filter((p) => p.enabled);
  if (enabledPlatforms.length > 0) {
    ws.addRow([]);
    sectionRow("Platform role");
    const roleHeader = ws.addRow(["Platform", "Funnel role / why included"]);
    applyHeaderStyle(roleHeader);
    enabledPlatforms.forEach((p) => {
      const role = `${FUNNEL_ROLE_LABEL[p.funnelStage] ?? p.funnelStage} — ${platformWhyIncluded(p.platform, p.funnelStage)}`;
      const r = ws.addRow([platformLabel(p.platform), role]);
      r.eachCell((c) => Object.assign(c, STYLE_BODY));
      r.getCell(2).alignment = { wrapText: true };
    });
  }

  if (warnings.length > 0) {
    ws.addRow([]);
    sectionRow("Risks & watchouts");
    warnings.forEach((w) => {
      const r = ws.addRow([w.severity.toUpperCase(), w.message]);
      Object.assign(r.getCell(1), STYLE_LABEL);
      Object.assign(
        r.getCell(2),
        w.severity === "error" ? STYLE_BAD : w.severity === "warning" ? STYLE_WATCH : STYLE_BODY
      );
    });
  }

  if (hasNotes(plan.notes)) {
    ws.addRow([]);
    sectionRow("Planning notes");
    addPlanningNotes(ws, plan.notes!, (label, value) => kv(label, value));
  }

  ws.addRow([]);
  sectionRow("AI Recommendations");
  const aiNote = ws.addRow([
    "AI mode",
    "Mock — live AI recommendations are populated by the Phase 3 LLM layer.",
  ]);
  Object.assign(aiNote.getCell(1), STYLE_LABEL);
  Object.assign(aiNote.getCell(2), STYLE_MUTED_NOTE);

  ws.addRow([]);
  const footer = ws.addRow([
    `Generated by ARM Media Planning OS — Plan: ${plan.name}, ${new Date().toLocaleString()}`,
  ]);
  ws.mergeCells(`A${footer.number}:B${footer.number}`);
  Object.assign(footer.getCell(1), STYLE_MUTED_NOTE);
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
