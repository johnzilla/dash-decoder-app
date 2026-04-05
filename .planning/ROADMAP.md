# Roadmap: DashDecoder

## Milestones

- ✅ **v1.0 Foundation** - Phases 1-3 (Phase 1 shipped 2026-04-04; Phases 2-3 deferred to v2)
- 🚧 **v1.1 Value Proposition Experiment** - Phases 4-6 (in progress)
- 📋 **v2.0 Accounts & Monetization** - Phases 7+ (planned, contingent on experiment results)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phase 1) - SHIPPED 2026-04-04</summary>

### Phase 1: Foundation & Core Flow
**Goal**: User can photograph a dashboard warning light and receive AI-powered diagnosis with severity guidance
**Depends on**: Nothing (first phase)
**Requirements**: CAPT-01, CAPT-02, AI-01, AI-02, AI-03, DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05, PWA-01, PWA-02
**Success Criteria** (what must be TRUE):
  1. User can capture or upload a photo of a dashboard warning light using device camera or file picker
  2. App validates image quality before processing and provides clear guidance when images are rejected
  3. User sees AI-identified warning light name and error code from the uploaded photo
  4. User confirms or corrects AI's vehicle make/model/year guess before viewing diagnosis
  5. User sees plain English explanation with color-coded severity (red/yellow/green) and safety guidance
  6. User sees step-by-step DIY fix instructions and every diagnosis displays an informational disclaimer
  7. App works as a responsive mobile-first interface and is installable as a PWA
**Plans**: 9 plans

Plans:
- [x] 01-01-PLAN.md — Project setup with Vite, React, TypeScript, PWA, shadcn/ui
- [x] 01-02-PLAN.md — TypeScript types and Zod schemas for all data structures
- [x] 01-03-PLAN.md — Camera capture with live preview and photo capture
- [x] 01-04-PLAN.md — Image quality validation (blur/brightness detection)
- [x] 01-05-PLAN.md — Vision API integration for warning light analysis
- [x] 01-06-PLAN.md — Vehicle confirmation with localStorage persistence
- [x] 01-07-PLAN.md — Diagnosis display components (severity, explanation, fix steps)
- [x] 01-08-PLAN.md — Routing and complete scan flow integration
- [x] 01-09-PLAN.md — Final verification and PWA testing

### Phase 2: Accounts & History (DEFERRED to v2)
**Status**: Deferred — validating demand before building auth

### Phase 3: Subscription & Monetization (DEFERRED to v2)
**Status**: Deferred — validating demand before building payments

</details>

### 🚧 v1.1 Value Proposition Experiment (In Progress)

**Milestone Goal:** Run a $250 Google Ads A/B test to validate demand for DashDecoder before investing in auth and payments.

#### Phase 4: Backend Infrastructure
**Goal**: An Express server proxies OpenAI calls server-side, stores images in DO Spaces, and logs every AI call to Postgres
**Depends on**: Phase 1
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Express web service runs on DO App Platform alongside the static site and responds to health checks
  2. A scan session can be created and updated via the API, with session data persisted in Postgres
  3. An uploaded image is stored in DO Spaces and the returned URL is what gets sent to OpenAI (no base64 in request body)
  4. OpenAI API key is absent from the frontend bundle; all AI calls route through the Express proxy
  5. Every AI call generates a log row in Postgres capturing model, token counts, latency, and success/failure status
**Plans**: 3 plans
**UI hint**: no

Plans:
- [x] 04-01-PLAN.md — Server scaffold, Drizzle schema, health endpoint, Vitest setup
- [x] 04-02-PLAN.md — Session routes, image upload pipeline, OpenAI proxy with AI call logging
- [x] 04-03-PLAN.md — Frontend migration to Express proxy, app.yaml update, schema push

#### Phase 5: Frontend Integration & Analytics
**Goal**: Users interact with the feedback card and A/B variant tracking after diagnosis; all funnel events and device data are captured; Plausible tracks traffic; privacy notice is displayed
**Depends on**: Phase 4
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05, EXPT-01, EXPT-02, EXPT-03
**Success Criteria** (what must be TRUE):
  1. After a diagnosis, user sees a feedback card with 3 structured questions and an optional free-text field (max 500 chars) and can submit it
  2. Funnel timestamps for camera, capture, diagnosis, and feedback steps are recorded per session in Postgres
  3. Device and browser data (user agent, screen size, connection type) are captured and stored with the session
  4. Plausible Analytics script is loaded and records page views and traffic sources (UTM params visible in Plausible dashboard)
  5. A/B variant from ?v=diagnosis or ?v=triage is stored on the session; sessions without the param are tagged "organic"
  6. Privacy notice is visible on the app disclosing AI processing and anonymous data collection
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] TBD (will be defined during phase planning)

#### Phase 6: Hardening & Tests
**Goal**: Backend endpoints are protected against abuse with rate limiting and all API behavior is verified by automated integration tests
**Depends on**: Phase 5
**Requirements**: EXPT-04, EXPT-05
**Success Criteria** (what must be TRUE):
  1. The /api/analyze endpoint rejects a client that exceeds 3 requests in 5 minutes with a 429 response
  2. Any IP that exceeds 10 requests per minute across all endpoints receives a 429 response
  3. Vitest integration tests run against all backend API endpoints and pass in CI
**Plans**: TBD
**UI hint**: no

Plans:
- [ ] TBD (will be defined during phase planning)

### 📋 v2.0 Accounts & Monetization (Planned)

**Milestone Goal:** Add user accounts, scan history, and Stripe subscriptions — contingent on experiment results.

Phases TBD after experiment concludes.

## Progress

**Execution Order:**
v1.1 phases execute in numeric order: 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Core Flow | v1.0 | 9/9 | Complete | 2026-04-04 |
| 2. Accounts & History | v1.0 | 0/TBD | Deferred | - |
| 3. Subscription & Monetization | v1.0 | 0/TBD | Deferred | - |
| 4. Backend Infrastructure | v1.1 | 0/3 | Planning complete | - |
| 5. Frontend Integration & Analytics | v1.1 | 0/TBD | Not started | - |
| 6. Hardening & Tests | v1.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-04*
*Last updated: 2026-04-05 — Phase 4 plans created (3 plans, 3 waves)*
