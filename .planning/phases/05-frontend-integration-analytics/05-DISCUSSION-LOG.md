# Phase 5: Frontend Integration & Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 05-frontend-integration-analytics
**Areas discussed:** Feedback card design, Funnel & device tracking, Plausible & A/B setup, Privacy notice

---

## Feedback Card Design

| Option | Description | Selected |
|--------|-------------|----------|
| Accuracy + Usefulness + Action | 1) Accurate? 2) Useful? (1-5) 3) What next? | ✓ |
| Accuracy + Trust + Willingness to pay | 1) Accurate? 2) Trust? 3) Would you pay? | |
| Custom questions | User describes own | |

**User's choice:** Accuracy + Usefulness + Action

| Option | Description | Selected |
|--------|-------------|----------|
| Below diagnosis, always visible | Card appears below results, no delay | ✓ |
| After 10s delay | Slides in after reading time | |
| Modal after scan another | Pop up on exit intent | |

**User's choice:** Below diagnosis, always visible

| Option | Description | Selected |
|--------|-------------|----------|
| Thank you + collapse | Card collapses to thanks message | ✓ |
| Thank you + CTA | Thanks + call-to-action | |
| You decide | | |

**User's choice:** Thank you + collapse

---

## Funnel & Device Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side timestamps, batch on submit | Track in React state, send on diagnosis complete | ✓ |
| Real-time per-step API calls | POST at each step transition | |
| You decide | | |

**User's choice:** Client-side timestamps, batch on submit

| Option | Description | Selected |
|--------|-------------|----------|
| User agent + screen + connection | navigator.userAgent, screen, connection.effectiveType | ✓ |
| Minimal — user agent only | Just UA string | |
| You decide | | |

**User's choice:** User agent + screen + connection

---

## Plausible & A/B Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Script tag in index.html | Add Plausible script with data-domain | ✓ |
| React component wrapper | PlausibleProvider component | |
| You decide | | |

**User's choice:** Script tag in index.html

| Option | Description | Selected |
|--------|-------------|----------|
| Read on app load, store in session | Parse ?v= on first load, store in context + PATCH session | ✓ |
| Read per-page | Parse ?v= on every page load | |
| You decide | | |

**User's choice:** Read on app load, store in session

---

## Privacy Notice

| Option | Description | Selected |
|--------|-------------|----------|
| Footer banner on all pages | Small persistent banner at bottom | ✓ |
| Before first scan only | Must acknowledge before proceeding | |
| On results page only | Alongside diagnosis results | |

**User's choice:** Footer banner on all pages

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly + clear | Plain English, approachable | ✓ |
| Legal/formal | Standard legal disclaimer | |
| You decide | | |

**User's choice:** Friendly + clear

---

## Claude's Discretion

- Feedback card component styling and animation
- Star rating component implementation
- Privacy banner positioning and dismiss behavior
- Funnel timestamp field names
- Plausible data-domain value

## Deferred Ideas

None — discussion stayed within phase scope
