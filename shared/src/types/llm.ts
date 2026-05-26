export type LLMTask =
  | "recommendations"
  | "risks"
  | "insights"
  | "clientSummary"
  | "extractionAssist";

export type LLMMode = "mock" | "live";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface LLMError {
  code: string;
  message: string;
}

export type LLMResponse<T> =
  | { ok: true; data: T; usage?: TokenUsage; mode: LLMMode }
  | { ok: false; error: LLMError; fallback?: "rule-based"; mode: LLMMode };

export interface HealthResponse {
  ok: true;
  llmAvailable: boolean;
  mode: LLMMode;
  model?: string;
}

export interface Recommendation {
  id: string;
  area: "platform" | "budget" | "geography" | "funnel" | "testing" | "audience";
  recommendation: string;
  reason: string;
  priority: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
}

export interface RiskAssessment {
  id: string;
  risk: string;
  whyItMatters: string;
  suggestedFix: string;
  severity: "info" | "warning" | "critical";
}
