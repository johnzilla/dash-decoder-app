---
phase: 05-frontend-integration-analytics
plan: 02
subsystem: frontend, backend
tags: [funnel, device-data, ab-variant, analytics, tracking]
---

# Plan 05-02 Summary

## One-Liner
Funnel timestamps, device data, and A/B variant tracking wired through ScanContext and sent to backend on diagnosis complete.

## What Was Built

### Task 1: Backend schema + session route updates
- `server/db/schema.ts` — added funnel timestamp columns (cameraAt, captureAt, diagnosisAt, feedbackAt), device columns (userAgent, screenWidth, screenHeight, connectionType), and variant column to scanSessions table
- `server/routes/sessions.ts` — PATCH endpoint accepts all new fields

### Task 2: Frontend funnel tracking + variant capture
- `src/context/ScanContext.tsx` — extended with sessionId, variant (from ?v= URL param), recordFunnelStep, getFunnelTimestamps
- `src/routes/scan.tsx` — records funnel steps at camera/capture/diagnosis, sends device data + timestamps via PATCH on diagnosis complete
- `src/lib/api/openai.ts` — analyzeWarningLight returns sessionId from server response

## Key Files

### Modified
- `server/db/schema.ts` — 9 new columns on scanSessions
- `server/routes/sessions.ts` — PATCH accepts new fields
- `src/context/ScanContext.tsx` — funnel/variant state management
- `src/routes/scan.tsx` — funnel step recording + device data dispatch
- `src/lib/api/openai.ts` — sessionId in return type

## Decisions Honored
- D-06: Client-side timestamps batched on diagnosis complete
- D-07: User agent + screen + connection captured
- D-09: ?v= parsed on app load, stored in context, sessions without param tagged "organic"

## Requirements Addressed
- ANLYT-03: Funnel step timestamps recorded per session
- ANLYT-04: Device and browser data captured per session
- EXPT-01: A/B variant from ?v= stored on session
- EXPT-02: Sessions without ?v= tagged "organic"

## Self-Check: PASSED
- server/db/schema.ts contains cameraAt, captureAt, diagnosisAt, variant columns
- src/context/ScanContext.tsx exports recordFunnelStep, getFunnelTimestamps, variant, sessionId
- src/routes/scan.tsx calls recordFunnelStep at camera/capture/diagnosis steps
- TypeScript compiles clean
