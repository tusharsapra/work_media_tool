import "dotenv/config";
import { z } from "zod";

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3001),
  LLM_MODE: z.enum(["mock", "live"]).default("mock"),
  ANTHROPIC_API_KEY: z.string().optional(),
  LLM_PROVIDER: z.string().default("anthropic"),
  LLM_MODEL: z.string().default("claude-sonnet-4-6"),
  LLM_MAX_CALLS_PER_SESSION: z.coerce.number().default(50),
});

const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// LLM mode rules: live mode requires an API key. If the key is missing, log a warning
// and auto-fall-back to mock — never throw. The server must boot cleanly without a key.
let effectiveMode: "mock" | "live" = env.LLM_MODE;
if (env.LLM_MODE === "live" && !env.ANTHROPIC_API_KEY) {
  console.warn(
    "[config] LLM_MODE=live but ANTHROPIC_API_KEY is not set. Falling back to mock mode."
  );
  effectiveMode = "mock";
}

export const config = {
  port: env.PORT,
  llmMode: effectiveMode,
  llmAvailable: effectiveMode === "live" && Boolean(env.ANTHROPIC_API_KEY),
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  llmProvider: env.LLM_PROVIDER,
  llmModel: env.LLM_MODEL,
  llmMaxCallsPerSession: env.LLM_MAX_CALLS_PER_SESSION,
} as const;
