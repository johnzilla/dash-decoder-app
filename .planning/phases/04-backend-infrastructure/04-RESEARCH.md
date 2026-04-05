# Phase 4: Backend Infrastructure - Research

**Researched:** 2026-04-05
**Domain:** Express/TypeScript server, Drizzle ORM, DO Spaces (S3), OpenAI proxy, DO App Platform
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Drizzle ORM for schema management and type-safe queries, with generated migrations
- **D-02:** pg library with connection pool for Postgres connectivity (not Drizzle's built-in pool)
- **D-03:** DATABASE_URL env var for credentials (DO App Platform injects this automatically)
- **D-04:** Three tables only: scan_sessions, feedback, ai_calls — primary keys, foreign keys, created_at timestamps. Indexes deferred until real query patterns emerge
- **D-05:** Multipart upload through Express — frontend sends image to Express, Express uploads to DO Spaces
- **D-06:** Server-side resize to ~1200px wide using Sharp before storing (saves storage and reduces OpenAI payload)
- **D-07:** DO Spaces CDN URL used when sending images to OpenAI (public URL, no base64)
- **D-08:** Copy prompts from src/lib/api/prompts.ts to /server — prompts become server-only, no client-side exposure
- **D-09:** 30s timeout on OpenAI calls with structured JSON error responses and user-friendly messages
- **D-10:** Buffered responses (not streaming) — wait for full response, parse JSON, validate, log token counts, then return to client
- **D-11:** Every AI call logged to ai_calls table with model, token counts, latency, and success/failure status
- **D-12:** Big bang cutover — replace src/lib/api/openai.ts to call Express endpoints instead of OpenAI directly. Old client-side path removed entirely
- **D-13:** VITE_OPENAI_API_KEY removed from frontend config completely — Vite build has zero OpenAI references
- **D-14:** Relative paths for API calls (/api/sessions, /api/analyze). Vite dev proxy forwards to Express; DO App Platform routes /api/* to web service in production

### Claude's Discretion

- Express middleware stack (CORS, body parser, error handler)
- Multer or busboy for multipart parsing
- DO Spaces client library choice (aws-sdk v3 or @aws-sdk/client-s3)
- Exact Drizzle schema column types and naming conventions
- Health check endpoint implementation details

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Express web service runs alongside static site on DO App Platform | DO App Platform multi-component app.yaml ingress rules |
| INFRA-02 | DO managed Postgres stores scan sessions, feedback, and AI call logs | Drizzle ORM + pg Pool + DATABASE_URL injection |
| INFRA-03 | Images uploaded to DO Spaces with server-side storage | Multer → Sharp resize → @aws-sdk/client-s3 PutObjectCommand |
| INFRA-04 | OpenAI API calls proxied through Express (key never in frontend bundle) | Express proxy route + VITE_OPENAI_API_KEY removal + Vite dev proxy |
| INFRA-05 | AI call logging captures model, tokens, latency, and success/failure per call | ai_calls table insert wrapping every OpenAI fetch |
</phase_requirements>

---

## Summary

Phase 4 adds an Express web service to what is currently a purely static-site deployment on DO App Platform. The primary moving parts are: (1) a `/server` directory with its own tsconfig targeting Node.js CommonJS output, (2) three Drizzle-managed Postgres tables, (3) a Multer + Sharp + S3 image upload pipeline, (4) Express routes that proxy both OpenAI calls with full AI-call logging, and (5) updates to the DO app.yaml to add the web service component, Postgres database binding, and ingress routing rules that send `/api/*` to the Express service while leaving everything else to the existing static site.

The frontend migration is a clean swap: `src/lib/api/openai.ts` becomes a thin HTTP client calling `/api/analyze` and `/api/sessions`. The `useVisionAnalysis` hook currently passes `imageDataUrl` (base64) directly to OpenAI; it must be updated to send a `multipart/form-data` request with the raw `Blob`/`File` instead — this is the highest-risk integration point.

The key architectural subtlety in the DO App Platform setup is `preserve_path_prefix: true` on the `/api` ingress rule. Without it, DO strips the `/api` prefix before forwarding to Express, which breaks all Express route definitions.

**Primary recommendation:** Structure as a single-repo monorepo with `server/` alongside `src/`. Use tsx for local dev (no build step), tsc + node for production. Keep server dependencies in root `package.json` under a clear `# server` comment block, or add a `server/package.json` — either works; the simpler single-`package.json` approach is preferred for a project this size.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | 5.2.1 | HTTP server and routing | De facto Node.js web framework; v5 is now stable (released late 2024) |
| @types/express | 5.0.6 | TypeScript types | Ships alongside express v5 |
| drizzle-orm | 0.45.2 | Schema definition + type-safe query builder | Lightest-weight TS-native ORM; generates SQL migrations |
| drizzle-kit | 0.31.10 | CLI for generating and applying migrations | Companion to drizzle-orm |
| pg | 8.20.0 | node-postgres driver with connection pool | Drizzle's recommended driver for standard Postgres |
| @types/pg | 8.20.0 | TypeScript types for pg | Matches pg version |
| multer | 2.1.1 | Multipart form-data parsing | Standard Express middleware for file uploads |
| @types/multer | 2.1.0 | TypeScript types for multer | Matches multer v2 |
| sharp | 0.34.5 | High-performance image resize/convert | ~4-5x faster than ImageMagick; handles all common formats |
| @aws-sdk/client-s3 | 3.1024.0 | S3-compatible upload to DO Spaces | Modular AWS SDK v3; DO Spaces is S3-compatible |
| openai | 6.33.0 | OpenAI Node SDK | Official SDK; simplifies auth, retries, type safety |
| zod | 4.3.6 | Runtime response validation | Already in project; apply server-side for OpenAI response validation |
| cors | 2.8.6 | CORS middleware | Standard; needed for Vite dev proxy |
| @types/cors | 2.8.19 | TypeScript types for cors | Matches cors |
| helmet | 8.1.0 | Security headers middleware | Minimal overhead, eliminates common header-based vulnerabilities |
| dotenv | 17.4.0 | Load .env in local dev | Standard env management outside DO App Platform |

### Supporting (dev / test)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | 4.21.0 | Run TypeScript directly in Node | Local dev server without a build step |
| vitest | 4.1.2 | Test runner | Already decided; integration tests for all API endpoints |
| supertest | 7.2.2 | HTTP assertions against Express app | De facto companion to Vitest for Express integration tests |
| @types/supertest | 7.2.0 | TypeScript types for supertest | Matches supertest |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| multer | busboy | busboy is lower-level; multer wraps it with Express middleware conventions and `req.file` sugar — simpler for this use case |
| @aws-sdk/client-s3 | multer-s3 | multer-s3 couples upload parsing with S3 storage, making it hard to run Sharp in between; manual upload via PutObjectCommand gives control over the pipeline order |
| tsx | ts-node | tsx is faster (esbuild-based) and doesn't require `esm` loader flags; ts-node 10.x has known friction with newer module resolution |

**Installation (server dependencies to add to root package.json):**
```bash
npm install express cors helmet multer sharp @aws-sdk/client-s3 openai drizzle-orm pg dotenv
npm install -D @types/express @types/cors @types/multer @types/pg drizzle-kit tsx vitest supertest @types/supertest
```

**Version verification:** All versions above confirmed via `npm view [package] version` on 2026-04-05. [VERIFIED: npm registry]

---

## Architecture Patterns

### Recommended Project Structure

```
/                              ← repo root
├── src/                       ← existing frontend (React/Vite)
│   ├── lib/api/openai.ts      ← REPLACE: becomes thin proxy client
│   ├── lib/api/prompts.ts     ← REMOVE: prompts move to server
│   ├── hooks/useVisionAnalysis.ts  ← UPDATE: sends multipart, not base64
│   └── types/api.ts           ← keep; server responses must match these shapes
├── server/                    ← NEW: Express web service
│   ├── index.ts               ← app entry: listen on PORT
│   ├── app.ts                 ← Express app factory (exported for tests)
│   ├── db/
│   │   ├── schema.ts          ← Drizzle table definitions
│   │   ├── client.ts          ← Pool + drizzle() singleton
│   │   └── migrations/        ← generated by drizzle-kit (committed to git)
│   ├── lib/
│   │   ├── prompts.ts         ← copied from src/lib/api/prompts.ts
│   │   ├── openai.ts          ← callOpenAI() with logging wrapper
│   │   └── spaces.ts          ← S3Client + uploadToSpaces()
│   ├── routes/
│   │   ├── health.ts          ← GET /health
│   │   ├── sessions.ts        ← POST/PATCH /api/sessions
│   │   └── analyze.ts         ← POST /api/analyze
│   └── middleware/
│       └── errorHandler.ts    ← centralized error handler
├── drizzle.config.ts          ← drizzle-kit config (points to server/db/schema.ts)
├── tsconfig.server.json       ← server-specific TS config
├── vitest.config.server.ts    ← vitest config for server tests
└── .do/app.yaml               ← ADD: services component + ingress rules
```

### Pattern 1: Separate server tsconfig

The root `tsconfig.json` targets `bundler` moduleResolution for Vite — incompatible with Node.js. The server needs a separate config that emits CommonJS (or ESM with `.js` extensions). [ASSUMED: CommonJS is simpler here because pg, multer, and sharp all have reliable CJS builds and tsx handles it transparently in dev]

```jsonc
// tsconfig.server.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "dist/server",
    "rootDir": ".",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["server/**/*.ts", "drizzle.config.ts"]
}
```

### Pattern 2: Express app factory (testable)

Export the Express app separately from `listen()` so Vitest/supertest can import the app without binding a port.

```typescript
// server/app.ts
// Source: standard Express + supertest testing pattern
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.js';
import { sessionsRouter } from './routes/sessions.js';
import { analyzeRouter } from './routes/analyze.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/api/sessions', sessionsRouter);
  app.use('/api/analyze', analyzeRouter);
  app.use(errorHandler);
  return app;
}

