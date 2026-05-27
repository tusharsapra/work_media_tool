import type {
  Currency,
  DealType,
  FunnelStage,
  GeographyType,
  Objective,
  PlanType,
  Platform,
} from "@mpa/shared";

export interface PlatformInfo {
  id: Platform;
  label: string;
  defaultFunnelStage: FunnelStage;
  defaultDealType: DealType;
  supportedObjectives: Objective[];
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "meta",
    label: "Meta (Facebook & Instagram)",
    defaultFunnelStage: "consideration",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "reach", "video_views", "traffic", "lpv", "lead_gen", "revenue", "app_installs"],
  },
  {
    id: "google_search",
    label: "Google Search",
    defaultFunnelStage: "decision",
    defaultDealType: "CPC",
    supportedObjectives: ["traffic", "lpv", "lead_gen", "registration", "revenue"],
  },
  {
    id: "google_display",
    label: "Google Display",
    defaultFunnelStage: "awareness",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "reach", "traffic", "lead_gen"],
  },
  {
    id: "google_demand_gen",
    label: "Google Demand Gen",
    defaultFunnelStage: "consideration",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "video_views", "traffic", "lead_gen"],
  },
  {
    id: "youtube",
    label: "YouTube",
    defaultFunnelStage: "awareness",
    defaultDealType: "CPV",
    supportedObjectives: ["awareness", "reach", "video_views", "traffic"],
  },
  {
    id: "google_pmax",
    label: "Google Performance Max",
    defaultFunnelStage: "decision",
    defaultDealType: "CPC",
    supportedObjectives: ["traffic", "lead_gen", "revenue", "app_installs", "store_visits"],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    defaultFunnelStage: "consideration",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "traffic", "lpv", "lead_gen", "registration"],
  },
  {
    id: "tiktok",
    label: "TikTok",
    defaultFunnelStage: "awareness",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "reach", "video_views", "traffic", "lead_gen", "app_installs"],
  },
  {
    id: "bing",
    label: "Microsoft / Bing Ads",
    defaultFunnelStage: "decision",
    defaultDealType: "CPC",
    supportedObjectives: ["traffic", "lpv", "lead_gen", "revenue"],
  },
  {
    id: "programmatic",
    label: "Programmatic (DSP)",
    defaultFunnelStage: "awareness",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "reach", "video_views", "traffic"],
  },
  {
    id: "direct_publishers",
    label: "Direct Publishers",
    defaultFunnelStage: "consideration",
    defaultDealType: "Fixed",
    supportedObjectives: ["awareness", "reach", "traffic", "lead_gen"],
  },
  {
    id: "partner_inventory",
    label: "Partner Inventory",
    defaultFunnelStage: "consideration",
    defaultDealType: "Fixed",
    supportedObjectives: ["awareness", "reach", "traffic", "lead_gen"],
  },
  {
    id: "custom",
    label: "Custom Channel",
    defaultFunnelStage: "consideration",
    defaultDealType: "CPM",
    supportedObjectives: ["awareness", "reach", "traffic", "lead_gen", "custom"],
  },
];

export interface ObjectiveInfo {
  id: Objective;
  label: string;
  description: string;
}

export const OBJECTIVES: ObjectiveInfo[] = [
  { id: "awareness", label: "Awareness", description: "Maximize reach and brand recall" },
  { id: "reach", label: "Reach", description: "Maximize unique audience reached" },
  { id: "video_views", label: "Video Views", description: "Drive video engagement and view-through" },
  { id: "traffic", label: "Traffic / Consideration", description: "Drive clicks and site visits" },
  { id: "lpv", label: "Landing Page Views", description: "Drive qualified landing page visits" },
  { id: "lead_gen", label: "Lead Generation", description: "Capture leads via forms or instant forms" },
  { id: "registration", label: "Registration", description: "Drive sign-ups, account creations, or other conversion actions" },
  { id: "revenue", label: "Revenue / Sales", description: "Drive purchases and revenue" },
  { id: "app_installs", label: "App Installs", description: "Drive mobile app installations" },
  { id: "store_visits", label: "Store Visits", description: "Drive footfall to physical locations" },
  { id: "custom", label: "Custom Objective", description: "Define a custom objective and KPI" },
];

