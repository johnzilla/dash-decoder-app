---
phase: 01-foundation-core-flow
plan: 04
subsystem: validation
tags: [canvas-api, image-processing, laplacian-variance, client-side-validation, react, typescript]

# Dependency graph
requires:
  - phase: 01-01
    provides: React project foundation with TypeScript and Tailwind
  - phase: 01-02
    provides: Type definitions (ImageQualityResult from src/types/api.ts)
provides:
  - Canvas-based image quality validation (blur and brightness detection)
  - User feedback UI for validation errors with retake option
  - Lenient validation thresholds tunable for beta testing
affects: [01-05, 01-06, core-flow, camera-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [canvas-image-analysis, laplacian-variance-blur-detection, luminance-brightness-calculation]

key-files:
  created:
    - src/lib/validation/imageQuality.ts
    - src/components/validation/ImageQualityFeedback.tsx
    - src/components/validation/index.ts
  modified: []

key-decisions:
  - "Lenient thresholds per research (blur < 80, brightness 30-250) to prevent false positives"
  - "Export thresholds for potential tuning based on real user data during beta"
  - "Optional submit anyway button for edge cases where validation may be overly strict"

patterns-established:
  - "Canvas API pattern: create canvas, get context, draw image, getImageData for pixel analysis"
  - "Laplacian variance calculation for blur detection using 4-neighbor kernel"
  - "Luminance formula (0.299R + 0.587G + 0.114B) for perceptually accurate brightness"

# Metrics
duration: 2min
completed: 2026-02-05
---

# Phase 01 Plan 04: Image Quality Validation Summary

**Canvas-based image quality validation with blur and brightness detection, rejecting unusable photos before Vision API submission**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-05T13:13:32Z
- **Completed:** 2026-02-05T13:15:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Canvas-based blur detection using Laplacian variance algorithm
- Brightness validation preventing too-dark and too-bright images
- User-friendly feedback UI with actionable error messages and retake option
- Lenient thresholds to prevent false positives while catching truly unusable images
- CAPT-02 requirement satisfied: client-side quality check before API calls

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement image quality validation** - `1c6c3cf` (feat)
2. **Task 2: Create validation feedback UI** - `5100b53` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `src/lib/validation/imageQuality.ts` - Canvas-based validation with blur (Laplacian variance) and brightness detection
- `src/components/validation/ImageQualityFeedback.tsx` - Card UI showing validation errors, photo preview, and retake button
- `src/components/validation/index.ts` - Barrel export for validation components

## Decisions Made
- **Lenient thresholds:** Set blur threshold to 80 and brightness range to 30-250 per research recommendations. These prevent false positives while catching truly unusable images. Can be tuned based on real user data during beta.
- **Export thresholds:** Made IMAGE_QUALITY_THRESHOLDS exportable for testing/debugging and potential future tuning.
- **Optional submit anyway:** Added onSubmitAnyway prop to ImageQualityFeedback for edge cases where users believe their image is fine despite validation failure.
- **Actionable error messages:** Each validation issue includes specific guidance (e.g., "Try holding your phone steadier" for blur, "Try taking the photo in better lighting" for darkness).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict null checks for array access**
- **Found during:** Task 1 (TypeScript compilation verification)
- **Issue:** TypeScript complained that `data[i]`, `data[i+1]`, `data[i+2]` could be undefined (strict null checks)
- **Fix:** Added nullish coalescing operators (`?? 0`) to safely handle potential undefined values in pixel data array access
- **Files modified:** src/lib/validation/imageQuality.ts (calculateAverageBrightness and getGrayscale functions)
- **Verification:** `npx tsc --noEmit` passes without errors
- **Committed in:** 1c6c3cf (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** TypeScript strict mode fix necessary for compilation. No scope creep.

## Issues Encountered
None - plan executed smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Image quality validation ready for integration into camera capture flow
- Validation can be called after photo capture and before Vision API analysis
- UI component ready to display when validation fails
- Thresholds exported for potential A/B testing or user feedback-driven tuning in later phases

---
*Phase: 01-foundation-core-flow*
*Completed: 2026-02-05*
