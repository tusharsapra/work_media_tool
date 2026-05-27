import type { Currency, DealType, FunnelStage, Priority } from "./common";

export type PlanType =
  | "monthly"
  | "revise_monthly"
  | "pitch"
  | "testing"
  | "performance_review"
  | "dashboard_from_existing"
  | "scenario_comparison"
  | "scratch";

export type PlanStatus =
  | "draft"
  | "internal_review"
  | "client_revision"
  | "final"
  | "post_actuals"
  | "archived";

export type Objective =
  | "awareness"
  | "reach"
  | "video_views"
  | "traffic"
  | "lpv"
  | "lead_gen"
  | "registration"
  | "revenue"
  | "app_installs"
  | "store_visits"
  | "custom";

export type Platform =
  | "meta"
  | "google_search"
  | "google_display"
  | "google_demand_gen"
  | "youtube"
  | "google_pmax"
  | "linkedin"
  | "tiktok"
  | "bing"
  | "programmatic"
  | "direct_publishers"
  | "partner_inventory"
  | "custom";

export type GeographyType = "country" | "region" | "state" | "city" | "custom";

// V2: top-level geography planning mode + India sub-structure.
export type GeographyPlanType = "india" | "global" | "custom";
export type IndiaStructure = "city" | "state" | "region" | "tier" | "account_based";

export type CompetitionLevel = "high" | "medium" | "low";

export type AssumptionSource = "benchmark" | "user_override" | "uploaded_data";

export interface GeographyGroup {
  id: string;
  name: string;
  type: GeographyType;
  budgetShare: number; // 0–100
  budgetLocked?: boolean; // V2: lock share and redistribute the rest
  locations?: string[]; // V2: included cities/countries/markets
  priority?: Priority;
  competition?: CompetitionLevel;
  notes?: string;
}

export interface PlatformPlan {
  id: string;
  platform: Platform;
  funnelStage: FunnelStage;
  dealType: DealType;
  primaryKPI: string;
  budgetShare: number; // 0–100 of net media budget
  budget: number; // absolute dollar amount, derived from share
  budgetLocked?: boolean; // V2: lock budget and redistribute the rest
  enabled: boolean;
  notes?: string;
}

export interface ForecastAssumption {
  id: string;
  platform: Platform;
  geographyId?: string;
  cpm: number;
  ctr: number; // 0–1
  lpvRate: number; // 0–1
  cvr: number; // 0–1
  vtr?: number; // 0–1
  registrationRate?: number; // 0–1
  qualifiedRate?: number; // 0–1
  source: AssumptionSource;
}

export interface MediaPlanRow {
  id: string;
  month: string; // YYYY-MM
  geographyId: string;
  geographyName: string;
  platform: Platform;
  funnelStage: FunnelStage;
  dealType: DealType;
  budget: number;
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
  notes?: string;
}

export interface FunnelSplit {
  awareness: number;
  consideration: number;
  decision: number;
  lead_gen: number;
}

export interface KPITarget {
  kpi: string; // e.g. "CPL", "CPM"
  value: number;
}

// V2: structured planning notes captured in the wizard / dashboard and exported to Excel.
export interface PlanningNotes {
  internal?: string;
  client?: string;
  assumptions?: string;
  budgetRationale?: string;
  geographyRationale?: string;
  platformRationale?: string;
}

export interface MediaPlan {
  id: string;
  clientId: string;
  name: string;
  type: PlanType;
  status: PlanStatus;
  version: number;
  currency: Currency;
  planningStart: string; // YYYY-MM-DD
  planningEnd: string;
  totalBudget: number;
  agencyFeePct: number; // retained for back-compat; V2 wizard always sets 0
  netMediaBudget: number; // V2: equals totalBudget (no agency fee in the flow)
  objective: Objective;
  primaryKPI: string;
  primaryKPITarget?: number; // optional user-entered target
  secondaryKPIs: string[];
  funnelSplit: FunnelSplit;
  geographyPlanType?: GeographyPlanType;
  indiaStructure?: IndiaStructure;
  geographies: GeographyGroup[];
  platforms: PlatformPlan[];
  assumptions: ForecastAssumption[];
  rows: MediaPlanRow[];
  notes?: PlanningNotes;
  createdAt: string;
  updatedAt: string;
}

export interface WizardState {
  step: number;
  planType: PlanType;
  clientId: string;
  name: string;
  currency: Currency;
  planningStart: string;
  planningEnd: string;
  totalBudget: number;
  agencyFeePct: number;
  geographyType: GeographyType;
  geographyPlanType: GeographyPlanType;
  indiaStructure?: IndiaStructure;
  geographies: GeographyGroup[];
  objective: Objective;
  primaryKPI: string;
  primaryKPITarget?: number;
  secondaryKPIs: string[];
  funnelSplit: FunnelSplit;
  platforms: PlatformPlan[];
  assumptions: ForecastAssumption[];
  notes: PlanningNotes;
}