export const KPI_BY_OBJECTIVE: Record<Objective, { primary: string[]; secondary: string[] }> = {
  awareness: { primary: ["CPM", "Reach", "Frequency"], secondary: ["Impressions", "Views"] },
  reach: { primary: ["Reach", "CPM"], secondary: ["Frequency", "Impressions"] },
  video_views: { primary: ["CPV", "VTR"], secondary: ["Views", "Reach", "Frequency"] },
  traffic: { primary: ["CPC", "CTR"], secondary: ["LPV", "Sessions"] },
  lpv: { primary: ["CPLPV", "LPV"], secondary: ["CTR", "CPC"] },
  lead_gen: { primary: ["CPL", "Leads", "CVR"], secondary: ["LPV", "CTR", "CPC", "CPQL"] },
  registration: { primary: ["CPR", "Registrations"], secondary: ["LPV", "Clicks", "CTR"] },
  revenue: { primary: ["ROAS", "CAC"], secondary: ["CVR", "AOV"] },
  app_installs: { primary: ["CPI", "Installs"], secondary: ["CTR", "CVR"] },
  store_visits: { primary: ["Cost per Visit", "Visits"], secondary: ["Reach", "Frequency"] },
  custom: { primary: ["Custom KPI"], secondary: [] },
};

export const CURRENCIES: { code: Currency; symbol: string; locale: string }[] = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "EUR", symbol: "€", locale: "en-EU" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "AED", symbol: "د.إ", locale: "en-AE" },
  { code: "SGD", symbol: "S$", locale: "en-SG" },
  { code: "AUD", symbol: "A$", locale: "en-AU" },
];

export const INDUSTRIES: string[] = [
  "BFSI",
  "Healthcare",
  "E-Commerce / D2C",
  "Education / EdTech",
  "B2B SaaS",
  "Real Estate",
  "Travel & Hospitality",
  "Telecom",
  "Automotive",
  "FMCG",
  "Media & Entertainment",
  "Manufacturing",
  "Retail",
  "Energy & Utilities",
  "Government / NGO",
  "Legal & Professional Services",
  "Logistics",
  "Gaming",
  "Agriculture",
  "Other",
];

export interface GeoPreset {
  id: string;
  label: string;
  type: GeographyType;
}

export const GEO_PRESETS: GeoPreset[] = [
  { id: "global", label: "Global", type: "region" },
  { id: "north_america", label: "North America", type: "region" },
  { id: "europe", label: "Europe", type: "region" },
  { id: "middle_east", label: "Middle East", type: "region" },
  { id: "south_asia", label: "South Asia", type: "region" },
  { id: "southeast_asia", label: "Southeast Asia", type: "region" },
  { id: "east_asia", label: "East Asia", type: "region" },
  { id: "india_tier_1", label: "India Tier 1", type: "city" },
  { id: "india_tier_2", label: "India Tier 2", type: "city" },
];

// --- V2 geography planning ---------------------------------------------------------------------
// India city/region/tier examples used as *optional* picks — never auto-selected.
export const INDIA_CITIES: string[] = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Indore",
  "Surat",
  "Nagpur",
  "Coimbatore",
];

export const INDIA_STATES: string[] = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Andhra Pradesh",
];

export const INDIA_REGIONS: string[] = [
  "North India",
  "South India",
  "West India",
  "East India",
  "Central India",
];

export const INDIA_TIERS: string[] = ["Tier 1", "Tier 2", "Tier 3"];

// Global examples — optional only; do NOT force NAM/SAS/WEU defaults.
export const GLOBAL_REGIONS: string[] = [
  "North America",
  "Europe",
  "Middle East",
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Africa",
  "LATAM",
  "Australia / New Zealand",
];

// Account-based / custom grouping templates for India planning. Each is an editable starting point.
export interface AccountBasedTemplate {
  name: string;
  suggestedLocations: string[];
  note: string;
}

export const ACCOUNT_BASED_TEMPLATES: AccountBasedTemplate[] = [
  {
    name: "Priority Branch Cities",
    suggestedLocations: ["Delhi NCR", "Mumbai", "Pune", "Bangalore"],
    note: "Strongest sales coverage",
  },
  {
    name: "Dealer Network Markets",
    suggestedLocations: ["Ahmedabad", "Surat", "Jaipur", "Indore"],
    note: "Active dealer/partner presence",
  },
  {
    name: "High Intent Markets",
    suggestedLocations: ["Bangalore", "Hyderabad", "Chennai"],
    note: "High historical conversion intent",
  },
  {
    name: "Expansion Markets",
    suggestedLocations: ["Lucknow", "Nagpur", "Coimbatore"],
    note: "New growth markets to develop",
  },
  {
    name: "Sales Team Priority Markets",
    suggestedLocations: ["Delhi NCR", "Mumbai", "Kolkata"],
    note: "Flagged by the sales team",
  },
  {
    name: "Test Markets",
    suggestedLocations: ["Kochi", "Chandigarh"],
    note: "Controlled markets for testing",
  },
];

