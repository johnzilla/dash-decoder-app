---
phase: 04-backend-infrastructure
verified: 2026-04-05T14:07:00Z
status: human_needed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Deploy to DO App Platform and verify Express service health check passes"
    expected: "GET https://<app-domain>/health returns 200 with {status:'ok'}"
    why_human: "Requires live DO App Platform deployment with managed Postgres and Spaces credentials configured. Cannot verify cloud infrastructure state programmatically."
  - test: "Upload a real dashboard photo end-to-end via the deployed app"
    expected: "Image appears in DO Spaces bucket, scan session row is created in Postgres, ai_calls row is logged with model/tokens/latency/success fields populated, and analysis result is returned to the browser"
    why_human: "Requires live DO Spaces bucket, OpenAI API key, and managed Postgres — all external services not available locally."
  - test: "Verify drizzle-kit push creates tables on first DO deploy"
    expected: "run_command in app.yaml executes 'npx drizzle-kit push' before server start; scan_sessions, feedback, ai_calls tables exist in production Postgres"
    why_human: "DB schema push was explicitly deferred to first DO deploy (no local DATABASE_URL). Cannot verify production table structure without deploying."
---

# Phase 4: Backend Infrastructure Verification Report

**Phase Goal:** An Express server proxies OpenAI calls server-side, stores images in DO Spaces, and logs every AI call to Postgres
**Verified:** 2026-04-05T14:07:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Express web service runs on DO App Platform alongside the static site and responds to health checks | ? HUMAN | Server starts locally (confirmed: `GET /health` returns `{"status":"ok","timestamp":"..."}` in spot-check). app.yaml defines `api-server` service with `preserve_path_prefix: true` ingress. Live DO deployment cannot be verified locally. |
| 2 | A scan session can be created and updated via the API, with session data persisted in Postgres | ? HUMAN | `POST /api/sessions` and `PATCH /api/sessions/:id` routes are wired and respond correctly. Confirmed ECONNREFUSED (no local Postgres) — code issues correct DB insert query. Live Postgres persistence requires deployed environment. |
| 3 | An uploaded image is stored in DO Spaces and the returned URL is what gets sent to OpenAI (no base64 in request body) | ? HUMAN | Code path verified: `sharp` resize → `uploadToSpaces()` → CDN URL → `callOpenAIWithLogging(sessionId, [{image_url:{url:imageUrl}}])`. Route returns `400 "Image file is required"` with proper multipart content-type (correct). Live DO Spaces bucket required to verify actual storage. |
| 4 | OpenAI API key is absent from the frontend bundle; all AI calls route through the Express proxy | ✓ VERIFIED | `src/lib/api/openai.ts` calls `fetch('/api/analyze')` only — zero `openai.com`, `VITE_OPENAI_API_KEY`, or `Bearer` references in `src/`. Fresh `npm run build` produces a clean bundle: `grep -r "openai.com\|OPENAI_API_KEY\|Bearer.*sk-" dist/assets/` returns empty. `src/lib/api/prompts.ts` deleted. `app.yaml` `static_sites.envs: []`. |
| 5 | Every AI call generates a log row in Postgres capturing model, token counts, latency, and success/failure status | ? HUMAN | `callOpenAIWithLogging` in `server/lib/openai.ts` inserts into `aiCalls` with `model`, `promptTokens`, `completionTokens`, `latencyMs: Date.now()-start`, `success`, `errorMessage` — all inside a `finally` block with its own try/catch (logging failure cannot break the API response). Live verification requires Postgres. |

