# Security Audit — DashDecoder

**Phase:** 04 — Backend Infrastructure
**Audited:** 2026-04-05
**ASVS Level:** 1
**Auditor:** gsd-security-auditor

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-04-01 | Information Disclosure | mitigate | CLOSED | server/middleware/errorHandler.ts:12 — `NODE_ENV === 'development' ? err.message : 'Something went wrong'` |
| T-04-02 | Information Disclosure | mitigate | CLOSED | server/db/client.ts:5 — `process.env.DATABASE_URL` (no hardcoded value); .gitignore:9 excludes `.env` |
| T-04-03 | Denial of Service | accept | CLOSED | Documented in Accepted Risks below |
| T-04-04 | Denial of Service | mitigate | CLOSED | server/routes/analyze.ts:16 — `limits: { fileSize: 10 * 1024 * 1024 }`; lines 56-59 Sharp resize |
| T-04-05 | Tampering | mitigate | CLOSED | server/routes/analyze.ts:17-24 — `fileFilter` rejects MIME types not starting with `image/` |
| T-04-06 | Information Disclosure | mitigate | CLOSED | server/lib/openai.ts:6 — `process.env.OPENAI_API_KEY`; no reference in src/lib/api/openai.ts |
| T-04-07 | Information Disclosure | mitigate | CLOSED | server/lib/spaces.ts:8-9 — `process.env.SPACES_KEY`, `process.env.SPACES_SECRET`; not returned in responses |
| T-04-08 | Tampering | accept | CLOSED | Documented in Accepted Risks below |
| T-04-09 | Information Disclosure | mitigate | CLOSED | server/routes/analyze.ts:141-152 — `console.error` server-side, generic message to client; sessions.ts:13-16, 58-61 same pattern |
| T-04-10 | Information Disclosure | mitigate | CLOSED | src/lib/api/openai.ts — no VITE_OPENAI_API_KEY; .do/app.yaml static_sites.envs: []; vite.config.ts workbox empty |
| T-04-11 | Information Disclosure | mitigate | CLOSED | .do/app.yaml:38-44 — OPENAI_API_KEY, SPACES_KEY, SPACES_SECRET: `type: SECRET, scope: RUN_TIME` |
| T-04-12 | Tampering | mitigate | CLOSED | .do/app.yaml:14 — `preserve_path_prefix: true` on /api ingress rule |

---

## Accepted Risks

### T-04-03 — Denial of Service: /health endpoint

- **Component:** `server/routes/health.ts`
- **Risk:** Unauthenticated, rate-unlimited endpoint could be called at high volume.
- **Rationale:** Endpoint is fully stateless — no database query, no external I/O, no heap allocation beyond a small JSON serialization. Cost per request is bounded and negligible. Adding rate limiting to /health would require infra complexity disproportionate to actual exposure.
- **Accepted by:** Plan 04-01 threat model
- **Review trigger:** If server bills show anomalous compute cost attributable to /health traffic, apply rate limiting at the DO App Platform edge or add an express-rate-limit middleware.

---

### T-04-08 — Tampering: PATCH /api/sessions/:id

- **Component:** `server/routes/sessions.ts`
- **Risk:** Sequential integer session IDs with no authentication mean any caller who guesses or enumerates an ID can overwrite session fields (vehicleMake, vehicleModel, warningLightName, severity, etc.).
- **Rationale:** All session data is anonymous experiment telemetry for the v1.1 Value Proposition Experiment. No PII is stored. No financial or safety decisions are made from this data. Corrupted rows degrade analytics quality but do not affect end-users. Authentication is explicitly deferred to v2 per EXPT-04.
- **Accepted by:** Plan 04-02 threat model
- **Review trigger:** Before storing any PII, before using session data to influence user-facing behavior, or before v2 auth implementation — whichever comes first. At that point, session ownership tokens or bearer auth must gate PATCH.

---

## Unregistered Threat Flags

None. All threat flags reported in 04-01-SUMMARY.md, 04-02-SUMMARY.md, and 04-03-SUMMARY.md map directly to registered threat IDs (T-04-01 through T-04-12).

---

## Audit Notes

- `src/lib/api/prompts.ts` was deleted during Phase 04 Plan 03 (confirmed in 04-03-SUMMARY.md). Prompts are now server-only at `server/lib/prompts.ts`. This reduces the prompt text exposure surface in the frontend bundle.
- The frontend `vite.config.ts` workbox config explicitly comments "No runtime caching for external APIs" with an empty block, confirming the prior `api.openai.com` runtime cache entry was removed.
- Build-time grep verification (`grep -rE "sk-[a-zA-Z0-9]{20,}" dist/`) confirmed no API keys in the production bundle. Short `sk-` strings in the bundle are Tailwind CSS class names, not secrets.
- Database schema push (`drizzle-kit push`) is deferred to first DO deploy via `run_command` in app.yaml. This is a deployment sequencing decision, not a security gap.