export const GEOGRAPHY_PLAN_TYPES: { id: "india" | "global" | "custom"; label: string; description: string }[] = [
  { id: "india", label: "India plan", description: "Plan across Indian cities, states, regions, tiers, or account-based groups." },
  { id: "global", label: "Global / international plan", description: "Plan across countries, international regions, or custom groups." },
  { id: "custom", label: "Custom geography groups", description: "Build your own geography groups from scratch." },
];

export const INDIA_STRUCTURES: { id: "city" | "state" | "region" | "tier" | "account_based"; label: string }[] = [
  { id: "city", label: "City-level" },
  { id: "state", label: "State-level" },
  { id: "region", label: "Region-level" },
  { id: "tier", label: "Tier-level" },
  { id: "account_based", label: "Account-based / custom grouping" },
];

export interface PlanTypeInfo {
  id: PlanType;
  label: string;
  description: string;
  whenToUse: string;
  enabledInMVP: boolean;
}

export const PLAN_TYPE_INFO: PlanTypeInfo[] = [
  {
    id: "monthly",
    label: "New Monthly Media Plan",
    description: "Build a fresh monthly plan with full forecast and allocation.",
    whenToUse: "Use when starting the next month's planning cycle for an existing client.",
    enabledInMVP: true,
  },
  {
    id: "revise_monthly",
    label: "Revise Last Month's Plan",
    description: "Iterate on a previous plan using actuals and learnings.",
    whenToUse: "Use after a campaign run when you have actuals to inform the next plan.",
    enabledInMVP: false,
  },
  {
    id: "pitch",
    label: "New Business / Pitch",
    description: "Create a pitch plan for a prospective client.",
    whenToUse: "Use during RFP responses or pitches with limited historical data.",
    enabledInMVP: false,
  },
  {
    id: "testing",
    label: "Testing Plan",
    description: "Define a structured test with hypothesis, KPI, and decision rule.",
    whenToUse: "Use to validate a new platform, audience, or creative angle.",
    enabledInMVP: false,
  },
  {
    id: "performance_review",
    label: "Performance Review",
    description: "Compare actuals against plan and generate next-period recommendations.",
    whenToUse: "Use at the end of a campaign cycle to analyze and learn.",
    enabledInMVP: false,
  },
  {
    id: "dashboard_from_existing",
    label: "Dashboard from Existing Plan",
    description: "Build a stakeholder dashboard from an already-approved plan.",
    whenToUse: "Use to convert an existing plan into a client-ready review.",
    enabledInMVP: false,
  },
  {
    id: "scenario_comparison",
    label: "Scenario Comparison",
    description: "Compare multiple budget and allocation scenarios side-by-side.",
    whenToUse: "Use when evaluating budget increases, platform additions, or strategy shifts.",
    enabledInMVP: false,
  },
  {
    id: "scratch",
    label: "Start from Scratch",
    description: "Walk through the full guided wizard with no pre-fill.",
    whenToUse: "Use when no historical data is available.",
    enabledInMVP: true,
  },
];

export const DEFAULT_FUNNEL_SPLIT: Record<Objective, { awareness: number; consideration: number; decision: number; lead_gen: number }> = {
  awareness: { awareness: 70, consideration: 20, decision: 5, lead_gen: 5 },
  reach: { awareness: 70, consideration: 20, decision: 5, lead_gen: 5 },
  video_views: { awareness: 60, consideration: 25, decision: 10, lead_gen: 5 },
  traffic: { awareness: 30, consideration: 50, decision: 15, lead_gen: 5 },
  lpv: { awareness: 25, consideration: 50, decision: 20, lead_gen: 5 },
  lead_gen: { awareness: 15, consideration: 30, decision: 15, lead_gen: 40 },
  registration: { awareness: 15, consideration: 30, decision: 15, lead_gen: 40 },
  revenue: { awareness: 15, consideration: 25, decision: 50, lead_gen: 10 },
  app_installs: { awareness: 30, consideration: 30, decision: 30, lead_gen: 10 },
  store_visits: { awareness: 40, consideration: 30, decision: 25, lead_gen: 5 },
  custom: { awareness: 25, consideration: 25, decision: 25, lead_gen: 25 },
};