**Score:** 5/5 truths structurally verified (1 confirmed end-to-end locally; 4 require live cloud services)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/app.ts` | Express app factory with middleware stack | ✓ VERIFIED | Exports `createApp()`, mounts helmet/cors/json/healthRouter/sessionsRouter/analyzeRouter/errorHandler in correct order |
| `server/index.ts` | Server entry point that listens on PORT | ✓ VERIFIED | Listens on `process.env.PORT \|\| 8080`, confirmed working in spot-check |
| `server/db/schema.ts` | Drizzle table definitions for scan_sessions, feedback, ai_calls | ✓ VERIFIED | Exports `scanSessions`, `feedback`, `aiCalls` with all required columns and FK constraints |
| `server/db/client.ts` | pg Pool + Drizzle singleton | ✓ VERIFIED | Exports `db` and `pool`; uses `Pool` from `pg` with `connectionString: process.env.DATABASE_URL` |
| `server/routes/health.ts` | GET /health endpoint | ✓ VERIFIED | Exports `healthRouter`; returns `{status:'ok', timestamp}` |
| `server/routes/sessions.ts` | POST and PATCH /api/sessions routes | ✓ VERIFIED | Exports `sessionsRouter`; POST inserts scan session row returning 201; PATCH updates by ID with proper 400/404 handling |
| `server/routes/analyze.ts` | POST /api/analyze route with multer, sharp, S3, OpenAI | ✓ VERIFIED | Exports `analyzeRouter`; handles `type=analyze` (image upload path) and `type=diagnose` (text path); sharp resize to 1200px, uploadToSpaces, callOpenAIWithLogging |
| `server/lib/openai.ts` | OpenAI client with callOpenAIWithLogging wrapper | ✓ VERIFIED | Exports `callOpenAIWithLogging` and `openaiClient`; `timeout: 30_000`, `maxRetries: 0`; finally block with isolated try/catch |
| `server/lib/spaces.ts` | S3Client and uploadToSpaces function for DO Spaces | ✓ VERIFIED | Exports `uploadToSpaces`; uses `PutObjectCommand` with `ACL: 'public-read'`; returns CDN URL |
| `server/lib/prompts.ts` | Server-side copy of prompts | ✓ VERIFIED | Exports `SYSTEM_PROMPT`, `getAnalysisPrompt`, `getDiagnosisPrompt` |
| `server/middleware/errorHandler.ts` | Centralized Express error handler | ✓ VERIFIED | Exports `errorHandler`; generic prod message, dev detail |
| `server/__tests__/health.test.ts` | Health endpoint integration test | ✓ VERIFIED | Passes: `vitest run` exits 0, 1 test passing |
| `tsconfig.server.json` | Server-specific TypeScript config targeting CommonJS | ✓ VERIFIED | `"module": "CommonJS"`, `"outDir": "dist/server"`, `"include": ["server/**/*.ts"]`; `tsc -p tsconfig.server.json --noEmit` exits 0 |
| `drizzle.config.ts` | Drizzle Kit config pointing to server/db/schema.ts | ✓ VERIFIED | `dialect: 'postgresql'`, `schema: './server/db/schema.ts'` |
| `vitest.config.server.ts` | Vitest config for server tests in Node environment | ✓ VERIFIED | `include: ['server/**/*.test.ts']`, `environment: 'node'` |
| `src/lib/api/openai.ts` | Thin HTTP client calling /api/analyze | ✓ VERIFIED | `analyzeWarningLight(imageFile: File)` sends multipart to `/api/analyze`; `generateDiagnosis` sends JSON; no OpenAI SDK references |
| `src/hooks/useVisionAnalysis.ts` | Updated hook accepting File instead of base64 string | ✓ VERIFIED | `analyze(imageFile: File)` signature confirmed |
| `vite.config.ts` | Dev proxy for /api/* to Express | ✓ VERIFIED | `server.proxy['/api'] = {target: 'http://localhost:8080', changeOrigin: true}` |
| `.do/app.yaml` | Multi-component DO App Platform spec with ingress rules | ✓ VERIFIED | `preserve_path_prefix: true`, `services.api-server`, `databases.postgres`, `static_sites.envs: []` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `server/app.ts` | `server/routes/health.ts` | `app.use('/health', healthRouter)` | ✓ WIRED | Confirmed in app.ts line 14 |
| `server/app.ts` | `server/routes/sessions.ts` | `app.use('/api/sessions', sessionsRouter)` | ✓ WIRED | Confirmed in app.ts line 15 |
| `server/app.ts` | `server/routes/analyze.ts` | `app.use('/api/analyze', analyzeRouter)` | ✓ WIRED | Confirmed in app.ts line 16 |
| `server/db/client.ts` | `server/db/schema.ts` | `import * as schema` | ✓ WIRED | `import * as schema from './schema.js'` confirmed |
| `server/routes/analyze.ts` | `server/lib/openai.ts` | `callOpenAIWithLogging()` | ✓ WIRED | Called on lines 72 and 117 of analyze.ts |
| `server/routes/analyze.ts` | `server/lib/spaces.ts` | `uploadToSpaces()` | ✓ WIRED | Called on line 63 of analyze.ts |
| `server/lib/openai.ts` | `server/db/schema.ts` | `db.insert(aiCalls)` | ✓ WIRED | `db.insert(aiCalls).values(...)` in finally block, line 63 |
| `src/lib/api/openai.ts` | `/api/analyze` | `fetch('/api/analyze')` | ✓ WIRED | Both `analyzeWarningLight` and `generateDiagnosis` call `fetch('/api/analyze')` |
| `vite.config.ts` | `localhost:8080` | `server.proxy` | ✓ WIRED | `proxy: {'/api': {target: 'http://localhost:8080'}}` |
| `.do/app.yaml` | `api-server component` | `ingress rules` | ✓ WIRED | `/api` prefix routes to `api-server` with `preserve_path_prefix: true` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `server/routes/analyze.ts` | `imageUrl` (CDN URL) | `uploadToSpaces()` returns S3 CDN URL | Yes — S3 PutObjectCommand + CDN URL format | ✓ FLOWING (pending live Spaces) |
| `server/routes/analyze.ts` | `aiResult.content` | `callOpenAIWithLogging()` returns OpenAI response | Yes — real API call with `gpt-4o` | ✓ FLOWING (pending live API key) |
| `server/lib/openai.ts` | `aiCalls` row | `db.insert(aiCalls).values({model, promptTokens, completionTokens, latencyMs, success})` | Yes — all fields captured from live response | ✓ FLOWING (pending Postgres) |
| `src/lib/api/openai.ts` | analysis result | `fetch('/api/analyze')` response body | Yes — proxied through Express | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| GET /health returns 200 with `{status:'ok'}` | `curl http://localhost:18180/health` | `{"status":"ok","timestamp":"2026-04-05T14:06:28.680Z"}` | ✓ PASS |
| POST /api/sessions route is wired (returns 500 without DB, not 404) | `curl -X POST http://localhost:18181/api/sessions` | HTTP 500, ECONNREFUSED (correct — no local Postgres) | ✓ PASS (route reached) |
| POST /api/analyze validates multipart content (400 without image) | `curl -X POST -F "type=analyze" http://localhost:18182/api/analyze` | `{"error":"Image file is required for analysis"}` | ✓ PASS |
| Vitest server tests pass | `npx vitest run --config vitest.config.server.ts` | 1 passed (1) | ✓ PASS |
| TypeScript compiles (server) | `npx tsc -p tsconfig.server.json --noEmit` | Exit 0, no errors | ✓ PASS |
| TypeScript compiles (full project) | `npx tsc -b` | Exit 0, no errors | ✓ PASS |
| Fresh build bundle is clean | `npm run build && grep -r "openai.com\|Bearer.*sk-" dist/assets/` | No matches | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INFRA-01 | 04-01, 04-03 | Express web service runs alongside static site on DO App Platform | ✓ SATISFIED | `server/app.ts` + `server/index.ts` confirmed working; `app.yaml` has `api-server` service alongside `dash-decoder-app` static site |
| INFRA-02 | 04-01, 04-02 | DO managed Postgres stores scan sessions, feedback, and AI call logs | ? HUMAN | Schema defined (`scan_sessions`, `feedback`, `ai_calls`); Drizzle client connected via DATABASE_URL; `run_command` in app.yaml runs `drizzle-kit push` before server start. Live Postgres required to confirm tables created. |
| INFRA-03 | 04-02 | Images uploaded to DO Spaces with server-side storage | ? HUMAN | `server/lib/spaces.ts` implements S3-compatible upload; `analyze.ts` calls `uploadToSpaces()` before sending URL to OpenAI. Live Spaces credentials required to confirm. |
| INFRA-04 | 04-02, 04-03 | OpenAI API calls proxied through Express (key never in frontend bundle) | ✓ SATISFIED | `src/lib/api/openai.ts` calls `fetch('/api/analyze')` only. Fresh build bundle grep returns zero OpenAI references. OPENAI_API_KEY is `type: SECRET, scope: RUN_TIME` in app.yaml (server-only). |
| INFRA-05 | 04-02 | AI call logging captures model, tokens, latency, and success/failure per call | ✓ SATISFIED (structurally) | `callOpenAIWithLogging` inserts `{model, promptTokens, completionTokens, latencyMs, success, errorMessage}` into `aiCalls` table in a `finally` block. All fields captured. Live verification requires Postgres. |

