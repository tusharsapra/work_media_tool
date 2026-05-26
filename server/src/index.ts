import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { llmRouter } from "./routes/llm.js";
import { errorMiddleware } from "./middleware/error.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/health", healthRouter);
app.use("/api/llm", llmRouter);

app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(
    `[server] ARM Media Planning OS API listening on :${config.port} (mode=${config.llmMode}, llmAvailable=${config.llmAvailable})`
  );
});
