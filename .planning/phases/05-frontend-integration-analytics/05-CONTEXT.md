# Phase 5: Frontend Integration & Analytics - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users interact with the feedback card and A/B variant tracking after diagnosis; all funnel events and device data are captured; Plausible tracks traffic; privacy notice is displayed. Backend endpoints for feedback and session updates already exist from Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Feedback Card Design
- **D-01:** Three structured questions: 1) Was this diagnosis accurate? (yes/no/unsure) 2) How useful was this? (1-5 stars) 3) What will you do next? (fix myself / go to mechanic / ignore / other)
- **D-02:** Optional free-text field (max 500 chars) below the structured questions
- **D-03:** Card appears below the diagnosis results on the results page, always visible — no delay, user scrolls to it naturally
- **D-04:** After submission, card collapses to a "Thanks for your feedback!" message. No redirect, user stays on results page
- **D-05:** Feedback submitted via POST /api/sessions/:id/feedback (endpoint defined in Phase 4 API contract)

### Funnel & Device Tracking
- **D-06:** Client-side timestamps tracked in React state as user progresses through steps (camera opened, photo captured, diagnosis received, feedback submitted). All timestamps sent to PATCH /api/sessions when diagnosis completes
- **D-07:** Device data captured per session: navigator.userAgent, window.screen (width, height), navigator.connection?.effectiveType. Sent alongside funnel timestamps

### Plausible & A/B Setup
- **D-08:** Plausible Analytics via script tag in index.html with data-domain attribute — zero React code, tracks page views and UTM params automatically
- **D-09:** A/B variant parsed from ?v= URL parameter on app load, stored in React context. Sent to PATCH /api/sessions with the session data. Sessions without ?v= tagged as "organic" per EXPT-02

### Privacy Notice
- **D-10:** Footer banner on all pages — small, persistent, non-intrusive, always visible
- **D-11:** Friendly, plain English tone: "We use AI to analyze your photo. We collect anonymous usage data to improve the app. No personal info is stored." Approachable for non-technical car owners

### Claude's Discretion
- Feedback card component styling and animation
- Star rating component implementation (existing shadcn/ui or custom)
- Exact privacy banner positioning and dismiss behavior
- Funnel timestamp field names in the session PATCH payload
- Plausible data-domain value (dashdecoder.com or the DO app URL)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ANLYT-01 through ANLYT-05, EXPT-01 through EXPT-03

### Phase 4 Backend (already built)
- `server/routes/sessions.ts` — POST/PATCH /api/sessions endpoints that this phase's frontend calls
- `server/db/schema.ts` — Drizzle schema with feedback table structure
- `.planning/phases/04-backend-infrastructure/04-CONTEXT.md` — API contract decisions

### Frontend Integration Points
- `src/routes/results.tsx` — Results page where feedback card will be added
- `src/routes/scan.tsx` — Scan flow where funnel timestamps are captured
- `src/context/ScanContext.tsx` — React context that manages scan state (add variant + funnel tracking here)
- `index.html` — Where Plausible script tag goes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/` — shadcn/ui components (Button, Alert, Label) for feedback card
- `src/context/ScanContext.tsx` — Existing React context managing scan flow state; extend for variant + funnel timestamps
- `server/routes/sessions.ts` — PATCH endpoint ready to receive funnel timestamps and device data
- `server/db/schema.ts` — feedback table with structured fields already defined

### Established Patterns
- React Router for page navigation (results.tsx receives diagnosis via location.state)
- Tailwind CSS for styling throughout
- Zod for runtime validation
- ScanContext provides scan state to all components via React context

### Integration Points
- `src/routes/results.tsx` — Add FeedbackCard component below DiagnosisResult
- `src/context/ScanContext.tsx` — Add variant tracking state and funnel timestamp tracking
- `src/routes/scan.tsx` — Capture funnel timestamps at each step transition
- `index.html` — Add Plausible script tag and privacy notice banner
- `src/App.tsx` — Add privacy banner component (renders on all pages)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-frontend-integration-analytics*
*Context gathered: 2026-04-05*
