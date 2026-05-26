import { z } from "zod";

export const LLMTaskSchema = z.enum([
  "recommendations",
  "risks",
  "insights",
  "clientSummary",
  "extractionAssist",
]);

export const LLMModeSchema = z.enum(["mock", "live"]);

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  llmAvailable: z.boolean(),
  mode: LLMModeSchema,
  model: z.string().optional(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  area: z.enum(["platform", "budget", "geography", "funnel", "testing", "audience"]),
  recommendation: z.string(),
  reason: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
});

export const RiskAssessmentSchema = z.object({
  id: z.string(),
  risk: z.string(),
  whyItMatters: z.string(),
  suggestedFix: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});
