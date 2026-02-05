# Project Research Summary

**Project:** DashDecoder - AI-Powered Vehicle Dashboard Diagnostic PWA
**Domain:** Automotive diagnostic tool combining AI vision, mobile PWA, and subscription SaaS
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

DashDecoder is a mobile-first PWA that uses AI vision to identify vehicle dashboard warning lights from photos, eliminating the need for expensive OBD2 scanner hardware. The product targets non-technical car owners who see a warning light and need immediate, plain-language guidance on severity and next steps. Research shows this is a viable niche between expensive OBD2 scanner apps (FIXD, Carly at $100+ hardware) and basic manual search apps that lack the convenience of AI photo recognition.

The recommended approach is Next.js 16 with React 19, Supabase for auth/database/storage, OpenAI GPT-4o for vision AI ($0.0021/image), and Stripe for $4.99/month subscriptions. This stack provides the fastest path to PWA with built-in offline support, secure API key management via Edge Functions, and proven subscription billing. The core differentiator is photo-based identification with vehicle-specific guidance, offering better UX than manual search while being more accessible than hardware-based competitors. Cost per user should stay under $0.10 if image compression and quality validation are implemented from day one.

Critical risks center on diagnostic accuracy and liability. Without mandatory vehicle make/model confirmation, generic AI responses could provide dangerous advice. The app must never position itself as authoritative diagnosis—every output requires "informational only, not professional advice" disclaimers. Additional risks include Vision API cost explosion without client-side quality checks, poor image quality causing 60%+ recognition failures, and subscription churn if ongoing value beyond one-time diagnosis isn't demonstrated. These are all addressable through proper architecture and conservative product positioning.

## Key Findings

### Recommended Stack

The stack centers on Next.js 16 (with built-in PWA support), React 19 (Server Components for reduced client JS), Supabase (auth + PostgreSQL + storage + Edge Functions), and OpenAI GPT-4o vision API. This combination provides the fastest development velocity while keeping infrastructure costs low during validation. Next.js 16's built-in PWA support eliminates the need for deprecated `next-pwa` library, and Supabase Edge Functions keep API keys secure while providing globally distributed compute.

**Core technologies:**
- **Next.js 16 + React 19**: Meta-framework with built-in PWA support, Server Components reduce client bundle size, App Router simplifies routing
- **TypeScript 5.9**: Type safety reduces bugs, inference from Zod schemas provides single source of truth
- **Supabase 2.94+**: Handles auth (JWT), PostgreSQL with Row Level Security for multi-tenant data, file storage for images, Edge Functions for AI orchestration
- **OpenAI GPT-4o**: Best cost/accuracy balance at $2.50 per million input tokens (~$0.0021 per image with vision), structured JSON responses, multimodal
- **Stripe**: Official React integration, Subscriptions API handles recurring billing, webhooks for lifecycle events, Customer Portal for self-service
- **Tailwind CSS 4.x**: Utility-first styling with smaller bundle than v3, shadcn/ui provides accessible components built on Radix UI
- **Dexie.js**: IndexedDB wrapper for offline scan queue and history caching, essential for PWA offline capability

**Critical versions:**
- Next.js 16 requires React 19 for Server Components
- Tailwind v4 officially supported by shadcn/ui as of January 2026
- Avoid deprecated `next-pwa` (unmaintained since July 2024)—use Next.js built-in PWA support

### Expected Features

Research shows a clear feature hierarchy: table stakes that users expect in any warning light app, competitive differentiators that justify premium pricing, and anti-features that seem valuable but create problems.

**Must have (table stakes):**
- **Warning light identification** — Users expect to identify what the light means (90+ light database is standard)
- **Clear plain-language explanation** — Avoid technical jargon; non-technical users need "check engine light" not "P0171 System Too Lean"
- **Severity indicator** — Color-coded urgency (red=critical, yellow=soon, green=info) tells users if safe to drive
- **Vehicle-specific information** — Generic advice insufficient; requires make/model/year context
- **Mobile-friendly interface** — Users are typically in/near car when seeking help
- **Free tier access** — Industry standard: 1-2 free scans for trial, then paid

