# DashDecoder

## What This Is

A progressive web app that lets car owners snap a photo of any dashboard warning light and get an instant AI-powered diagnosis in plain English — including what the light means, how serious it is, steps to fix it, and links to buy the parts. Targets all vehicles from 1996 onwards (OBD-II era).

## Core Value

A car owner can photograph a dashboard warning light and immediately understand what's wrong, how urgent it is, and what to do next — no mechanic visit required for the diagnosis.

## Current Milestone: v1.1 Value Proposition Experiment

**Goal:** Validate demand for DashDecoder with a $250 Google Ads A/B test before investing in auth/payments.

**Target features:**
- Express backend with DO Postgres and DO Spaces
- OpenAI API proxy with AI call logging
- Feedback card with funnel analytics
- A/B ad experiment (diagnosis vs urgency framing)

## Requirements

### Validated

- ✓ User can upload or capture a photo of a dashboard warning light — Phase 1
- ✓ AI analyzes the image and identifies the warning light/error code — Phase 1
- ✓ AI guesses vehicle make/model/year from dashboard appearance; user confirms or corrects — Phase 1
- ✓ User sees plain English diagnosis: light name, error code, severity level, what it means — Phase 1
- ✓ User sees recommended fix steps and what to tell a mechanic — Phase 1
- ✓ App works as an installable PWA on mobile and desktop — Phase 1

### Active

- ✓ Express backend proxies OpenAI calls (API key server-side) — Phase 4
- ✓ Images uploaded to DO Spaces (not base64 in POST body) — Phase 4
- ✓ AI call logging captures model, tokens, latency, success/failure — Phase 4
- ✓ User sees feedback card after diagnosis with 3 structured questions + open text — Phase 5
- ✓ Funnel step timestamps track camera→capture→diagnosis→feedback progression — Phase 5
- ✓ Device/browser data captured per session — Phase 5
- ✓ Plausible Analytics tracks traffic sources and page views — Phase 5
- ✓ Privacy notice displayed for data collection disclosure — Phase 5
- ✓ A/B variant tracking via URL parameter (?v=diagnosis or ?v=triage) — Phase 5
- [ ] Vitest integration tests cover backend endpoints

### Out of Scope

- Native mobile apps (iOS/Android) — PWA covers mobile for v1
- OBD-II Bluetooth reader integration — photo-based only for v1
- Real-time video analysis — single photo upload only
- Mechanic marketplace / booking — just diagnosis and parts links
- Multi-language support — English only for v1
- User accounts / authentication — deferred until experiment validates demand
- Scan history — deferred until experiment validates demand
- Stripe payments / subscriptions — deferred until experiment validates demand
- Affiliate links — deferred until experiment validates demand
- Custom admin dashboard — use psql/Metabase for experiment data

## Context

- Landing page lives in separate repo (`dash-decoder`) built with bolt.new
- Waitlist signups are founder's own tests — zero external users
- Phase 1 complete: camera capture, image validation, GPT-4o Vision, vehicle confirmation, diagnosis display, PWA
- Phase 4 complete: Express backend, DO Spaces image upload, OpenAI server-side proxy, AI call logging
- Deployed on DigitalOcean App Platform as static site + Express web service at dashdecoder-app-tujs9.ondigitalocean.app
- /office-hours design doc + CEO review + eng review all approved (at ~/.gstack/projects/)
- Pivoting from original Phase 2/3 (Supabase auth + Stripe) to validation experiment first
- Google Ads preferred over Facebook (search intent matches urgent use case, avoids Meta in-app browser camera issues)
- Triage ad framing reworded from "safe to keep driving?" to "know if it's urgent" (avoids safety claim liability)
- Pre-experiment: must test AI accuracy on 10-15 real photos before ad spend

## Constraints

- **Platform**: PWA on DO App Platform — static site + Express web service
- **Backend**: DigitalOcean managed Postgres (replacing Supabase for single-provider infrastructure)
- **Storage**: DO Spaces for image uploads (S3-compatible)
- **AI**: GPT-4o Vision via server-side proxy (key never in frontend bundle)
- **Budget**: $250 for Google Ads experiment, ~$20/month infrastructure (Postgres + Spaces + container)
- **Audience**: Non-technical car owners — all copy and UX must be jargon-free
- **Timeline**: 1-week experiment after build + ad approval

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native mobile | Camera access works via browser, simplest path | ✓ Good |
| AI guesses vehicle, user confirms | Less friction than upfront vehicle entry | ✓ Good |
| Validate before auth/payments | Zero external users, need demand signal first | — Pending |
| DO Postgres over Supabase | Single-provider infrastructure, user preference | — Pending |
| DO Spaces for image storage | Server-side upload, not base64 in POST body | — Pending |
| Google Ads over Facebook | Search intent matches urgent use case, real browser | — Pending |
| Reframe triage as "urgency" | Avoids safety claim liability in ad copy | — Pending |
| Express on App Platform | Reusable for Phase 2 if experiment succeeds | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-05 after Phase 5 complete*