**Coverage:** All 5 phase-4 requirements (INFRA-01 through INFRA-05) are claimed by plans and have supporting implementation evidence. No orphaned requirements.

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `dist/assets/scan-BrlCuOUO.js` (stale) | Contains old direct OpenAI call code (`api.openai.com`, `Bearer ${t}`) | Pre-existing — build artifact was from Apr 4, before Plan 03 migration (Apr 5). Fresh build produces clean bundle. | ℹ️ Info — not a blocker; stale artifact only |

No TODO/FIXME/placeholder comments found in server/ code. No empty return stubs. No hardcoded API keys. The `is()` function in the stale bundle throws `"OpenAI API key not configured"` — confirming dead code even in the old build.

### Human Verification Required

#### 1. DO App Platform Deployment Health Check

**Test:** Deploy the app to DO App Platform (or confirm an existing deployment). Visit `GET https://<production-domain>/health`.
**Expected:** Returns `{"status":"ok","timestamp":"..."}` with HTTP 200. Both the static site and `api-server` service are listed as healthy in the DO App Platform console.
**Why human:** Cloud infrastructure state (DO App Platform deployment, running service) cannot be verified from the local filesystem.

#### 2. End-to-End Image Upload and AI Call Pipeline

**Test:** Use the deployed app (or local dev with `npm run dev` + `npm run dev:server` + real env vars). Upload a dashboard photo through the camera capture flow.
**Expected:**
- Image appears in the DO Spaces bucket (`dashdecoder-images`) under `uploads/` prefix
- A row exists in the `scan_sessions` table with the Spaces CDN URL in `image_url`
- A row exists in the `ai_calls` table with `model='gpt-4o'`, non-null `prompt_tokens`, non-null `completion_tokens`, non-null `latency_ms`, `success=true`
- Analysis result (warning light name, vehicle guess) is returned to the browser
**Why human:** Requires live DO Spaces bucket, valid OpenAI API key, and Postgres — none available locally.

