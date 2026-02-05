# Requirements: DashDecoder

**Defined:** 2026-02-04
**Core Value:** A car owner can photograph a dashboard warning light and immediately understand what's wrong, how urgent it is, and what to do next.

## v1 Requirements

### Image Capture

- [ ] **CAPT-01**: User can upload a photo or use device camera to capture a dashboard warning light
- [ ] **CAPT-02**: App validates image quality before sending to AI (rejects blurry/dark images with guidance)

### AI Analysis

- [ ] **AI-01**: AI identifies the warning light/error code from the uploaded photo
- [ ] **AI-02**: AI guesses vehicle make/model/year from dashboard appearance
- [ ] **AI-03**: User can confirm or correct the AI's vehicle guess before seeing results

### Diagnosis

- [ ] **DIAG-01**: User sees plain English explanation of what the warning light means
- [ ] **DIAG-02**: User sees color-coded severity indicator (red = stop now, yellow = soon, green = info)
- [ ] **DIAG-03**: User sees safety guidance ("can I keep driving?" / "pull over now")
- [ ] **DIAG-04**: User sees step-by-step DIY fix instructions for common issues
- [ ] **DIAG-05**: Every diagnosis includes "informational only, not professional advice" disclaimer

### Monetization

- [ ] **PAY-01**: User gets 2 free scans total without an account (tracked via localStorage)
- [ ] **PAY-02**: User can subscribe via Stripe at $4.99/month
- [ ] **PAY-03**: Waitlist members get lifetime $2.50/month pricing
- [ ] **PAY-04**: Diagnosis results include affiliate links to buy relevant parts/supplies

### Accounts

- [ ] **AUTH-01**: User can sign up with email and password (Supabase auth)
- [ ] **AUTH-02**: User receives email verification after signup (Resend + DNS)
- [ ] **AUTH-03**: User can log in and stay logged in across sessions
- [ ] **AUTH-04**: User can view their past scans with photos and diagnoses

### PWA

- [ ] **PWA-01**: App is responsive and mobile-first
- [ ] **PWA-02**: App is installable as a home screen PWA

## v2 Requirements

### Discovery

- **DISC-01**: User can browse/search warning light database without uploading a photo
- **DISC-02**: User can look up warning lights by vehicle make/model

### Enhanced Diagnosis

- **EDIAG-01**: User sees estimated repair cost range for identified issue
- **EDIAG-02**: User sees enhanced DIY instructions with illustrations

### Vehicle Management

- **VEH-01**: User can save multiple vehicles to their profile
- **VEH-02**: User can switch between saved vehicles when scanning

### Reliability

- **REL-01**: App caches warning light data for offline access
- **REL-02**: App queues scans when offline and processes when connectivity returns

### Localization

- **LOC-01**: App supports multiple languages (starting with Spanish)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile apps (iOS/Android) | PWA covers mobile for v1; no mobile dev experience |
| OBD2 Bluetooth reader integration | Hardware requirement defeats photo-only convenience |
| Real-time video analysis | Single photo sufficient; video adds complexity without value |
| Mechanic marketplace / booking | Low margin, high complexity; not core diagnostic value |
| Live chat with mechanics | Expensive, doesn't scale; written guidance sufficient |
| Vehicle customization / coding | Niche power-user feature; liability and warranty concerns |
| Real-time monitoring | Requires hardware; contradicts photo-based model |
| Comprehensive repair videos | Production cost too high; link to YouTube instead |
| Social features / community forums | Moderation burden; misinformation risk; link to Reddit instead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPT-01 | — | Pending |
| CAPT-02 | — | Pending |
| AI-01 | — | Pending |
| AI-02 | — | Pending |
| AI-03 | — | Pending |
| DIAG-01 | — | Pending |
| DIAG-02 | — | Pending |
| DIAG-03 | — | Pending |
| DIAG-04 | — | Pending |
| DIAG-05 | — | Pending |
| PAY-01 | — | Pending |
| PAY-02 | — | Pending |
| PAY-03 | — | Pending |
| PAY-04 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| PWA-01 | — | Pending |
| PWA-02 | — | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 20 (pending roadmap creation)

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after initial definition*