// server/index.ts
import { createApp } from './app.js';
const app = createApp();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
```

### Pattern 3: Drizzle schema with pg Pool

```typescript
// server/db/client.ts
// Source: https://orm.drizzle.team/docs/get-started/postgresql-new [VERIFIED: official docs]
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle({ client: pool, schema });
```

```typescript
// server/db/schema.ts — three tables per D-04
import {
  pgTable, integer, varchar, text, boolean,
  timestamp, real
} from 'drizzle-orm/pg-core';

export const scanSessions = pgTable('scan_sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  imageUrl: text('image_url'),
  warningLightName: text('warning_light_name'),
  vehicleMake: varchar('vehicle_make', { length: 100 }),
  vehicleModel: varchar('vehicle_model', { length: 100 }),
  vehicleYear: integer('vehicle_year'),
  severity: varchar('severity', { length: 20 }),
});

export const feedback = pgTable('feedback', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer('session_id').notNull().references(() => scanSessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  rating: integer('rating'),
  comment: text('comment'),
});

export const aiCalls = pgTable('ai_calls', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer('session_id').references(() => scanSessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  model: varchar('model', { length: 50 }).notNull(),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  latencyMs: integer('latency_ms'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
});
```

### Pattern 4: Multer → Sharp → S3 upload pipeline

Decision D-05/D-06/D-07 require: receive multipart, resize in memory, upload to Spaces, return CDN URL.

```typescript
// server/lib/spaces.ts
// Source: https://docs.digitalocean.com/products/spaces/how-to/use-aws-sdks/ [CITED]
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  forcePathStyle: false,
  endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
  region: 'us-east-1', // required by SDK even for DO Spaces
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

export async function uploadToSpaces(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.SPACES_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }));
  // CDN URL format
  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com/${key}`;
}
```

