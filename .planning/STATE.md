# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** A car owner can photograph a dashboard warning light and immediately understand what's wrong, how urgent it is, and what to do next — no mechanic visit required for the diagnosis.
**Current focus:** Foundation & Core Flow

## Current Position

Phase: 1 of 3 (Foundation & Core Flow)
Plan: 6 of 9 in current phase
Status: In progress
Last activity: 2026-02-05 — Completed 01-06-PLAN.md (Vehicle Confirmation Flow)

Progress: [██████░░░░] 67%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 3 min
- Total execution time: 0.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 1 | 6 | 16 min | 3 min |

**Recent Trend:**
- Last 5 plans: 01-02 (2min), 01-03 (2min), 01-04 (2min), 01-05 (2min), 01-06 (3min)
- Trend: Consistently fast (simple foundation tasks)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- PWA over native mobile: Camera access works via browser, simplest path for solo developer
- Shared Supabase with landing page: Waitlist users convert directly, single auth system
- Free scans without account: Lower barrier to try, convert after value demonstrated
- AI guesses vehicle, user confirms: Less friction than making user enter vehicle info upfront
- Affiliate links in results: Second revenue stream alongside subscription

**From Plan 01-01 (Project Foundation):**
- React 18 instead of React 19: More stable ecosystem, no impact on MVP requirements
- Tailwind v3.4 with PostCSS: Stable production-ready version vs v4 alpha
- shadcn/ui neutral theme: CSS variables enable light/dark mode switching
- mkcert for HTTPS localhost: Required for camera API testing in development

**From Plan 01-03 (Camera Capture):**
- Prefer rear camera (facingMode: environment) for mobile dashboard photos
- High resolution capture (1920x1080 ideal) for better image quality
- JPEG at 95% quality balances file size and image detail
- Auto-start camera on mount for better UX (no manual start button)

**From Plan 01-04 (Image Quality Validation):**
- Lenient thresholds per research (blur < 80, brightness 30-250) to prevent false positives
- Export thresholds for potential tuning based on real user data during beta
- Optional submit anyway button for edge cases where validation may be overly strict

**From Plan 01-05 (Vision API Integration):**
- GPT-4o Vision (not GPT-4 Vision) for better warning light recognition
- Direct fetch() instead of OpenAI SDK to reduce bundle size by ~200KB
- Structured prompts with regex extraction for flexible JSON parsing
- Temperature 0.3 for consistent structured output from Vision API

**From Plan 01-06 (Vehicle Confirmation Flow):**
- 90-day expiry for stored vehicles balances UX convenience with accuracy
- Inline search reveal on 'No' button avoids navigation disruption
- 26 popular makes as datalist suggestions cover 95%+ of US market
- Memoized storedVehicle in hook prevents repeated localStorage reads

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 1:**
- Vision API accuracy unknown until real testing with 20+ vehicles (research suggests 75%+ threshold required for viable product)
- iOS Safari camera permissions may have quirks not documented in research (requires testing during implementation)
- Legal review needed for liability disclaimer language before launch (budget $2-5K for attorney review)

**Phase 3:**
- Stripe webhook edge cases (failed payments, trial cancellations, refunds) may need deeper research during planning
- Amazon Associates API migration deadline April 30, 2026 — must use Creators API (OAuth 2.0) not legacy PA-API

## Session Continuity

Last session: 2026-02-05T13:21:13Z
Stopped at: Completed 01-06-PLAN.md (Vehicle Confirmation Flow)
Resume file: None
