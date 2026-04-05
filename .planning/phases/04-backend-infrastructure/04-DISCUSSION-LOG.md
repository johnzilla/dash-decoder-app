# Phase 4: Backend Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 04-backend-infrastructure
**Areas discussed:** Database setup, Image upload flow, OpenAI proxy design, Frontend migration

---

## Database Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Drizzle ORM | Lightweight, TypeScript-native, generates migrations from schema files | ✓ |
| Raw SQL migrations | Plain .sql files, maximum control, no ORM dependency | |
| Prisma | Full-featured ORM, heavier than needed for 3 tables | |

**User's choice:** Drizzle ORM
**Notes:** Good fit for a small Express app — no heavy abstraction

| Option | Description | Selected |
|--------|-------------|----------|
| pg + connection pool | Use pg library directly with a Pool. Simple, proven | ✓ |
| Drizzle's built-in pool | Let Drizzle manage the connection pool internally | |
| You decide | Claude picks based on ORM choice | |

**User's choice:** pg + connection pool

| Option | Description | Selected |
|--------|-------------|----------|
| Just 3 tables + basics | PKs, FKs, created_at. Add indexes later | ✓ |
| Add indexes upfront | Index on session_id, created_at for time-range queries | |
| You decide | Claude picks sensible defaults | |

**User's choice:** Just the 3 tables + basics

| Option | Description | Selected |
|--------|-------------|----------|
| DATABASE_URL env var | Single connection string, DO injects automatically | ✓ |
| Separate env vars | Individual DB_HOST, DB_PORT, etc. | |

**User's choice:** DATABASE_URL env var

---

## Image Upload Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Multipart through Express | Frontend sends image to Express, Express uploads to Spaces | ✓ |
| Presigned URL (direct upload) | Express generates presigned URL, frontend uploads directly | |
| You decide | Claude picks best approach | |

**User's choice:** Multipart through Express

| Option | Description | Selected |
|--------|-------------|----------|
| Resize server-side | Cap at ~1200px wide using Sharp before storing | ✓ |
| Store as-is | Keep original resolution | |
| Resize client-side | Use canvas API to downscale before upload | |

**User's choice:** Resize server-side

| Option | Description | Selected |
|--------|-------------|----------|
| DO Spaces CDN URL | Public CDN URL, OpenAI fetches directly | ✓ |
| Presigned private URL | Temporary signed URL, more secure but complex | |
| You decide | Claude picks based on security/simplicity tradeoff | |

**User's choice:** DO Spaces CDN URL

---

## OpenAI Proxy Design

| Option | Description | Selected |
|--------|-------------|----------|
| Copy prompts to server | Move prompt logic to /server, server-only | ✓ |
| Share prompts via shared package | Extract to shared/ directory, adds monorepo complexity | |
| You decide | Claude picks based on project structure | |

**User's choice:** Copy prompts to server

| Option | Description | Selected |
|--------|-------------|----------|
| Timeout + structured errors | 30s timeout, structured JSON errors, log failures | ✓ |
| Simple passthrough | Forward OpenAI errors as-is | |
| You decide | Claude picks sensible error handling | |

**User's choice:** Timeout + structured errors

| Option | Description | Selected |
|--------|-------------|----------|
| Buffer | Wait for full response, parse, validate, log, return | ✓ |
| Stream via SSE | Stream tokens for real-time display | |
| You decide | Claude picks based on experiment needs | |

**User's choice:** Buffer

---

## Frontend Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Big bang in this phase | Replace openai.ts to call Express. Clean break | ✓ |
| Feature flag toggle | Env var to switch between direct and proxy | |
| You decide | Claude picks based on project state | |

**User's choice:** Big bang in this phase

| Option | Description | Selected |
|--------|-------------|----------|
| Remove entirely | Delete VITE_OPENAI_API_KEY. Zero OpenAI in frontend build | ✓ |
| Keep as fallback | Keep for local dev without server | |

**User's choice:** Remove entirely

| Option | Description | Selected |
|--------|-------------|----------|
| Relative paths | /api/sessions, /api/analyze. Vite dev proxy + DO routing | ✓ |
| VITE_API_URL env var | Explicit base URL, requires CORS config | |
| You decide | Claude picks simplest for DO App Platform | |

**User's choice:** Relative paths

---

## Claude's Discretion

- Express middleware stack (CORS, body parser, error handler)
- Multer or busboy for multipart parsing
- DO Spaces client library choice
- Exact Drizzle schema column types and naming conventions
- Health check endpoint implementation details

## Deferred Ideas

None — discussion stayed within phase scope