```typescript
// server/routes/analyze.ts (image upload + resize + S3 + OpenAI)
import multer from 'multer';
import sharp from 'sharp';
import { uploadToSpaces } from '../lib/spaces.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('image'), async (req, res) => {
  const resized = await sharp(req.file!.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.jpg`;
  const imageUrl = await uploadToSpaces(resized, key, 'image/jpeg');
  // imageUrl passed to OpenAI as image_url, not base64
});
```

### Pattern 5: DO app.yaml multi-component with ingress routing

```yaml
# .do/app.yaml
name: dashdecoder-app
region: nyc

ingress:
  rules:
    - match:
        path:
          prefix: /api
      component:
        name: api-server
        preserve_path_prefix: true   # CRITICAL: Express receives /api/... not /...
    - match:
        path:
          prefix: /
      component:
        name: dash-decoder-app

services:
  - name: api-server
    github:
      repo: johnzilla/dash-decoder-app
      branch: main
      deploy_on_push: true
    environment_slug: node-js
    http_port: 8080
    run_command: node dist/server/index.js
    build_command: npm install && npm run build:server
    instance_size_slug: apps-s-1vcpu-1gb
    instance_count: 1
    envs:
      - key: DATABASE_URL
        value: ${postgres.DATABASE_URL}
        scope: RUN_AND_BUILD_TIME
      - key: OPENAI_API_KEY
        scope: RUN_TIME
        type: SECRET
      - key: SPACES_KEY
        scope: RUN_TIME
        type: SECRET
      - key: SPACES_SECRET
        scope: RUN_TIME
        type: SECRET
      - key: SPACES_BUCKET
        value: dashdecoder-images
        scope: RUN_TIME
      - key: SPACES_REGION
        value: nyc3
        scope: RUN_TIME

