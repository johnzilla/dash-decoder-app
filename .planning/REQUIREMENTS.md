# Requirements: DashDecoder

**Defined:** 2026-02-04
**Core Value:** A car owner can photograph a dashboard warning light and immediately understand what's wrong, how urgent it is, and what to do next.

## Validated (v1.0 — Phase 1)

- ✓ **CAPT-01**: User can upload a photo or use device camera to capture a dashboard warning light — Phase 1
- ✓ **CAPT-02**: App validates image quality before sending to AI (rejects blurry/dark images with guidance) — Phase 1
- ✓ **AI-01**: AI identifies the warning light/error code from the uploaded photo — Phase 1
- ✓ **AI-02**: AI guesses vehicle make/model/year from dashboard appearance — Phase 1
- ✓ **AI-03**: User can confirm or correct the AI's vehicle guess before seeing results — Phase 1
- ✓ **DIAG-01**: User sees plain English explanation of what the warning light means — Phase 1
- ✓ **DIAG-02**: User sees color-coded severity indicator (red = stop now, yellow = soon, green = info) — Phase 1
- ✓ **DIAG-03**: User sees safety guidance ("can I keep driving?" / "pull over now") — Phase 1
- ✓ **DIAG-04**: User sees step-by-step DIY fix instructions for common issues — Phase 1
- ✓ **DIAG-05**: Every diagnosis includes "informational only, not professional advice" disclaimer — Phase 1
- ✓ **PWA-01**: App is responsive and mobile-first — Phase 1
- ✓ **PWA-02**: App is installable as a home screen PWA — Phase 1

## v1.1 Requirements (Value Proposition Experiment)

### Backend Infrastructure

- [ ] **INFRA-01**: Express web service runs alongside static site on DO App Platform
- [ ] **INFRA-02**: DO managed Postgres stores scan sessions, feedback, and AI call logs
- [ ] **INFRA-03**: Images uploaded to DO Spaces with server-side storage
- [ ] **INFRA-04**: OpenAI API calls proxied through Express (key never in frontend bundle)
- [ ] **INFRA-05**: AI call logging captures model, tokens, latency, and success/failure per call

### Analytics & Feedback

- [ ] **ANLYT-01**: User sees feedback card after diagnosis with 3 structured questions
- [ ] **ANLYT-02**: User can submit optional free-text feedback (max 500 chars)
- [ ] **ANLYT-03**: Funnel step timestamps track camera→capture→diagnosis→feedback progression
- [ ] **ANLYT-04**: Device and browser data captured per session (user agent, screen, connection)
- [ ] **ANLYT-05**: Plausible Analytics tracks traffic sources and page views

### Experiment & Compliance

- [ ] **EXPT-01**: A/B variant captured from URL parameter (?v=diagnosis or ?v=triage)
- [ ] **EXPT-02**: Sessions without variant param tagged as "organic" and excluded from A/B analysis
- [ ] **EXPT-03**: Privacy notice displayed disclosing AI processing and anonymous data collection
- [ ] **EXPT-04**: Rate limiting enforced (10/min global, 3/5min on analyze endpoint per IP)
- [ ] **EXPT-05**: Vitest integration tests cover all backend API endpoints

## v2 Requirements (deferred — contingent on experiment results)

### Accounts (originally Phase 2)

- **AUTH-01**: User can sign up with email and password
- **AUTH-02**: User receives email verification after signup
- **AUTH-03**: User can log in and stay logged in across sessions
- **AUTH-04**: User can view their past scans with photos and diagnoses

### Monetization (originally Phase 3)

- **PAY-01**: User gets 2 free scans total without an account
- **PAY-02**: User can subscribe via Stripe at $4.99/month
- **PAY-03**: Waitlist members get lifetime $2.50/month pricing
- **PAY-04**: Diagnosis results include affiliate links to buy relevant parts/supplies

### Discovery

- **DISC-01**: User can browse/search warning light database without uploading a photo
- **DISC-02**: User can look up warning lights by vehicle make/model

### Enhanced Diagnosis

- **EDIAG-01**: User sees estimated repair cost range for identified issue
- **EDIAG-02**: User sees enhanced DIY instructions with illustrations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile apps (iOS/Android) | PWA covers mobile; no mobile dev experience |
| OBD2 Bluetooth reader integration | Hardware requirement defeats photo-only convenience |
| Real-time video analysis | Single photo sufficient; video adds complexity |
| Mechanic marketplace / booking | Low margin, high complexity; not core value |
| User accounts / authentication | Deferred until experiment validates demand |
| Stripe payments / subscriptions | Deferred until experiment validates demand |
| Affiliate links | Deferred until experiment validates demand |
| Custom admin dashboard | Use psql/Metabase for experiment data |
| Facebook Ads | Google Ads preferred (search intent, real browser) |
| Supabase | DO Postgres for single-provider infrastructure |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPT-01 | Phase 1 | Complete |
| CAPT-02 | Phase 1 | Complete |
| AI-01 | Phase 1 | Complete |
| AI-02 | Phase 1 | Complete |
| AI-03 | Phase 1 | Complete |
| DIAG-01 | Phase 1 | Complete |
| DIAG-02 | Phase 1 | Complete |
| DIAG-03 | Phase 1 | Complete |
| DIAG-04 | Phase 1 | Complete |
| DIAG-05 | Phase 1 | Complete |
| PWA-01 | Phase 1 | Complete |
| PWA-02 | Phase 1 | Complete |
| INFRA-01 | Phase 4 | Pending |
| INFRA-02 | Phase 4 | Pending |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 4 | Pending |
| INFRA-05 | Phase 4 | Pending |
| ANLYT-01 | Phase 5 | Pending |
| ANLYT-02 | Phase 5 | Pending |
| ANLYT-03 | Phase 5 | Pending |
| ANLYT-04 | Phase 5 | Pending |
| ANLYT-05 | Phase 5 | Pending |
| EXPT-01 | Phase 5 | Pending |
| EXPT-02 | Phase 5 | Pending |
| EXPT-03 | Phase 5 | Pending |
| EXPT-04 | Phase 6 | Pending |
| EXPT-05 | Phase 6 | Pending |

**Coverage:**
- Validated (v1.0): 12 total
- v1.1 requirements: 15 total
- Mapped to phases: 27 (all v1.0 + v1.1)
- Unmapped: 0

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-04-05 — v1.1 traceability complete (Phases 4-6)*
