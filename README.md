# DashDecoder

AI-powered dashboard warning light diagnosis. Snap a photo of any car dashboard warning light and get an instant plain English diagnosis — what it means, how serious it is, and what to do next.

## Features

- **Photo capture** — Use your phone camera or upload an image of a dashboard warning light
- **AI diagnosis** — GPT-4o Vision identifies the light and generates a detailed diagnosis
- **Vehicle detection** — AI guesses your vehicle make/model/year from the dashboard; you confirm or correct
- **Severity guidance** — Color-coded severity (red/yellow/green) with safety recommendations
- **DIY fix steps** — Step-by-step repair instructions for common issues
- **Feedback collection** — Rate diagnosis accuracy and usefulness after each scan
- **A/B experiment tracking** — URL-based variant assignment for Google Ads testing
- **Funnel analytics** — Timestamps for each step (camera, capture, diagnosis, feedback)
- **Privacy-first** — Clear privacy notice, anonymous data collection, no user accounts required
- **PWA** — Installable on mobile and desktop, works offline for UI

## Architecture

```
Browser (React + Vite PWA)
  |
  |-- /api/analyze (multipart image upload)
  |-- /api/sessions (create/update sessions)
  |-- /api/sessions/:id/feedback (submit feedback)
  |
Express Server (DO App Platform)
  |-- OpenAI GPT-4o Vision proxy
  |-- DO Spaces image storage (CDN URLs)
  |-- Drizzle ORM + DO Managed Postgres
  |     |-- scan_sessions (session data, funnel, device, variant)
  |     |-- feedback (accuracy, usefulness, action, comments)
  |     |-- ai_calls (model, tokens, latency, success/failure)
  |
Plausible Analytics (page views, UTM tracking)
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router
- **Backend:** Express 5, TypeScript, tsx (dev runner)
- **Database:** Drizzle ORM, DO Managed Postgres
- **Storage:** DigitalOcean Spaces (S3-compatible)
- **AI:** OpenAI GPT-4o Vision (server-side proxy)
- **Analytics:** Plausible Analytics
- **Deployment:** DigitalOcean App Platform (static site + web service)

## Getting Started

### Prerequisites

- Node.js 22+
- A DigitalOcean account with:
  - Managed Postgres database
  - Spaces bucket (`dashdecoder-images`)
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development (two terminals)
npm run dev          # Vite frontend on https://localhost:5173
npm run dev:server   # Express backend on http://localhost:8080
```

The Vite dev server proxies `/api/*` requests to the Express server automatically.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `OPENAI_API_KEY` | OpenAI API key (server-side only) |
| `SPACES_KEY` | DO Spaces access key |
| `SPACES_SECRET` | DO Spaces secret key |
| `SPACES_BUCKET` | DO Spaces bucket name |
| `SPACES_REGION` | DO Spaces region (e.g., `nyc3`) |
| `PORT` | Express server port (default: 8080) |

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:server` | Start Express dev server with hot reload |
| `npm run build` | Build frontend for production |
| `npm run build:server` | Compile server TypeScript |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run test:server` | Run server integration tests |

## Deployment

Deployed on DigitalOcean App Platform with two components:

- **Static site** — Vite build output (`dist/`)
- **Web service** — Express server (`server/`)

The app spec is in `.do/app.yaml`. Deploy with:

```bash
doctl apps update <app-id> --spec .do/app.yaml
```

The first deploy automatically creates the managed Postgres database and runs `drizzle-kit push` via the run command.

## A/B Experiment

DashDecoder supports URL-based A/B variant tracking for Google Ads experiments:

- `?v=diagnosis` — Diagnosis-framed ad variant
- `?v=triage` — Urgency-framed ad variant
- No parameter — Tagged as "organic"

Variants are stored per session in Postgres for experiment analysis.

## License

See [LICENSE](LICENSE) for details.