**Should have (competitive differentiators):**
- **AI photo recognition** — DashDecoder's core differentiator vs. manual search apps; faster UX
- **Vehicle identification from photo** — AI guesses vehicle from dashboard context, user confirms; reduces friction
- **No hardware required** — Lower barrier to entry vs. OBD2 scanner apps ($0 vs $40-100)
- **Parts recommendations with affiliate links** — Monetization + convenience; Amazon Associates integration
- **DIY fix instructions** — Step-by-step guidance empowers non-technical users
- **History log with photos** — Retention feature; users can track recurring issues

**Defer (v2+):**
- **Maintenance tracking/reminders** — Different user persona (preventive vs. reactive); defer until core validated
- **OBD2 scanner integration** — Hardware defeats photo-only convenience; saturated market
- **Live chat with mechanics** — Expensive to staff ($70/year for FIXD), doesn't scale, liability concerns
- **Real-time monitoring** — Requires always-on OBD2, battery drain, notification fatigue

**Critical anti-features to avoid:**
- **Direct mechanic booking** — Low margins, quality control issues, geographic limitations
- **Comprehensive repair videos** — Production costs extremely high, liability if user causes damage
- **Social features/forums** — Moderation burden, misinformation risk (bad repair advice could cause harm)

### Architecture Approach

Standard PWA architecture with offline-first image upload queue, Edge Function orchestration for AI calls, and event-driven subscription management via Stripe webhooks. The key pattern is keeping all AI API calls server-side through Supabase Edge Functions to secure API keys, implement rate limiting, and enforce subscription tiers.

**Major components:**
1. **PWA Client (React + Service Worker)** — Camera capture, image compression, offline queue in IndexedDB, Background Sync API for upload retries
2. **Supabase Backend (Auth + Database + Storage)** — JWT authentication, PostgreSQL with Row Level Security, S3-compatible Storage for images, Edge Functions for API orchestration
3. **Edge Function: analyze-image** — Receives image URL, verifies auth, checks scan limits, calls OpenAI Vision API, stores results, updates scan count
4. **Edge Function: webhook-stripe** — Handles subscription lifecycle events (created, canceled, payment failed), updates database, no polling required
5. **OpenAI Vision API** — External service called only from Edge Functions, structured JSON responses, $0.0021/image cost

**Key patterns:**
- **Offline-first upload queue**: Images stored in IndexedDB, Background Sync API retries when connectivity restored
- **Edge Function AI orchestration**: All OpenAI calls proxied through Edge Functions; API keys never exposed to client
- **Event-driven subscriptions**: Stripe webhooks trigger Edge Functions that update subscription state in real-time
- **Client-side compression**: Reduce 4MB images to ~500KB before upload using Canvas API; saves bandwidth and storage costs

**Data flow:**
Camera → Local storage (IndexedDB) → Compress (Canvas API) → Upload to Supabase Storage → Edge Function (verify auth, check limits) → OpenAI Vision API → Parse response → Store in database → Return to client → Cache in IndexedDB for offline viewing

### Critical Pitfalls

Research identified seven major pitfalls that have sunk similar products. These require architectural decisions in Phase 1, not post-launch fixes.

1. **Over-reliance on visual recognition without context validation** — AI identifies symbol correctly but provides wrong diagnosis because it doesn't understand vehicle-specific context. A P0171 "System Too Lean" means different things on Toyota (cracked PCV hose) vs. GM (dirty MAF sensor). **Solution:** Mandatory vehicle make/model/year confirmation BEFORE diagnosis. Never recommend specific parts without "multiple possible causes" caveat.

