---
phase: 04-backend-infrastructure
plan: "03"
subsystem: frontend-proxy-migration
tags: [proxy, migration, vite, digitalocean, drizzle]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [frontend-express-proxy-wiring, do-app-yaml-multicomponent, vite-dev-proxy]
  affects: [src/lib/api/openai.ts, src/hooks/useVisionAnalysis.ts, vite.config.ts, .do/app.yaml]
tech_stack:
  added: []
  patterns:
    - "FormData multipart upload to Express proxy instead of direct OpenAI base64 calls"
    - "File objects (not data URLs) flow through scan state machine"
    - "URL.createObjectURL for display, revoked on component cleanup"
    - "FileReader.readAsDataURL bridge for imageQuality validation (still needs string)"
    - "DO App Platform ingress with preserve_path_prefix: true for /api routing"
key_files:
  created: []
  modified:
    - src/lib/api/openai.ts
    - src/hooks/useVisionAnalysis.ts
    - src/hooks/useCamera.ts
    - src/types/api.ts
    - src/context/ScanContext.tsx
    - src/routes/scan.tsx
    - src/components/camera/CameraPreview.tsx
    - src/components/scan/ScanningAnimation.tsx
    - src/components/validation/ImageQualityFeedback.tsx
    - src/vite-env.d.ts
    - vite.config.ts
    - .do/app.yaml
  deleted:
    - src/lib/api/prompts.ts
decisions:
  - "imageQuality.ts retains string API — bridge via FileReader.readAsDataURL in scan.tsx (avoids rewriting canvas analysis)"
  - "Diagnosis.imageDataUrl field kept in diagnosis.ts — populated via URL.createObjectURL for results display"
  - "useCamera.capturePhoto() returns File (via atob/ArrayBuffer from canvas.toDataURL) — synchronous, avoids toBlob async complexity"
  - "DB schema push deferred to first DO deploy via run_command; DATABASE_URL not available locally"
metrics:
  duration: "~15 min"
  completed: "2026-04-05T14:02:12Z"
  tasks_completed: 2
  files_changed: 13
---

# Phase 04 Plan 03: Frontend-to-Express Proxy Migration Summary

Frontend fully migrated from direct GPT-4o Vision calls to Express proxy via FormData multipart upload, scan state machine updated to carry File objects instead of data URL strings, Vite dev proxy configured, and app.yaml replaced with multi-component DO App Platform spec including ingress routing and managed Postgres database.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Replace frontend OpenAI client with Express proxy calls and update hook | 37f2096 | src/lib/api/openai.ts, src/hooks/useVisionAnalysis.ts, src/types/api.ts, src/context/ScanContext.tsx, src/routes/scan.tsx, src/components/scan/ScanningAnimation.tsx, src/components/validation/ImageQualityFeedback.tsx, src/hooks/useCamera.ts, src/vite-env.d.ts |
| 2 | Add Vite dev proxy, update app.yaml, push database schema | 139a260 | vite.config.ts, .do/app.yaml |

## What Was Built

### Task 1: Frontend OpenAI -> Express Proxy Migration

**src/lib/api/openai.ts** completely replaced: removed all OpenAI SDK references, VITE_OPENAI_API_KEY, Bearer token, and direct `https://api.openai.com` calls. Now a thin HTTP client:
- `analyzeWarningLight(imageFile: File)` — sends multipart/form-data to `POST /api/analyze`
- `generateDiagnosis(warningLight, vehicle, sessionId?)` — sends JSON to `POST /api/analyze` with `type: "diagnose"`

**Scan state machine** migrated from `imageDataUrl: string` to `imageFile: File` throughout:
- `ScanFlowState` in `src/types/api.ts`: all carrying states now use `imageFile: File`
- `ScanContext.tsx` actions updated to carry `imageFile: File`
- `useCamera.capturePhoto()` now returns `File` (synchronously via atob from canvas.toDataURL)
- `CameraPreview.onCapture` prop changed to `(imageFile: File) => void`
- `ScanningAnimation` and `ImageQualityFeedback` accept `imageFile: File`, use `URL.createObjectURL` for display

**Bridge pattern** in scan.tsx: `validateImageQuality` still requires a data URL string (canvas-based), so a `fileToDataUrl(file)` FileReader helper bridges File → string for validation only.

**Deleted**: `src/lib/api/prompts.ts` (server-only concern, server has its own copy at `server/lib/prompts.ts`).

**Cleaned**: `src/vite-env.d.ts` — removed `VITE_OPENAI_API_KEY` from `ImportMetaEnv`.

Verification: `npx tsc -b` exits 0; `grep -r "VITE_OPENAI_API_KEY|openai.com" src/` returns no results.

### Task 2: Vite Dev Proxy + app.yaml Multi-Component Spec

**vite.config.ts**: Added `server.proxy` block forwarding `/api/*` to `http://localhost:8080`. Removed `runtimeCaching` for `api.openai.com` (frontend no longer calls OpenAI directly).

