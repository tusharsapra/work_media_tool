import { Router } from "express";

export const llmRouter: Router = Router();

// Phase 3: implement Anthropic-backed generation. Phase 0/1 stub returns 501.
llmRouter.post("/generate", (_req, res) => {
  res.status(501).json({
    ok: false,
    error: {
      code: "not_implemented",
      message: "LLM generate endpoint is not implemented yet (lands in Phase 3).",
    },
  });
});

// Phase 2: implement SheetJS + LLM extraction. Phase 0/1 stub returns 501.
llmRouter.post("/extract", (_req, res) => {
  res.status(501).json({
    ok: false,
    error: {
      code: "not_implemented",
      message: "LLM extract endpoint is not implemented yet (lands in Phase 2).",
    },
  });
});