#### 3. Database Schema Push on First Deploy

**Test:** Trigger a first-time deployment on DO App Platform and observe the build logs.
**Expected:** `run_command` in `app.yaml` executes `npx drizzle-kit push` successfully before `node dist/server/server/index.js` starts. All three tables (`scan_sessions`, `feedback`, `ai_calls`) are visible in DO managed Postgres via `psql` or database console.
**Why human:** Schema push is explicitly deferred to first DO deploy (no local `DATABASE_URL`). Cannot confirm table creation without deploying.

### Gaps Summary

No blocking gaps. All artifacts exist, are substantive, and are wired. TypeScript compiles cleanly for both server and frontend. The Vitest health test passes. The production bundle contains zero OpenAI direct call references.

The three human verification items above pertain to live cloud service behavior (DO App Platform, DO Spaces, managed Postgres) that cannot be tested without deployment. These are expected verifications for infrastructure phase completion — not code deficiencies.

The stale `dist/` build artifact was created April 4 (before the Plan 03 migration on April 5). A fresh `npm run build` produces a clean bundle confirming the migration is complete. The old `dist/` should be regenerated before deployment; the `run_command` in `app.yaml` triggers a fresh build on every DO deploy.

---

_Verified: 2026-04-05T14:07:00Z_
_Verifier: Claude (gsd-verifier)_
