# ARM Media Planning OS

AI-powered media planning, forecasting, performance analysis, and recommendation system for agency media teams.

## Workspace layout

```
web/      Vite + React 19 + TypeScript SPA — frontend
server/   Express + TypeScript — thin LLM proxy and future server-side concerns
shared/   Shared TypeScript types and Zod schemas — imported by both web and server
```

## Setup

```bash
nvm use            # Node 20+
npm install        # installs all workspaces
cp .env.example .env
```

## Run (dev)

```bash
npm run dev         # boots both web (5173) and server (3001)
npm run dev:web     # web only
npm run dev:server  # server only
```

## Build

```bash
npm run build       # builds shared, server, and web
```

## LLM modes

The server boots cleanly without an API key. Set `LLM_MODE=live` and provide `ANTHROPIC_API_KEY` to enable live AI; otherwise the server runs in mock mode and the topbar shows a "Mock AI" badge. Live mode without a key auto-falls back to mock with a startup warning — it does not crash.
