# Phase 4: Backend Infrastructure - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Express server that proxies OpenAI calls server-side, stores uploaded images in DO Spaces, and logs every AI call to Postgres. The frontend switches from direct OpenAI API calls to the new Express proxy. Feedback card UI, analytics, and rate limiting are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Database Setup
- **D-01:** Drizzle ORM for schema management and type-safe queries, with generated migrations
- **D-02:** pg library with connection pool for Postgres connectivity (not Drizzle's built-in pool)
- **D-03:** DATABASE_URL env var for credentials (DO App Platform injects this automatically)
- **D-04:** Three tables only: scan_sessions, feedback, ai_calls — primary keys, foreign keys, created_at timestamps. Indexes deferred until real query patterns emerge

### Image Upload Flow
- **D-05:** Multipart upload through Express — frontend sends image to Express, Express uploads to DO Spaces
- **D-06:** Server-side resize to ~1200px wide using Sharp before storing (saves storage and reduces OpenAI payload)
- **D-07:** DO Spaces CDN URL used when sending images to OpenAI (public URL, no base64)

### OpenAI Proxy Design
- **D-08:** Copy prompts from src/lib/api/prompts.ts to /server — prompts become server-only, no client-side exposure
- **D-09:** 30s timeout on OpenAI calls with structured JSON error responses and user-friendly messages
- **D-10:** Buffered responses (not streaming) — wait for full response, parse JSON, validate, log token counts, then return to client
- **D-11:** Every AI call logged to ai_calls table with model, token counts, latency, and success/failure status

### Frontend Migration
- **D-12:** Big bang cutover — replace src/lib/api/openai.ts to call Express endpoints instead of OpenAI directly. Old client-side path removed entirely
- **D-13:** VITE_OPENAI_API_KEY removed from frontend config completely — Vite build has zero OpenAI references
- **D-14:** Relative paths for API calls (/api/sessions, /api/analyze). Vite dev proxy forwards to Express; DO App Platform routes /api/* to web service in production

### Claude's Discretion
- Express middleware stack (CORS, body parser, error handler)
- Multer or busboy for multipart parsing
- DO Spaces client library choice (aws-sdk v3 or @aws-sdk/client-s3)
- Exact Drizzle schema column types and naming conventions
- Health check endpoint implementation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API Contract (from STATE.md decisions)
- `.planning/STATE.md` — API contract: POST/PATCH /api/sessions, POST /api/sessions/:id/feedback, POST /api/analyze
- `.planning/STATE.md` — DB schema: scan_sessions, feedback, ai_calls tables

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-01 through INFRA-05 define backend infrastructure requirements

### Existing Frontend Code (to be migrated)
- `src/lib/api/openai.ts` — Current client-side OpenAI integration (to be replaced with Express proxy calls)
- `src/lib/api/prompts.ts` — System prompt and analysis/diagnosis prompt templates (to be copied to server)
- `src/types/api.ts` — Zod schemas for VisionAnalysisResult, DiagnosisRequest, ScanFlowState
- `src/hooks/useVisionAnalysis.ts` — Hook that calls OpenAI (will need to call Express proxy instead)

### Deployment
- `.do/app.yaml` or DO App Platform dashboard — Current static site config needs web service component added

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/api.ts`: Zod schemas (VisionAnalysisResultSchema, DiagnosisRequestSchema) — can inform server-side validation
- `src/lib/api/prompts.ts`: System prompt, analysis prompt, diagnosis prompt — will be copied to server
- `src/types/vehicle.ts`, `src/types/diagnosis.ts`: Type definitions that server responses must match

### Established Patterns
- Zod for runtime validation throughout the frontend
- TypeScript with path aliases (`@/` = `src/`)
- Vite for build tooling with PWA plugin
- React Router for client-side routing

### Integration Points
- `src/lib/api/openai.ts` — Replace `analyzeWarningLight()` and `generateDiagnosis()` to call Express proxy
- `src/hooks/useVisionAnalysis.ts` — Update to send multipart image upload instead of base64 data URL
- `vite.config.ts` — Add dev proxy for `/api/*` to Express dev server
- `package.json` — Add server dependencies and scripts (or separate server/package.json)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-backend-infrastructure*
*Context gathered: 2026-04-05*
