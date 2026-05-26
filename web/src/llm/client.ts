import type { HealthResponse } from "@mpa/shared";

/**
 * Thin fetch wrapper around the backend LLM proxy.
 * Phase 0 only exposes the health probe — generate/extract land in later phases.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health probe failed: ${res.status}`);
  return res.json();
}
