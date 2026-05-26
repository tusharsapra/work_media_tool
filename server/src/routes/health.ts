import { Router } from "express";
import type { HealthResponse } from "@mpa/shared";
import { config } from "../config.js";

export const healthRouter: Router = Router();

healthRouter.get("/", (_req, res) => {
  const body: HealthResponse = {
    ok: true,
    llmAvailable: config.llmAvailable,
    mode: config.llmMode,
    model: config.llmMode === "live" ? config.llmModel : undefined,
  };
  res.json(body);
});
