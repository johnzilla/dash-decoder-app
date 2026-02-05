# Roadmap: DashDecoder

## Overview

This roadmap delivers a progressive web app that lets car owners photograph dashboard warning lights and receive instant AI-powered diagnoses. Phase 1 establishes the core photo-to-diagnosis flow with all safety disclaimers and quality controls. Phase 2 adds user accounts and scan history. Phase 3 implements subscription tiers with free trial limits and affiliate monetization. The journey takes users from "what is this light?" to "I understand and know what to do next" while proving commercial viability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Core Flow** - Photo upload, AI diagnosis, PWA basics
- [ ] **Phase 2: Accounts & History** - User authentication and scan history
- [ ] **Phase 3: Subscription & Monetization** - Free tier limits, paid subscriptions, affiliate links

## Phase Details

### Phase 1: Foundation & Core Flow
**Goal**: User can photograph a dashboard warning light and receive AI-powered diagnosis with severity guidance
**Depends on**: Nothing (first phase)
**Requirements**: CAPT-01, CAPT-02, AI-01, AI-02, AI-03, DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05, PWA-01, PWA-02
**Success Criteria** (what must be TRUE):
  1. User can capture or upload a photo of a dashboard warning light using device camera or file picker
  2. App validates image quality before processing and provides clear guidance when images are rejected (too dark, blurry, or wrong subject)
  3. User sees AI-identified warning light name and error code from the uploaded photo
  4. User confirms or corrects AI's vehicle make/model/year guess before viewing diagnosis
  5. User sees plain English explanation of what the warning light means with color-coded severity (red/yellow/green)
  6. User sees safety guidance ("can I keep driving?" or "pull over immediately") based on severity
  7. User sees step-by-step DIY fix instructions for common issues
  8. Every diagnosis screen displays "informational only, not professional advice" disclaimer
  9. App works as responsive mobile-first interface and is installable as a PWA
**Plans**: TBD

Plans:
- [ ] TBD (will be defined during phase planning)

### Phase 2: Accounts & History
**Goal**: User can create an account, log in, and view their past scan history with photos and diagnoses
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password through Supabase auth
  2. User receives email verification link after signup and can verify their account
  3. User can log in and remain logged in across browser sessions
  4. User can view a list of their past scans showing photos, dates, and diagnosis summaries
  5. User can click into any past scan to see full diagnosis details
**Plans**: TBD

Plans:
- [ ] TBD (will be defined during phase planning)

### Phase 3: Subscription & Monetization
**Goal**: User can try 2 free scans, subscribe for unlimited access, and see affiliate parts recommendations
**Depends on**: Phase 2
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04
**Success Criteria** (what must be TRUE):
  1. User without an account gets exactly 2 free scans tracked via localStorage
  2. User sees clear upgrade prompt when free scan limit is reached
  3. User can subscribe via Stripe Checkout at $4.99/month standard pricing
  4. Waitlist members see and can activate lifetime $2.50/month pricing tier
  5. Subscribed users have unlimited scan access with no prompts or limits
  6. Every diagnosis includes relevant affiliate links to buy parts/supplies related to the issue
  7. User can access Stripe Customer Portal to manage their subscription and payment methods
**Plans**: TBD

Plans:
- [ ] TBD (will be defined during phase planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Flow | 0/TBD | Not started | - |
| 2. Accounts & History | 0/TBD | Not started | - |
| 3. Subscription & Monetization | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-04*
*Last updated: 2026-02-04 after initial roadmap creation*
