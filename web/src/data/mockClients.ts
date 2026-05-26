import type { ClientWorkspace } from "@mpa/shared";

/**
 * Six fictional multi-industry mock clients to populate the empty state.
 * None reference real brands. Intentionally generic — no exam-prep / GMAT /
 * MBA / vertical-locked references.
 */
export const MOCK_CLIENTS: ClientWorkspace[] = [
  {
    id: "mock_bfsi",
    name: "Northshore Credit Co.",
    website: "https://example-northshore.com",
    industry: "BFSI",
    currency: "INR",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
  {
    id: "mock_healthcare",
    name: "Meridian Health Network",
    website: "https://example-meridian.com",
    industry: "Healthcare",
    currency: "USD",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
  {
    id: "mock_ecom",
    name: "Loftstone Goods",
    website: "https://example-loftstone.com",
    industry: "E-Commerce / D2C",
    currency: "USD",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
  {
    id: "mock_edtech",
    name: "Brightpath Learning",
    website: "https://example-brightpath.com",
    industry: "Education / EdTech",
    currency: "USD",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
  {
    id: "mock_b2b_saas",
    name: "Tenfold Cloud Platform",
    website: "https://example-tenfold.com",
    industry: "B2B SaaS",
    currency: "USD",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
  {
    id: "mock_realestate",
    name: "Anchor Realty Group",
    website: "https://example-anchor.com",
    industry: "Real Estate",
    currency: "INR",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    archived: false,
    plans: [],
    defaults: { preferredPlatforms: [], preferredGeographies: [], benchmarkOverrides: [] },
  },
];