static_sites:
  - name: dash-decoder-app
    github:
      repo: johnzilla/dash-decoder-app
      branch: main
      deploy_on_push: true
    build_command: npm install && npm run build
    output_dir: dist
    envs: []   # VITE_OPENAI_API_KEY removed per D-13

databases:
  - name: postgres
    engine: PG
    production: true
```

### Pattern 6: Vite dev proxy

```typescript
// vite.config.ts addition — forwards /api/* to local Express during dev
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

### Pattern 7: AI call logging wrapper

Every OpenAI call must log to `ai_calls`. The cleanest approach is a wrapper that records latency and token counts regardless of success/failure:

```typescript
// server/lib/openai.ts
export async function callOpenAIWithLogging(
  sessionId: number | null,
  messages: ChatMessage[]
): Promise<{ content: string; usage: TokenUsage }> {
  const start = Date.now();
  let success = false;
  let errorMessage: string | undefined;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.3,
    });
    // AbortSignal for 30s timeout applied via openaiClient timeout config
    success = true;
    return { content: response.choices[0].message.content!, usage: response.usage! };
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'unknown';
    throw err;
  } finally {
    await db.insert(aiCalls).values({
      sessionId,
      model: 'gpt-4o',
      promptTokens: /* from response.usage */ null,
      completionTokens: null,
      latencyMs: Date.now() - start,
      success,
      errorMessage: errorMessage ?? null,
    });
  }
}
```

### Anti-Patterns to Avoid

- **Using `multer.diskStorage()`:** Writes temp files to disk before Sharp can process them. Use `multer.memoryStorage()` so the buffer goes directly through Sharp.
- **Missing `preserve_path_prefix: true` in app.yaml:** DO App Platform strips the matched prefix by default. Express routes defined as `/api/analyze` will never match if Express receives `/analyze`. This is a silent failure — requests 404 in production but work locally.
- **Calling `pool.end()` in production:** pg Pool should remain open for the server lifetime. Only close in test teardown.
- **Putting OPENAI_API_KEY as a build-time env on the static site:** Vite inlines build-time env vars into the JS bundle. The key must only exist in the web service's run-time env, never in the static site component.
- **Using ESM `import` with `.ts` extensions in server code compiled to CJS:** Node.js CJS requires `.js` extensions in compiled output. The tsconfig.server.json targeting `module: CommonJS` handles this, but be aware when writing relative imports.
- **Streaming OpenAI responses without buffering token counts:** Per D-10, responses must be buffered. Streaming makes token counting and logging significantly harder — the decision to buffer is correct.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multipart parsing | Custom body reader | multer | Handles boundary parsing, file size limits, MIME type filtering; edge cases in multipart spec are numerous |
| Image resize | Canvas API, jimp | sharp | 4-5x faster due to libvips; correct ICC/alpha handling; streams efficiently |
| S3-compatible upload | Raw HTTP to DO Spaces | @aws-sdk/client-s3 PutObjectCommand | Handles auth signatures (SigV4), retries, multipart for large files |
| OpenAI HTTP calls | raw fetch | openai SDK | Handles auth, retries, type-safe response shapes, timeout config |
| DB schema management | Raw ALTER TABLE | drizzle-kit generate/migrate | Tracks migration history in __drizzle_migrations; reproducible across environments |
| Security headers | manual res.set() | helmet | Covers 11+ headers including CSP, HSTS, X-Frame-Options correctly |

**Key insight:** The image processing pipeline (multer → sharp → S3) has enough edge cases (orientation EXIF, alpha channels, memory limits, partial uploads) that any custom solution will break in production on real user photos.