2. **Poor image quality degrades accuracy to unusable levels** — Users submit photos in low light, with glare, or blurry, causing 60%+ recognition failures and wasted API costs. **Solution:** Real-time image quality detection before upload. Show guidance ("Move closer", "Reduce glare"). Reject obviously unusable images to avoid wasted API calls. Add preprocessing (contrast enhancement) if needed.

3. **Treating OBD-II codes as direct part recommendations** — App recommends specific part via affiliate link when issue could be multiple components. Creates 41% return visit rate within 14 days (vs. 12% with professional tools). **Solution:** Present "possible causes" not "confirmed failures". Strong disclaimers. Affiliate links lead to "parts that MAY be needed" not "buy now".

4. **Liability exposure from acting as diagnostic authority** — App provides definitive advice without disclaimers, user follows it, issue persists or causes safety failure, legal action ensues. No AI diagnostic app proven effective for safety-critical systems (ABS, airbag, power steering). **Solution:** Prominent disclaimers on EVERY diagnosis screen. Terms of Service require agreement before first scan. Use conditional language ("may indicate"). For red warnings, recommend immediate professional evaluation. Consider liability insurance.

5. **Subscription model without demonstrable value after free tier** — Users get 1-2 free scans, problem solved (or isn't), see no reason to pay $4.99/month. 30%+ cancellation in first month. **Solution:** Build ongoing value (history tracking, maintenance reminders, educational content). Consider pay-per-scan ($2-3) vs. monthly. Hybrid model: free tier + one-time purchases + optional subscription. Trial period (7 days) with full access to build habit.

6. **Vision API cost explosion as user base scales** — Each photo costs $0.0011-0.0021, multiple uploads per user (retries), free tier consumes API costs without revenue. Unpredictable spikes. **Solution:** Aggressive client-side filtering before API calls (blur detection, brightness checks). Rate limiting: max 3 uploads per user per session. Free tier: limit to 1-2 API-backed scans. Cache responses for identical image hashes. Billing alerts at 50%/75%/90% of budget.

7. **Training data bias toward common vehicles** — Vision AI performs well on Toyota Camry, Honda Accord, Ford F-150 but fails on luxury European, older vehicles, EVs. Creates poor experience for 20-40% of users. **Solution:** Test accuracy across 10+ manufacturers before launch. Set 80% accuracy threshold per category or add manual fallback. Build feedback loop ("Was this correct?"). Maintain manual override database for problematic combinations.

## Implications for Roadmap

Based on research, the roadmap should follow architectural dependencies and risk mitigation priorities. The critical path is: Database/Auth → Storage → AI Integration → Subscription Enforcement. Monetization comes after core flow works to avoid premature optimization.

### Suggested Phase Structure

**Phase 1: Foundation & Core Flow**
- **Rationale:** Everything depends on auth, database, and the core "photo → AI diagnosis" flow working. Must prove technical feasibility (AI accuracy, cost per scan) before building monetization. Database schema and RLS policies are foundational—changing them later is painful.
- **Delivers:** Authenticated users can capture/upload dashboard photos, receive AI-powered warning light identification with severity and basic guidance. Results stored in database.
- **Includes:** Supabase setup (database migrations, RLS policies, auth config), camera capture component, image compression, upload to Storage, Edge Function for OpenAI Vision API, results display with severity indicators, basic PWA manifest
- **Addresses features:** Warning light identification, clear explanation, severity indicator, mobile-friendly interface
- **Avoids pitfalls:** Image quality validation (real-time guidance), vehicle confirmation (mandatory make/model/year), liability disclaimers (on every diagnosis), client-side compression (cost control)
- **Research flag:** None—standard PWA + AI vision patterns well-documented

**Phase 2: Production Hardening & Offline**
- **Rationale:** Before any users pay money, the app must be reliable and work offline (PWA requirement). This phase addresses operational concerns that aren't visible but are critical for production.
- **Delivers:** Offline-capable PWA with service worker, upload queue that retries when connectivity restored, comprehensive error handling, performance monitoring, cost controls.
- **Includes:** Service Worker with Background Sync API, IndexedDB offline queue (Dexie.js), cached scan history for offline viewing, rate limiting (3 uploads/session), billing alerts, error boundaries, loading states
- **Addresses features:** Offline capability (table stakes for PWA), history log for offline access
- **Avoids pitfalls:** Vision API cost explosion (rate limiting, billing alerts), poor UX from blocking operations (async queue), camera access broken on iOS (file upload fallback)
- **Research flag:** None—offline queue patterns well-established

**Phase 3: Subscription & Monetization**
- **Rationale:** Core flow must work first to understand what we're gating. Can validate demand with free tier before building complex billing. Subscription enforcement requires webhook handling (complex) and scan limit logic.
- **Delivers:** Free tier (1-2 scans), paid tier ($4.99/month), Stripe Checkout flow, subscription status checks, upgrade prompts, Customer Portal for self-service cancellation.
- **Includes:** Stripe Checkout integration, webhook Edge Function (subscription lifecycle events), scan limit enforcement (check before AI call), subscription status UI, upgrade modals, parts recommendations with Amazon affiliate links
- **Addresses features:** Free tier access, paid subscription, parts recommendations (monetization)
- **Avoids pitfalls:** Subscription value gap (affiliate links provide immediate monetization while usage-based billing considered), scan limit prevents free tier abuse
- **Research flag:** Stripe webhook idempotency handling—may need deeper research on edge cases (failed payments, cancellation during trial)

**Phase 4: Enhanced Diagnosis & Vehicle Data**
- **Rationale:** After monetization working, enhance diagnostic accuracy with richer vehicle database and improved AI prompting. This phase differentiates from basic competitors.
- **Delivers:** Vehicle-specific repair guidance, DIY fix instructions with step-by-step detail, improved AI prompting for better accuracy, repair cost estimates (regional pricing).
- **Includes:** Comprehensive vehicle database (1996+ OBD-II), vehicle-specific guidance (not generic), enhanced DIY instructions, repair cost estimates (if pricing data available), accuracy improvements from user feedback
- **Addresses features:** Vehicle-specific information (table stakes), DIY fix instructions (differentiator), repair cost estimates (planned v1.x)
- **Avoids pitfalls:** Over-reliance on visual recognition (vehicle-specific data provides context), training data bias (expanded vehicle database improves coverage)
- **Research flag:** Vehicle database sourcing—may need research on OBD-II code databases and pricing APIs during planning

**Phase 5: Retention & Growth**
- **Rationale:** After core product validated and monetization working, focus on retention to reduce churn and demonstrate ongoing value beyond one-time diagnosis.
- **Delivers:** Scan history with photos, maintenance tracking, educational content library, email/SMS alerts for recurring issues, multi-vehicle support.
- **Includes:** Enhanced history page (search, filter), maintenance reminders, vehicle profiles (multiple vehicles), educational content (common issues), push notifications for reminders
- **Addresses features:** History log (competitive), maintenance reminders (v2+), multi-vehicle support (v2+)
- **Avoids pitfalls:** Subscription churn (ongoing value beyond one-time use), demonstrates habit formation during trial period
- **Research flag:** None—standard retention features

### Phase Ordering Rationale

- **Foundation before monetization:** Must validate core value prop (AI accuracy, user willingness to pay) before building complex subscription logic. Stripe integration is non-trivial; don't build it until core flow proven.
- **Offline before scale:** PWA without offline support isn't truly a PWA. Service worker and offline queue are architectural—retrofitting later is painful. Must work before marketing push.
- **Vehicle data after basics:** Comprehensive vehicle database nice-to-have but not MVP. Generic guidance with disclaimers sufficient to validate concept. Vehicle-specific enhancements come after subscription revenue justifies investment.
- **Retention after monetization:** Can't optimize churn until you have paying users. Free tier users churning is expected; paid subscriber churn is the metric. Focus on acquisition first, retention second.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Subscriptions):** Stripe webhook edge cases (failed payments, trial cancellations, refunds) may need `/gsd:research-phase` to understand proper handling. Subscription tier enforcement logic (how to sync state between Stripe and database) needs clarity.
- **Phase 4 (Vehicle Data):** OBD-II code databases and vehicle-specific diagnostic data sourcing unclear. May need research on available APIs (NHTSA, third-party providers) and licensing terms. Repair cost estimate data (regional pricing) also needs sourcing research.

**Phases with standard patterns (skip research):**
- **Phase 1 (Foundation):** PWA + Supabase + OpenAI Vision well-documented. Tutorials exist for this exact stack.
- **Phase 2 (Offline):** Service Worker patterns, IndexedDB queue, Background Sync API all have canonical implementations.
- **Phase 5 (Retention):** Standard features with established best practices.

### Critical Dependencies

```
Database Schema & Auth (Phase 1)
    ↓
Image Upload & Storage (Phase 1)
    ↓
AI Vision Integration (Phase 1)
    ↓
Service Worker & Offline (Phase 2)
    ↓
Subscription Enforcement (Phase 3) ← Depends on scan counting from Phase 1
    ↓
Vehicle-Specific Data (Phase 4) ← Depends on basic flow working
    ↓
Retention Features (Phase 5) ← Depends on subscription data from Phase 3
```

**Critical path:** Database → Auth → Storage → Edge Function → AI Integration → Service Worker → Subscription

**Can be parallel:** UI polish, educational content, affiliate link setup (Phase 3+4), history features (Phase 5)

**Defer to later:** Advanced features like vehicle confirmation refinement, maintenance tracking, multi-language

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Next.js 16, React 19, Supabase, OpenAI GPT-4o verified from official docs. Versions confirmed. PWA support built into Next.js 16 (official guide exists). Stripe integration well-documented. |
| Features | **HIGH** | Extensive competitor analysis (FIXD, Carly, BlueDriver, Warning Light Camera, iOS 17 Visual Look Up). Clear table stakes vs. differentiators. Anti-features identified from user reviews and industry analysis. |
| Architecture | **HIGH** | Standard PWA patterns (offline-first, service worker, IndexedDB). Supabase Edge Functions proven approach for AI API orchestration. Stripe webhook patterns well-established. Project structure follows Bulletproof React conventions. |
| Pitfalls | **MEDIUM** | Diagnostic accuracy issues well-documented in automotive AI research. Subscription churn rates from RevenueCat 2025 report. Vision API cost concerns based on pricing docs but actual usage patterns estimated. Liability concerns inferred from similar diagnostic tools, not legal precedent specific to AI diagnostic apps. |

**Overall confidence:** **HIGH**

Research is comprehensive with primary sources (official documentation) for stack and architecture decisions. Feature analysis grounded in competitor research and user reviews. Pitfalls identified from industry analysis and best practices, though some are preventive (not based on actual failures in production).

### Gaps to Address

**During Phase Planning:**

- **Vehicle database sourcing (Phase 4):** Research doesn't identify specific OBD-II code database API or provider. Need to evaluate NHTSA API, third-party providers (AutoMD, RepairPal), licensing terms, and cost. May require `/gsd:research-phase` before detailed planning.

- **Repair cost estimate data (Phase 4):** Research mentions this feature but doesn't identify data source. RepairPal has pricing API but terms unclear. May require research during Phase 4 planning to determine if viable or defer to v2.

- **Amazon Associates API migration:** Research notes PA-API deprecation (April 30, 2026 deadline) and migration to Creators API (OAuth 2.0). This deadline is during development—need to plan OAuth flow from start, not legacy PA-API.

- **Actual Vision API accuracy testing:** Research provides cost estimates and theoretical accuracy concerns, but real-world accuracy on dashboard photos unknown until testing. Phase 1 should include alpha testing with 20+ vehicles to validate accuracy assumptions. If accuracy <75%, may need to reconsider feasibility.

- **Legal review for liability disclaimers:** Research identifies liability risk but doesn't provide specific legal language. Must consult attorney before Phase 1 launch to review all user-facing diagnostic text and Terms of Service. Budget for legal review ($2-5K).

**During Implementation:**

- **iOS Safari camera quirks:** Research notes iOS Safari has restrictive camera permissions but doesn't detail specific workarounds. May encounter unexpected issues during Phase 1 that require additional research.

- **Image preprocessing effectiveness:** Research suggests contrast enhancement and noise reduction before Vision API call but doesn't provide benchmarks. May need experimentation during Phase 2 to determine if preprocessing improves accuracy enough to justify implementation cost.

- **Subscription value perception:** Research shows 30%+ first-month churn for subscription apps but doesn't confirm if affiliate links alone provide sufficient ongoing value. Phase 3 should include user interviews to validate value proposition before full launch.

## Sources

### Primary Sources (HIGH confidence)

**Official Documentation:**
- Next.js 16 Release Notes & PWA Guide — Confirmed built-in PWA support, version compatibility
- React 19.2 Release Notes — Server Components, useOptimistic, new hooks
- Supabase Documentation — Auth, Storage, Edge Functions, Row Level Security
- OpenAI API Pricing & Vision Docs — GPT-4o cost ($2.50 input / $10 output per million tokens), vision capabilities
- Anthropic Pricing — Claude Sonnet 4.5 alternative ($3 input / $15 output)
- Stripe Subscriptions Documentation — Checkout flow, webhook handling, subscription lifecycle
- Tailwind v4 + shadcn/ui Docs — Version compatibility confirmed

**Stack Research (STACK.md sources):**
- npm package registries — Verified versions (@supabase/supabase-js 2.94.1, Vitest 4.0.18)
- Amazon Associates PA-API deprecation notice — April 30, 2026 deadline confirmed

### Secondary Sources (MEDIUM confidence)

**Feature Research (FEATURES.md sources):**
- Car and Driver OBD2 scanner comparison (2026 tested) — Feature matrix for FIXD, Carly, BlueDriver
- Competitor websites — FIXD, Carly, BlueDriver, Warning Light Camera feature lists and pricing
- iOS 17 announcement — Visual Look Up for dashboard lights (Apple event coverage)
- App Store / Play Store — User reviews for competitor apps, pricing verification

**Architecture Research (ARCHITECTURE.md sources):**
- Smashing Magazine — Offline-first image upload patterns
- Medium / Dev.to — React architecture patterns (Bulletproof React), PWA implementation guides
- Supabase blog — AI integration patterns, Edge Functions examples
- Stripe documentation — Webhook best practices, subscription design patterns

**Pitfall Research (PITFALLS.md sources):**
- RevenueCat State of Subscription Apps 2025 — Churn rates, conversion benchmarks (30% first-month churn)
- Automotive industry articles — Diagnostic accuracy concerns, 41% return visit rate for consumer tools
- Vision API pricing docs — Cost calculations, rate limits
- Security best practices — Supabase RLS policies, GDPR compliance
- Academic papers (ScienceDirect, arXiv) — AI diagnostic tool effectiveness, training data bias

### Tertiary Sources (LOW confidence, needs validation)

- **Image quality impact on Vision API accuracy:** Inferred from low-light image enhancement research and general computer vision limitations. No benchmarks specific to dashboard photos.
- **Liability precedents:** No specific legal cases found for AI diagnostic tools. Risk assessment based on general product liability principles and automotive repair standards.
- **Free-to-paid conversion rates:** 5% benchmark from subscription app industry, not specific to automotive diagnostic tools. May be higher or lower for this domain.
- **Cost per user estimates:** Calculated based on API pricing and assumed usage patterns (1-3 photo uploads per scan). Actual costs depend on real user behavior.

---
*Research completed: 2026-02-04*
*Ready for roadmap: yes*
*Next step: Requirements definition and phase-by-phase roadmap creation*
