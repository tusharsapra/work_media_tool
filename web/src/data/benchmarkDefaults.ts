import type { Platform } from "@mpa/shared";

export interface PlatformBenchmark {
  cpm: number; // USD assumed; downstream code can apply currency conversion if needed
  ctr: number; // 0–1
  lpvRate: number; // 0–1
  cvr: number; // 0–1
  vtr?: number; // 0–1
  registrationRate?: number; // 0–1
  qualifiedRate?: number; // 0–1
}

/**
 * Industry-neutral platform benchmarks used as the *starting* assumption set
 * before any user override. Per-industry tuning belongs in user-edited
 * assumptions or future client defaults, not hard-coded here.
 */
export const PLATFORM_BENCHMARKS: Record<Platform, PlatformBenchmark> = {
  meta: { cpm: 8, ctr: 0.011, lpvRate: 0.7, cvr: 0.06, vtr: 0.35, registrationRate: 0.04, qualifiedRate: 0.4 },
  google_search: { cpm: 20, ctr: 0.05, lpvRate: 0.85, cvr: 0.08, registrationRate: 0.06, qualifiedRate: 0.55 },
  google_display: { cpm: 4, ctr: 0.004, lpvRate: 0.6, cvr: 0.03, vtr: 0.3, registrationRate: 0.02, qualifiedRate: 0.3 },
  google_demand_gen: { cpm: 6, ctr: 0.015, lpvRate: 0.7, cvr: 0.05, vtr: 0.4, registrationRate: 0.03, qualifiedRate: 0.35 },
  youtube: { cpm: 5, ctr: 0.007, lpvRate: 0.55, cvr: 0.025, vtr: 0.55, registrationRate: 0.02, qualifiedRate: 0.3 },
  google_pmax: { cpm: 12, ctr: 0.02, lpvRate: 0.75, cvr: 0.07, registrationRate: 0.05, qualifiedRate: 0.5 },
  linkedin: { cpm: 35, ctr: 0.008, lpvRate: 0.65, cvr: 0.06, registrationRate: 0.04, qualifiedRate: 0.6 },
  tiktok: { cpm: 6, ctr: 0.012, lpvRate: 0.6, cvr: 0.04, vtr: 0.45, registrationRate: 0.03, qualifiedRate: 0.3 },
  bing: { cpm: 18, ctr: 0.045, lpvRate: 0.8, cvr: 0.07, registrationRate: 0.05, qualifiedRate: 0.5 },
  programmatic: { cpm: 3.5, ctr: 0.003, lpvRate: 0.55, cvr: 0.02, vtr: 0.3, registrationRate: 0.015, qualifiedRate: 0.28 },
  direct_publishers: { cpm: 10, ctr: 0.006, lpvRate: 0.6, cvr: 0.03, registrationRate: 0.02, qualifiedRate: 0.35 },
  partner_inventory: { cpm: 9, ctr: 0.006, lpvRate: 0.6, cvr: 0.035, registrationRate: 0.025, qualifiedRate: 0.4 },
  custom: { cpm: 8, ctr: 0.01, lpvRate: 0.65, cvr: 0.04, registrationRate: 0.03, qualifiedRate: 0.4 },
};