---

## Common Pitfalls

### Pitfall 1: DO App Platform strips the /api prefix silently

**What goes wrong:** Requests to `/api/analyze` return 404 in production even though Express routes are correct.
**Why it happens:** DO App Platform's default ingress behavior trims the matched prefix before forwarding. A rule matching `/api` forwards `/api/analyze` as `/analyze` unless `preserve_path_prefix: true` is set.
**How to avoid:** Always include `preserve_path_prefix: true` on the `/api` ingress rule. Test with `doctl apps list` and `doctl apps get` to confirm the spec was applied.
**Warning signs:** Routes work locally via Vite proxy but return 404 in production.

### Pitfall 2: Sharp prebuilt binaries not available at DO build time

**What goes wrong:** `npm install` succeeds but Sharp throws `Error: Cannot find module '@img/sharp-linux-x64'` at runtime.
**Why it happens:** Sharp uses platform-specific prebuilt native binaries. If the build environment architecture differs from the runtime container, the wrong binary is downloaded.
**How to avoid:** DO App Platform's Node.js environment is Linux x64. Sharp's prebuild covers this. Ensure `npm install` runs in the build command (not skipped). Do not add `--ignore-scripts` flag. [CITED: https://sharp.pixelplumbing.com/install]
**Warning signs:** Sharp imports fine locally (macOS/ARM) but crashes on DO deploy.

### Pitfall 3: VITE_ env vars leaking into the bundle

**What goes wrong:** Even after removing `VITE_OPENAI_API_KEY` from code, it appears in the compiled JS bundle.
**Why it happens:** Vite statically replaces `import.meta.env.VITE_*` at build time. If the variable is set in the DO static site component's build-time env, it gets inlined regardless of whether code references it.
**How to avoid:** Remove `VITE_OPENAI_API_KEY` from the static site component's envs in app.yaml entirely (not just set it empty). Run `grep -r "OPENAI" dist/` after build to verify zero occurrences.
**Warning signs:** `strings dist/assets/*.js | grep sk-` finds an API key prefix.

### Pitfall 4: ai_calls insert failing silently and blocking response

**What goes wrong:** If the DB insert in `finally {}` throws, it swallows the already-computed OpenAI result and the user gets a 500.
**Why it happens:** Uncaught promise rejections in `finally` blocks propagate as the new rejection.
**How to avoid:** Wrap the logging insert in its own try/catch. Log failures to console but do not let them fail the API response. Logging is observability, not critical path.

### Pitfall 5: useVisionAnalysis sends base64 after migration

**What goes wrong:** The hook currently accepts `imageDataUrl: string` (base64). After migration, it must send a `File`/`Blob` via `FormData`. If the signature is changed but callers still pass base64 strings, the backend receives garbage.
**Why it happens:** The type change from `string` to `File` is subtle; TypeScript won't catch it if the hook still accepts `string` for backward compat.
**How to avoid:** Change the hook signature to accept `File` (not string) in the same commit as updating `src/lib/api/openai.ts`. Let the TypeScript compiler surface all call sites. Do not accept both forms during migration.

### Pitfall 6: Drizzle migration not running before server starts

**What goes wrong:** Server starts, immediately fails on DB queries because tables don't exist.
**Why it happens:** drizzle-kit migrate is a separate CLI step; the server does not auto-migrate.
**How to avoid:** Add `npx drizzle-kit migrate` to the DO web service build command, or run it as a pre-start script. For the initial deploy, it must run before the first request.

---

## Code Examples

### drizzle.config.ts

```typescript
// Source: https://orm.drizzle.team/docs/get-started/postgresql-new [VERIFIED]
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './server/db/migrations',
  schema: './server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### OpenAI SDK with 30s timeout (D-09)

```typescript
// Source: openai SDK documentation [ASSUMED: timeout config API]
import OpenAI from 'openai';

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 30_000,
  maxRetries: 0, // don't retry — let client decide to retry
});
```

### Express centralized error handler

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
}
```

### Vitest + supertest integration test skeleton

```typescript
// server/__tests__/health.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});
```