**.do/app.yaml**: Complete replacement with multi-component spec:
- `ingress.rules`: `/api` → `api-server` with `preserve_path_prefix: true` (critical per Research Pitfall 1 — without this, Express sees `/` instead of `/api/analyze` and 404s)
- `services.api-server`: Node.js service, `run_command: npx drizzle-kit push && node dist/server/server/index.js`
- `static_sites.dash-decoder-app`: `envs: []` — no VITE_OPENAI_API_KEY (D-13 complete)
- `databases.postgres`: Managed PG, production: true
- Secrets (`OPENAI_API_KEY`, `SPACES_KEY`, `SPACES_SECRET`) marked `type: SECRET, scope: RUN_TIME` only — never build-time on static site

**Database schema push**: `DATABASE_URL` not available locally; `npx drizzle-kit push` failed with connection error (expected). Schema push will execute automatically on first DO deploy via `run_command` in app.yaml.

**Build verification**: `npm run build` succeeded; `grep -rE "sk-[a-zA-Z0-9]{20,}" dist/` returned no results (actual API keys). Short `sk-` strings in bundle are Tailwind CSS mask class names (`sk-clip`, `sk-composite`, etc.) — not secrets.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Updated useCamera.capturePhoto() to return File**
- **Found during:** Task 1 — plan required File but camera hook returned string
- **Fix:** Changed `capturePhoto()` return type to `File | null`, uses atob from canvas.toDataURL to construct File synchronously
- **Files modified:** src/hooks/useCamera.ts
- **Commit:** 37f2096

**2. [Rule 1 - Bug] Updated all scan flow components to accept File**
- **Found during:** Task 1 — ScanningAnimation, ImageQualityFeedback, CameraPreview all used imageDataUrl string prop
- **Fix:** Changed all three components to accept `imageFile: File`, use `URL.createObjectURL` with `useEffect` cleanup for memory management
- **Files modified:** src/components/scan/ScanningAnimation.tsx, src/components/validation/ImageQualityFeedback.tsx, src/components/camera/CameraPreview.tsx
- **Commit:** 37f2096

**3. [Rule 2 - Missing] Removed VITE_OPENAI_API_KEY from src/vite-env.d.ts**
- **Found during:** Task 1 verification — `grep -r "VITE_OPENAI_API_KEY" src/` still hit vite-env.d.ts
- **Fix:** Stripped `ImportMetaEnv` interface down to just the `/// <reference>` line
- **Files modified:** src/vite-env.d.ts
- **Commit:** 37f2096

**4. [Rule 3 - Blocking] Added fileToDataUrl bridge for imageQuality validation**
- **Found during:** Task 1 — `validateImageQuality` accepts `string` (data URL), not File; changing it would risk breaking canvas analysis
- **Fix:** Added `fileToDataUrl(file: File): Promise<string>` helper in scan.tsx using FileReader; validation still works, no rewrite of imageQuality.ts
- **Files modified:** src/routes/scan.tsx
- **Commit:** 37f2096

### Known Deferred Items

**Database schema push**: `npx drizzle-kit push` not executed locally (no `DATABASE_URL`). Will execute automatically via `run_command: npx drizzle-kit push && node dist/server/server/index.js` on first DO deploy. This is expected behavior per plan note.

## Known Stubs

None — all data flows are wired. The `sessionId` in `useVisionAnalysis` is tracked as state but not yet populated from the server response (the API response includes `sessionId` but `VisionAnalysisResultSchema` doesn't include it). This is an intentional omission — sessionId wiring is a future concern when persistence features are added.

## Threat Flags

No new threat surface introduced beyond what was planned. Mitigations applied:

| Threat ID | Status | Evidence |
|-----------|--------|---------|
| T-04-10 | Mitigated | VITE_OPENAI_API_KEY removed from src/vite-env.d.ts, static_sites envs: [], no API keys in dist/ |
| T-04-11 | Mitigated | OPENAI_API_KEY, SPACES_KEY, SPACES_SECRET: type: SECRET, scope: RUN_TIME only in app.yaml |
| T-04-12 | Mitigated | preserve_path_prefix: true on /api ingress rule in app.yaml |

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/api/openai.ts | FOUND |
| src/hooks/useVisionAnalysis.ts | FOUND |
| src/types/api.ts | FOUND |
| src/context/ScanContext.tsx | FOUND |
| src/routes/scan.tsx | FOUND |
| vite.config.ts | FOUND |
| .do/app.yaml | FOUND |
| src/lib/api/prompts.ts deleted | CONFIRMED |
| Task 1 commit 37f2096 | FOUND |
| Task 2 commit 139a260 | FOUND |
| npx tsc -b exits 0 | PASSED |
| No VITE_OPENAI_API_KEY in src/ | PASSED |
| npm run build succeeds | PASSED |
| No API keys in dist/ | PASSED |
