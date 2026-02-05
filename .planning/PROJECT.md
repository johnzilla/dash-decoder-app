# DashDecoder

## What This Is

A progressive web app that lets car owners snap a photo of any dashboard warning light and get an instant AI-powered diagnosis in plain English — including what the light means, how serious it is, steps to fix it, and links to buy the parts. Targets all vehicles from 1996 onwards (OBD-II era).

## Core Value

A car owner can photograph a dashboard warning light and immediately understand what's wrong, how urgent it is, and what to do next — no mechanic visit required for the diagnosis.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can upload or capture a photo of a dashboard warning light
- [ ] AI analyzes the image and identifies the warning light/error code
- [ ] AI guesses vehicle make/model/year from dashboard appearance; user confirms or corrects
- [ ] User sees plain English diagnosis: light name, error code, severity level, what it means
- [ ] User sees recommended fix steps and what to tell a mechanic
- [ ] User sees affiliate links to buy relevant parts and supplies
- [ ] User can try 1-2 free scans without an account
- [ ] User can create an account and log in (Supabase auth)
- [ ] User can view their scan history
- [ ] User can subscribe via Stripe ($4.99/month, $2.50/month for waitlist members)
- [ ] App works as an installable PWA on mobile and desktop

### Out of Scope

- Native mobile apps (iOS/Android) — PWA covers mobile for v1
- OBD-II Bluetooth reader integration — photo-based only for v1
- Real-time video analysis — single photo upload only
- Mechanic marketplace / booking — just diagnosis and parts links
- Multi-language support — English only for v1

## Context

- Landing page lives in separate repo (`dash-decoder`) built with bolt.new
- Supabase instance already exists with waitlist data (shared between landing page and app)
- Waitlist has early signups expecting Q1 2026 launch
- Landing page promises $2.50/month lifetime discount for waitlist members
- Target users are everyday car owners, not mechanics — plain language is critical
- All vehicles 1996+ (OBD-II standard) are in scope
- Vision AI API to be determined through research (Claude Vision, OpenAI Vision, etc.)

## Constraints

- **Platform**: PWA — must work well on mobile browsers with camera access
- **Backend**: Supabase — shared instance with existing landing page
- **Payments**: Stripe — subscription model with waitlist discount tier
- **AI**: Needs a vision API capable of identifying dashboard warning lights from photos
- **Audience**: Non-technical car owners — all copy and UX must be jargon-free

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native mobile | No mobile dev experience, camera access works via browser, simplest path | — Pending |
| Shared Supabase with landing page | Waitlist users convert directly, single auth system | — Pending |
| Free scans without account | Lower barrier to try, convert after value demonstrated | — Pending |
| AI guesses vehicle, user confirms | Less friction than making user enter vehicle info upfront | — Pending |
| Affiliate links in results | Second revenue stream alongside subscription | — Pending |

---
*Last updated: 2026-02-04 after initialization*