### package.json scripts additions

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc -b && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "test:server": "vitest run --config vitest.config.server.ts"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ts-node for server dev | tsx (esbuild-based) | 2023+ | Much faster startup; no esm loader flags needed |
| drizzle-kit push (dev) | drizzle-kit generate + migrate | Always; push is dev-only | Committed migration files are reproducible in CI/CD |
| base64 images to OpenAI | Public URL images to OpenAI | OpenAI docs 2023+ | Smaller request payloads; avoids 4MB base64 JSON body limit |
| serial primary keys | identity columns (generatedAlwaysAsIdentity) | Postgres 10+, Drizzle 0.30+ | Modern standard; no sequence drift issues |
| Express 4.x | Express 5.x (stable Nov 2024) | November 2024 | Async error handling built-in — no need for express-async-errors wrapper |

**Deprecated/outdated:**
- `express-async-errors` package: Express 5 handles async route errors natively — don't install it
- `multer-s3`: Couples upload parsing with storage, preventing Sharp middleware in between; use manual PutObjectCommand
- `@aws-sdk/client-s3` v2 patterns (`new AWS.S3()`): v3 is modular and tree-shakeable; use `S3Client` + command pattern

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CommonJS module format for server tsconfig is simpler than ESM for this use case | Architecture Patterns / Pattern 1 | If ESM chosen, import paths need `.js` extensions explicitly in source; tsx handles both, but compiled output differs |
| A2 | OpenAI SDK `timeout` option accepts milliseconds integer | Code Examples | Wrong timeout config means 30s guarantee is not enforced; verify against openai SDK docs before implementing |
| A3 | DO Spaces CDN URL format is `{bucket}.{region}.cdn.digitaloceanspaces.com/{key}` | Pattern 3 | Wrong URL construction means OpenAI receives 404 URLs; verify against DO Spaces CDN documentation |
| A4 | DO App Platform node-js environment slug supports Node 22 | Architecture Patterns | If only older Node is available, some syntax may need targeting down |

---

## Open Questions

1. **DO Spaces bucket already provisioned?**
   - What we know: App is deployed on DO App Platform (nyc region per app.yaml)
   - What's unclear: Whether a DO Spaces bucket `dashdecoder-images` already exists or must be created
   - Recommendation: Wave 0 plan task should include "create DO Spaces bucket and generate access key via DO console"

2. **DO managed Postgres already provisioned?**
   - What we know: Current app.yaml has no databases section
   - What's unclear: Whether the DB must be created as part of this phase or already exists
   - Recommendation: Plan task to add the database component to app.yaml and trigger a deploy; DO App Platform creates the cluster automatically from spec

3. **Express 5 vs Express 4 for this team**
   - What we know: Express 5 is now stable (released Nov 2024); async error propagation is improved
   - What's unclear: Whether any existing code patterns (used in Phase 5+) assume Express 4 behavior
   - Recommendation: Use Express 5 — it is the current stable release and the project starts fresh in `/server/`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime, tsx, vitest | ✓ | 22.22.0 | — |
| npm | Package installation | ✓ | 10.9.4 | — |
| Docker | Local Postgres for integration tests | ✓ | 29.3.1 | Use DO managed Postgres with tunnel |
| doctl | DO App Platform deployment | ✓ | 1.151.0 | DO web console |
| psql | Local DB inspection | ✗ | — | Install via `sudo dnf install postgresql` or use `docker exec` |
| DO Spaces bucket | Image storage | ? | — | Must be created in DO console (not auto-created by app spec) |
| DO managed Postgres | Database | ? | — | Added via app.yaml databases section; created on next deploy |

**Missing dependencies with no fallback:**
- None blocking code development

**Missing dependencies with fallback:**
- `psql` not installed locally — use `docker run postgres psql` or connect via DO managed DB console

