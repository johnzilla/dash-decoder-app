---
phase: 04-backend-infrastructure
plan: 02
subsystem: backend
tags: [openai, do-spaces, express, drizzle, image-upload, ai-logging]
dependency_graph:
  requires: ["04-01"]
  provides: ["server/lib/prompts.ts", "server/lib/openai.ts", "server/lib/spaces.ts", "server/routes/sessions.ts", "server/routes/analyze.ts"]
  affects: ["server/app.ts"]
tech_stack:
  added: [multer, sharp, @aws-sdk/client-s3, openai SDK]
  patterns: [S3-compatible upload, AI call logging in finally block, CDN URL pattern for DO Spaces]
key_files:
  created:
    - server/lib/prompts.ts
    - server/lib/openai.ts
    - server/lib/spaces.ts
    - server/routes/sessions.ts
    - server/routes/analyze.ts
  modified:
    - server/app.ts
decisions:
  - "OpenAI logging wrapped in try/catch inside finally block — logging failure never breaks API response"
  - "Spread type error on parsed unknown fixed by casting to Record<string, unknown>"
  - "DO Spaces CDN URL format: {bucket}.{region}.cdn.digitaloceanspaces.com/{key}"
metrics:
  duration: "~6 min"
  completed: "2026-04-05"
  tasks_completed: 2
  files_created: 5
  files_modified: 1
---

# Phase 04 Plan 02: Core API Routes and Lib Files Summary

**One-liner:** Express routes for session CRUD and image-upload-to-AI pipeline with DO Spaces CDN URLs and per-call ai_calls logging.

## What Was Built

Three server lib files and two route files wired into the Express app, implementing the full backend API for the v1.1 experiment:

### Lib Files

**`server/lib/prompts.ts`** — Server-side copy of analysis and diagnosis prompts (D-08). Identical content to `src/lib/api/prompts.ts`. Exports `SYSTEM_PROMPT`, `getAnalysisPrompt`, `getDiagnosisPrompt`.

**`server/lib/openai.ts`** — OpenAI client with `timeout: 30_000` and `maxRetries: 0` (D-09). `callOpenAIWithLogging` wraps every call with timing, logs to `ai_calls` table in a `finally` block with its own try/catch so logging failures never propagate (D-10, D-11).

**`server/lib/spaces.ts`** — S3Client configured for DO Spaces. `uploadToSpaces(buffer, key, contentType)` stores images as `public-read` and returns the CDN URL in format `{bucket}.{region}.cdn.digitaloceanspaces.com/{key}` (D-05, D-07).

### Route Files

**`server/routes/sessions.ts`** — `POST /api/sessions` inserts an empty scan session row, returns `{ id, createdAt }` with 201. `PATCH /api/sessions/:id` updates only provided fields, returns 400 on missing fields, 404 on missing session.

**`server/routes/analyze.ts`** — Single endpoint handling two operations via `type` field:
- `type="analyze"`: multer receives image (10MB limit, image/* only), sharp resizes to 1200px wide at 85% JPEG quality (D-06), uploads to DO Spaces, creates scan session, calls OpenAI with CDN URL (D-07), updates session with analysis results.
- `type="diagnose"`: text-only diagnosis call with warningLight + vehicle body params, updates session severity if sessionId provided.
Returns 504 on timeout, 500 with generic message for other errors (T-04-09).

### App Wiring

**`server/app.ts`** updated to mount `sessionsRouter` at `/api/sessions` and `analyzeRouter` at `/api/analyze` before the error handler.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 515e2b6 | feat(04-02): create server lib files — prompts, OpenAI client with logging, DO Spaces upload |
| Task 2 | 00b1e5f | feat(04-02): create session and analyze routes, wire into Express app |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused `req` parameter in POST /api/sessions**
- **Found during:** Task 2 TypeScript compile check
- **Issue:** `async (req, res)` — `req` unused, TypeScript strict mode TS6133 error
- **Fix:** Renamed to `_req` to signal intentional non-use
- **Files modified:** server/routes/sessions.ts

**2. [Rule 1 - Bug] Fixed spread type error on `parsed` unknown**
- **Found during:** Task 2 TypeScript compile check
- **Issue:** `...parsed` on `unknown` type — TS2698 "Spread types may only be created from object types"
- **Fix:** Cast to `Record<string, unknown>` before spreading: `...(parsed as Record<string, unknown>)`
- **Files modified:** server/routes/analyze.ts

**3. [Rule 2 - Missing] Added try/catch around DB operations in sessions route**
- **Found during:** Task 2 implementation review
- **Issue:** Plan's sessions route snippet had no error handling for DB failures
- **Fix:** Wrapped `db.insert` and `db.update` calls in try/catch with 500 responses
- **Files modified:** server/routes/sessions.ts

## Known Stubs

None — all routes are fully implemented. DO Spaces and OpenAI calls require env vars (`SPACES_KEY`, `SPACES_SECRET`, `SPACES_BUCKET`, `SPACES_REGION`, `OPENAI_API_KEY`) to be configured for live operation.

## Threat Surface Scan

No new threat surface beyond what the plan's threat model covers. All T-04-04 through T-04-09 mitigations are implemented:
- multer `fileSize: 10MB` limit and `image/*` MIME filter (T-04-04, T-04-05)
- OpenAI key only in `process.env`, never returned in responses (T-04-06)
- Spaces credentials only in `process.env` (T-04-07)
- Generic error messages in catch blocks, full errors to `console.error` (T-04-09)

## Self-Check

### Files exist:
- server/lib/prompts.ts: FOUND
- server/lib/openai.ts: FOUND
- server/lib/spaces.ts: FOUND
- server/routes/sessions.ts: FOUND
- server/routes/analyze.ts: FOUND
- server/app.ts (modified): FOUND

### Commits exist:
- 515e2b6: FOUND (feat(04-02): create server lib files)
- 00b1e5f: FOUND (feat(04-02): create session and analyze routes)

## Self-Check: PASSED
