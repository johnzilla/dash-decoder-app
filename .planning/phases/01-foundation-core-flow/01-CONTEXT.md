# Phase 1: Foundation & Core Flow - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

User can photograph a dashboard warning light and receive an AI-powered diagnosis with severity guidance. This covers the complete photo-to-diagnosis journey: capture, vehicle identification, and results display. Does NOT include accounts, history, payments, or affiliate links (those are later phases).

</domain>

<decisions>
## Implementation Decisions

### Capture Experience
- Big hero-style "Scan Your Dashboard" button on landing screen — primary action front and center
- Tapping the button opens the native camera directly (not a choice modal)
- While AI analyzes: animated scanning effect over the photo with status text, not a plain spinner
- Image quality validation: reject bad images (too dark, blurry) with clear guidance and a retake button — don't let users submit unusable photos

### Vehicle Confirmation
- AI's vehicle guess appears as an inline card under the photo: "We think this is a 2016 Nissan Rogue" with Yes/No buttons
- If user taps "No" → search field to find their vehicle (type-to-search, not cascading dropdowns)
- If AI can't guess vehicle at all → ask upfront with the search field before showing any results
- Remember vehicle in localStorage for next time so user doesn't confirm every scan

### Results Presentation
- Single scroll page layout: severity at top → explanation → fix steps → disclaimer at bottom
- Severity indicator: traffic light style — big colored circle/badge (red/yellow/green) with label like "URGENT" or "LOW PRIORITY"
- DIY fix steps: numbered 1-2-3 format like a recipe, not brief paragraphs
- Disclaimer: subtle footer text at bottom of results — present but not alarming

### Claude's Discretion
- Exact animation design for the scanning effect
- Loading skeleton/placeholder patterns
- Error state designs for edge cases
- Specific spacing, padding, and micro-interactions

</decisions>

<specifics>
## Specific Ideas

### Visual Design / Branding
- Evolve from the landing page at dashdecoder.app — same brand identity but refined for the product
- Support auto dark/light mode (follow system preference)
- Keep the same blue accent (#2563EB) from the landing page for consistency
- Use shadcn/ui component library with Tailwind CSS
- No specific design reference — just make it clean and modern

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-core-flow*
*Context gathered: 2026-02-04*