**Requires external provisioning:**
- DO Spaces bucket (one-time manual step in DO console before first test/deploy)
- DO managed Postgres cluster (added to app.yaml, auto-provisioned on deploy)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.server.ts` (to be created in Wave 0) |
| Quick run command | `npm run test:server` |
| Full suite command | `npm run test:server -- --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | GET /health returns 200 | integration | `vitest run --config vitest.config.server.ts -t "health"` | ❌ Wave 0 |
| INFRA-01 | Express app starts and binds PORT | smoke | `tsx server/index.ts & sleep 1 && curl localhost:8080/health` | ❌ Wave 0 |
| INFRA-02 | POST /api/sessions creates a row in scan_sessions | integration | `vitest run --config vitest.config.server.ts -t "sessions"` | ❌ Wave 0 |
| INFRA-02 | PATCH /api/sessions/:id updates the row | integration | same file | ❌ Wave 0 |
| INFRA-03 | POST /api/analyze with image file uploads to Spaces and returns URL | integration (mocked S3) | `vitest run --config vitest.config.server.ts -t "analyze"` | ❌ Wave 0 |
| INFRA-04 | Vite bundle contains zero occurrences of OPENAI_API_KEY | build check | `grep -r "OPENAI" dist/ && exit 1 \|\| exit 0` | ❌ Wave 0 |
| INFRA-05 | Each analyze call inserts a row in ai_calls with correct fields | integration | included in analyze test | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test:server` (full server suite, ~seconds with mocked DB/S3)
- **Per wave merge:** `npm run test:server -- --coverage`
- **Phase gate:** All server tests green, `grep -r "OPENAI" dist/` returns nothing, health check passes on DO deploy

### Wave 0 Gaps

- [ ] `server/__tests__/health.test.ts` — covers INFRA-01
- [ ] `server/__tests__/sessions.test.ts` — covers INFRA-02
- [ ] `server/__tests__/analyze.test.ts` — covers INFRA-03, INFRA-05
- [ ] `server/__tests__/setup.ts` — shared Vitest global setup (DB mocks, S3 mocks)
- [ ] `vitest.config.server.ts` — Vitest config for Node environment
- [ ] Framework install: already in devDependencies after Wave 0 npm install

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user auth in this phase (deferred to v2) |
| V3 Session Management | No | Scan sessions are DB rows, not auth sessions |
| V4 Access Control | No | No user identity; all endpoints public (rate limiting Phase 6) |
| V5 Input Validation | Yes | zod for request body validation; multer for file size/type limits |
| V6 Cryptography | No | No password storage; TLS handled by DO App Platform |
| V7 Error Handling | Yes | Centralized error handler never exposes stack traces in production |
| V14 Configuration | Yes | OPENAI_API_KEY as run-time secret; never build-time; never in static site env |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Oversized image upload (DoS) | Denial of Service | `multer limits: { fileSize: 10MB }` |
| MIME type spoofing (non-image as "image") | Tampering | multer `fileFilter` checking `req.file.mimetype` against allowlist |
| OpenAI key exfiltration via bundle | Information Disclosure | D-13: key removed from static site env; post-build grep verification |
| SQL injection via Drizzle | Tampering | Drizzle parameterizes all queries — never use raw SQL in routes |
| Sensitive error details in production | Information Disclosure | `errorHandler` returns generic message in production; full error logged server-side only |
| SSRF via image URL | Tampering | Not applicable — server fetches no external URLs; images come from trusted upload only |

---

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM PostgreSQL docs](https://orm.drizzle.team/docs/get-started/postgresql-new) — connection setup, schema, migration commands [VERIFIED: WebFetch]
- [DO App Platform App Spec reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/) — ingress rules, preserve_path_prefix, database binding, env var injection [VERIFIED: WebFetch]
- [DO Spaces AWS SDK integration](https://docs.digitalocean.com/products/spaces/how-to/use-aws-sdks/) — S3Client endpoint config, region "us-east-1" requirement [CITED]
- npm registry — all package versions verified via `npm view [package] version` [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- WebSearch: Vitest + supertest integration test pattern — multiple sources agree on supertest + beforeAll/afterAll lifecycle [WebSearch verified by multiple sources]
- WebSearch: Sharp libvips native binaries on Linux x64 — official sharp docs confirm prebuilt coverage [CITED: sharp.pixelplumbing.com]

### Tertiary (LOW confidence)
- OpenAI SDK `timeout` constructor option — based on training knowledge; verify against openai npm package docs before implementing [ASSUMED]
- DO Spaces CDN URL format — pattern inferred from DO documentation; confirm exact format in DO Spaces console [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions npm-verified on 2026-04-05
- Architecture: HIGH — DO App Platform spec verified via official docs; Drizzle patterns verified via official docs
- Pitfalls: MEDIUM — most from direct documentation evidence; A3 (CDN URL format) needs spot-check
- Security: HIGH — ASVS mapping is standard; controls map directly to chosen libraries

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable ecosystem; Drizzle releases frequently but API is stable)
