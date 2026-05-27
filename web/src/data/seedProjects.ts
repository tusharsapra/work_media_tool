import type { ClientWorkspace } from "@mpa/shared";

/**
 * Default seed ARM projects, grouped Bajaj vs Non-Bajaj. These are editable,
 * archivable, and treated as ordinary projects — not hardcoded fixtures.
 * Currency is intentionally left blank; the user sets it at plan creation.
 *
 * GMAT appears here only as one ordinary editable Non-Bajaj project. The app
 * carries no GMAT/exam-prep-specific logic anywhere.
 */

interface SeedInput {
  id: string;
  name: string;
  group: "bajaj" | "non_bajaj";
  industry: string;
  context: string;
}

const SEED_INPUTS: SeedInput[] = [
  // --- Bajaj projects ---
  { id: "arm_bfsl", name: "BFSL", group: "bajaj", industry: "BFSI", context: "Bajaj financial services workstream." },
  { id: "arm_bajaj_experia", name: "Bajaj Experia", group: "bajaj", industry: "BFSI", context: "Bajaj customer portal/app ecosystem campaign planning." },
  { id: "arm_personal_loan", name: "Personal Loan", group: "bajaj", industry: "BFSI", context: "BFSI loan product — lead generation, eligibility, CPL and qualified lead focus." },
  { id: "arm_amc_roshan", name: "AMC Roshan", group: "bajaj", industry: "BFSI", context: "AMC/investment product campaign planning." },
  { id: "arm_amc_umang", name: "AMC Umang", group: "bajaj", industry: "BFSI", context: "AMC/investment product campaign planning." },
  { id: "arm_sme_prof", name: "SME Prof", group: "bajaj", industry: "BFSI", context: "SME finance / professional business finance campaign planning." },
  { id: "arm_hl", name: "HL", group: "bajaj", industry: "BFSI", context: "Home loan campaign planning." },
  { id: "arm_insta_emi", name: "Insta EMI Card", group: "bajaj", industry: "BFSI", context: "Consumer finance / EMI card campaign planning." },

  // --- Non-Bajaj projects ---
  { id: "arm_siemens", name: "Siemens", group: "non_bajaj", industry: "Manufacturing", context: "Industrial, technology, B2B, enterprise solutions." },
  { id: "arm_niva_bupa", name: "Niva Bupa", group: "non_bajaj", industry: "BFSI", context: "Health insurance — lead generation, consideration, policy-focused campaigns." },
  { id: "arm_eternia", name: "Eternia", group: "non_bajaj", industry: "Real Estate", context: "Building materials / home improvement / premium windows and doors category." },
  { id: "arm_gmat", name: "GMAT", group: "non_bajaj", industry: "Education / EdTech", context: "Education, test prep, registrations, global/regional campaign planning." },
  { id: "arm_fortis", name: "Fortis", group: "non_bajaj", industry: "Healthcare", context: "Healthcare, hospital network, appointment and service-line campaigns." },
  { id: "arm_3ca", name: "3CA", group: "non_bajaj", industry: "Other", context: "Client project. Category may vary — keep editable." },
  { id: "arm_lauritz_knudsen", name: "Lauritz Knudsen", group: "non_bajaj", industry: "Manufacturing", context: "Electrical, infrastructure, B2B/B2C product and brand campaigns." },
  { id: "arm_pluxee", name: "Pluxee", group: "non_bajaj", industry: "BFSI", context: "Employee benefits, fintech, corporate solutions, B2B/B2B2C campaigns." },
  { id: "arm_stashfin", name: "Stashfin", group: "non_bajaj", industry: "BFSI", context: "Digital lending / fintech — performance marketing and lead generation." },
  { id: "arm_sujata", name: "Sujata", group: "non_bajaj", industry: "FMCG", context: "Consumer appliances — brand and product campaigns." },
  { id: "arm_digihaat", name: "Digihaat", group: "non_bajaj", industry: "E-Commerce / D2C", context: "Digital commerce / marketplace-style campaign planning." },
  { id: "arm_schneider_eshop", name: "Schneider Eshop", group: "non_bajaj", industry: "E-Commerce / D2C", context: "E-commerce, Schneider product sales and online performance campaigns." },
  { id: "arm_schneider_secure_power", name: "Schneider Secure Power", group: "non_bajaj", industry: "Manufacturing", context: "Enterprise power solutions, B2B, high-intent and lead generation campaigns." },
];

function makeSeed(input: SeedInput, index: number): ClientWorkspace {
  // Stagger createdAt so "recently updated" sort has stable, sensible ordering.
  const created = new Date(Date.now() - 1000 * 60 * 60 * 24 * (SEED_INPUTS.length - index)).toISOString();
  return {
    id: input.id,
    name: input.name,
    industry: input.industry,
    projectGroup: input.group,
    projectContext: input.context,
    currency: undefined,
    createdAt: created,
    updatedAt: created,
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  };
}

export const SEED_PROJECTS: ClientWorkspace[] = SEED_INPUTS.map(makeSeed);

export const SEED_PROJECT_IDS = new Set(SEED_PROJECTS.map((p) => p.id));

// V1 fake-client ids that should be dropped on the v1→v2 migration.
export const V1_MOCK_IDS = [
  "mock_bfsi",
  "mock_healthcare",
  "mock_ecom",
  "mock_edtech",
  "mock_b2b_saas",
  "mock_realestate",
];
