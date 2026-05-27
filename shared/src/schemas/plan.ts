import { z } from "zod";

export const CurrencySchema = z.enum(["USD", "INR", "EUR", "GBP", "AED", "SGD", "AUD"]);
export const FunnelStageSchema = z.enum([
  "awareness",
  "consideration",
  "decision",
  "lead_gen",
  "retention",
]);
export const DealTypeSchema = z.enum(["CPM", "CPC", "CPV", "CPL", "CPR", "CPLPV", "Fixed"]);
export const PrioritySchema = z.enum(["high", "medium", "low"]);

export const PlanTypeSchema = z.enum([
  "monthly",
  "revise_monthly",
  "pitch",
  "testing",
  "performance_review",
  "dashboard_from_existing",
  "scenario_comparison",
  "scratch",
]);

export const PlanStatusSchema = z.enum([
  "draft",
  "internal_review",
  "client_revision",
  "final",
  "post_actuals",
  "archived",
]);

export const ObjectiveSchema = z.enum([
  "awareness",
  "reach",
  "video_views",
  "traffic",
  "lpv",
  "lead_gen",
  "registration",
  "revenue",
  "app_installs",
  "store_visits",
  "custom",
]);

export const PlatformSchema = z.enum([
  "meta",
  "google_search",
  "google_display",
  "google_demand_gen",
  "youtube",
  "google_pmax",
  "linkedin",
  "tiktok",
  "bing",
  "programmatic",
  "direct_publishers",
  "partner_inventory",
  "custom",
]);

export const GeographyTypeSchema = z.enum(["country", "region", "state", "city", "custom"]);
export const GeographyPlanTypeSchema = z.enum(["india", "global", "custom"]);
export const IndiaStructureSchema = z.enum(["city", "state", "region", "tier", "account_based"]);
export const CompetitionLevelSchema = z.enum(["high", "medium", "low"]);
export const AssumptionSourceSchema = z.enum(["benchmark", "user_override", "uploaded_data"]);

export const GeographyGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: GeographyTypeSchema,
  budgetShare: z.number().min(0).max(100),
  budgetLocked: z.boolean().optional(),
  locations: z.array(z.string()).optional(),
  priority: PrioritySchema.optional(),
  competition: CompetitionLevelSchema.optional(),
  notes: z.string().optional(),
});

export const PlatformPlanSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  funnelStage: FunnelStageSchema,
  dealType: DealTypeSchema,
  primaryKPI: z.string(),
  budgetShare: z.number().min(0).max(100),
  budget: z.number().min(0),
  budgetLocked: z.boolean().optional(),
  enabled: z.boolean(),
  notes: z.string().optional(),
});

export const PlanningNotesSchema = z.object({
  internal: z.string().optional(),
  client: z.string().optional(),
  assumptions: z.string().optional(),
  budgetRationale: z.string().optional(),
  geographyRationale: z.string().optional(),
  platformRationale: z.string().optional(),
});

export const ForecastAssumptionSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  geographyId: z.string().optional(),
  cpm: z.number().min(0),
  ctr: z.number().min(0).max(1),
  lpvRate: z.number().min(0).max(1),
  cvr: z.number().min(0).max(1),
  vtr: z.number().min(0).max(1).optional(),
  registrationRate: z.number().min(0).max(1).optional(),
  qualifiedRate: z.number().min(0).max(1).optional(),
  source: AssumptionSourceSchema,
});

export const MediaPlanRowSchema = z.object({
  id: z.string(),
  month: z.string(),
  geographyId: z.string(),
  geographyName: z.string(),
  platform: PlatformSchema,
  funnelStage: FunnelStageSchema,
  dealType: DealTypeSchema,
  budget: z.number(),
  impressions: z.number(),
  reach: z.number().optional(),
  frequency: z.number().optional(),
  views: z.number().optional(),
  clicks: z.number(),
  lpvs: z.number(),
  leads: z.number(),
  registrations: z.number().optional(),
  qualifiedLeads: z.number().optional(),
  cpm: z.number(),
  ctr: z.number(),
  cpc: z.number(),
  cpl: z.number(),
  cpr: z.number().optional(),
  cpql: z.number().optional(),
  notes: z.string().optional(),
});

export const FunnelSplitSchema = z.object({
  awareness: z.number(),
  consideration: z.number(),
  decision: z.number(),
  lead_gen: z.number(),
});

export const MediaPlanSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  type: PlanTypeSchema,
  status: PlanStatusSchema,
  version: z.number(),
  currency: CurrencySchema,
  planningStart: z.string(),
  planningEnd: z.string(),
  totalBudget: z.number(),
  agencyFeePct: z.number(),
  netMediaBudget: z.number(),
  objective: ObjectiveSchema,
  primaryKPI: z.string(),
  primaryKPITarget: z.number().optional(),
  secondaryKPIs: z.array(z.string()),
  funnelSplit: FunnelSplitSchema,
  geographyPlanType: GeographyPlanTypeSchema.optional(),
  indiaStructure: IndiaStructureSchema.optional(),
  geographies: z.array(GeographyGroupSchema),
  platforms: z.array(PlatformPlanSchema),
  assumptions: z.array(ForecastAssumptionSchema),
  rows: z.array(MediaPlanRowSchema),
  notes: PlanningNotesSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
