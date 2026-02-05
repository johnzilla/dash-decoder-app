# Pitfalls Research

**Domain:** AI-Powered Vehicle Dashboard Diagnostic Apps (Image Analysis)
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Over-Reliance on Visual Recognition Without Context Validation

**What goes wrong:**
The AI identifies the warning light symbol correctly but provides generic diagnosis without understanding the vehicle-specific context, make, model, or actual diagnostic trouble codes. A P0171 "System Too Lean" warning appears identical across manufacturers but can mean completely different root causes on a Toyota Camry (cracked PCV hose), GM V6 (dirty MAF sensor), or turbocharged Subaru (leaking fuel injector).

**Why it happens:**
Vision APIs excel at pattern recognition but have no semantic understanding of automotive systems. Developers assume that identifying the symbol is sufficient for diagnosis, when the symbol is actually just a symptom indicator, not a diagnostic conclusion.

**How to avoid:**
- Require explicit vehicle make/model/year confirmation BEFORE providing diagnosis
- Cross-reference warning light identification with known OBD-II codes for that specific vehicle
- Provide diagnostic confidence scores and caveat recommendations
- Never recommend specific parts replacement without acknowledging multiple possible causes
- Include "This warning can indicate multiple issues" disclaimers prominently

**Warning signs:**
- User complaints about following advice that didn't fix the problem
- High return/churn rates after first diagnosis
- 1-star reviews mentioning "wasted money on wrong parts"
- Users reporting 41%+ return visit rates within 14 days (industry failure benchmark)

**Phase to address:**
Phase 1 (Core Flow MVP) - Build vehicle confirmation as mandatory step before diagnosis generation. Phase 3 should add OBD-II code cross-referencing if expanding beyond basic warnings.

---

### Pitfall 2: Poor Image Quality Degrades Accuracy to Unusable Levels

**What goes wrong:**
Users submit photos taken in poor lighting conditions (night driving, dashboard glare, reflections, low contrast) which drastically reduces AI recognition accuracy. Low-light conditions cause noise, distorted images, and poor contrast. Dashboard lights photographed through windshield glare, with phone camera shake, or in bright sunlight become unrecognizable.

**Why it happens:**
- PWAs have limited camera API control compared to native apps (can't access advanced settings or background processing)
- iOS Safari particularly restrictive with camera permissions and quality controls
- Users don't understand optimal photo conditions
- Vision APIs trained on well-lit, high-quality images perform poorly on real-world dashboard photos

**How to avoid:**
- Implement real-time image quality detection BEFORE upload
- Show in-app guidance: "Move closer", "Reduce glare", "Improve lighting"
- Provide example photos showing good vs. bad quality
- Allow users to adjust camera resolution for quality/performance balance
- Consider rejecting obviously unusable images early to avoid wasted API calls
- Add image preprocessing (contrast enhancement, noise reduction) before Vision API call

**Warning signs:**
- High percentage of "Unable to identify warning light" results
- Users uploading multiple photos before getting results
- Elevated Vision API costs without corresponding successful identifications
- Spike in support requests about "app doesn't work"

**Phase to address:**
Phase 1 (Core Flow MVP) - Implement basic quality checks and user guidance. Phase 2 should add preprocessing pipeline if quality issues persist in production.

---

### Pitfall 3: Treating OBD-II Codes as Direct Part Recommendations

**What goes wrong:**
The app sees a diagnostic code, looks up the most common cause in a database, and recommends specific parts via affiliate links. Users replace the sensor when they actually needed to fix wiring, or replace expensive components when the issue was a loose gas cap. This creates a 41% return visit rate within 14 days (vs. 12% with professional tools).

**Why it happens:**
Affiliate revenue model creates perverse incentive to recommend parts. Static lookup tables paired with basic NLP don't account for sensor correlations, historical patterns, or vehicle-specific failure modes. Developers without automotive expertise assume DTC codes map 1:1 to failed components.

**How to avoid:**
- NEVER recommend specific parts without caveat of "possible causes include multiple components"
- Present diagnostic codes as "symptoms requiring investigation" not "confirmed failures"
- Show multiple possible causes ranked by probability for that vehicle
- Link to educational content explaining proper diagnosis steps
- Affiliate links should lead to "parts that MAY be needed" not "parts to buy now"
- Add disclaimers: "This tool cannot replace professional diagnosis for complex issues"

**Warning signs:**
- User reviews saying "bought the part, didn't fix it"
- High affiliate link click-through but low conversion (users researching, not buying)
- Support requests about "wrong diagnosis"
- Regulatory scrutiny or liability concerns

**Phase to address:**
Phase 1 (Core Flow MVP) - Build in multi-cause presentation and strong disclaimers. Phase 4 (Monetization) must carefully balance affiliate revenue with diagnostic accuracy reputation.

---

### Pitfall 4: Liability Exposure from Acting as Diagnostic Authority

**What goes wrong:**
App provides definitive diagnostic advice ("Replace your oxygen sensor") without proper disclaimers. User follows advice, issue persists, user experiences safety failure (brakes, airbag, steering) or expensive consequential damage. User pursues legal action claiming app misdiagnosis caused harm or financial loss.

**Why it happens:**
Developers underestimate legal exposure of providing automotive safety advice. Terms of Service buried and not prominent at point of diagnosis. Product positioning as "AI diagnosis" creates reasonable user expectation of accuracy. No AI diagnostic app has proven effective for safety-critical systems (ABS, airbag, power steering) per 2025 industry research.

**How to avoid:**
- Prominent disclaimers at EVERY diagnosis screen: "This is educational information, not professional mechanical advice"
- Terms of Service must explicitly limit liability and require agreement BEFORE first diagnosis
- Never make definitive statements about safety-critical systems
- Use conditional language: "may indicate", "commonly caused by", "professional inspection recommended"
- For ANY red warning light, recommend immediate professional evaluation
- Consider professional liability insurance even with disclaimers
- Log user acknowledgment of disclaimers for each diagnosis

**Warning signs:**
- Any user inquiry about liability or guarantee of accuracy
- Legal demand letters or complaints
- Warning lights related to safety systems (brake, airbag, steering, ABS)
- Users asking "Should I drive my car with this light on?"

**Phase to address:**
Phase 1 (Core Flow MVP) - Must have comprehensive legal disclaimers and liability limitations from day one. Consult attorney before launch. Phase 2 should add safety-critical warning detection with mandatory "see professional immediately" messaging.

---

### Pitfall 5: Subscription Model Without Demonstrable Value After Free Tier

**What goes wrong:**
Users get 1-2 free scans, receive basic diagnosis, problem is solved (or isn't), user sees no reason to pay $4.99/month. 30% of annual subscriptions cancelled in first month. Free-to-paid conversion rate remains below 5% because value proposition unclear after initial use.

**Why it happens:**
Most car owners need diagnostic help infrequently (few times per year, not monthly). Single-use value proposition doesn't justify recurring subscription. No habit formation during onboarding. Users perceive diagnostic tools as one-time need, not ongoing service. Competing free alternatives (AutoZone free code reading, YouTube diagnosis guides, free OBD-II apps).

**How to avoid:**
- Build ongoing value beyond one-time diagnosis:
  - Diagnostic history tracking across multiple vehicles
  - Maintenance reminders and schedules
  - Severity tracking and watch lists for intermittent issues
  - Educational content library
  - Priority support for subscribers
- Consider alternative pricing: pay-per-scan ($2-3 each) instead of monthly subscription
- Hybrid model: free tier + one-time purchases + optional subscription
- Free tier limitations should create clear value gap (1 scan/month free, unlimited for subscribers)
- Onboarding must demonstrate 3+ use cases beyond immediate diagnostic need
- Trial period (7 days) with full feature access to build habit

**Warning signs:**
- Free-to-paid conversion below 5%
- 30%+ cancellation in first month
- High percentage of users never returning after first scan
- App Store reviews: "Too expensive for one-time use"
- Spike in cancellations immediately after problem resolved

**Phase to address:**
Phase 4 (Monetization & Retention) - Test multiple pricing models before committing to monthly subscription. Phase 5 should add ongoing-value features (maintenance tracking, history) if subscription model chosen.

---

### Pitfall 6: Vision API Cost Explosion as User Base Scales

**What goes wrong:**
Each user photo costs $0.0011+ per Vision API call (Gemini) or per-unit pricing (Google Cloud Vision). Multiple photo uploads per user (poor quality retries), plus 1000+ daily users = API costs exceeding subscription revenue. Unpredictable cost spikes during traffic surges.

**Why it happens:**
Underestimating actual user behavior (multiple photo uploads, retries, experimentation). No client-side validation causing unnecessary API calls for obviously bad images. Free tier users consuming API costs without revenue. Lack of caching for duplicate/similar images.

**How to avoid:**
- Implement aggressive client-side filtering before API calls (blur detection, brightness checks, size validation)
- Rate limiting: max 3 image uploads per user per session
- Free tier: limit to 1-2 API-backed scans, then show cached/generic results
- Consider local ML model for initial quality screening (TensorFlow Lite, ONNX Runtime in browser)
- Cache Vision API responses for identical image hashes
- Monitor per-user API costs and flag abuse
- Set up billing alerts at 50%, 75%, 90% of monthly budget
- Build cost-per-user metrics into analytics from day one

**Warning signs:**
- Vision API costs growing faster than revenue
- High percentage of failed/low-confidence API responses (wasted calls)
- Individual users making 10+ API calls per session
- Costs spike unexpectedly during traffic increases
- Gross margin turning negative

**Phase to address:**
Phase 1 (Core Flow MVP) - Implement basic rate limiting and client-side validation. Phase 2 (Production Hardening) must add comprehensive cost controls and monitoring before scaling.

---

### Pitfall 7: Training Data Bias Toward Common Vehicles and Warning Lights

**What goes wrong:**
Vision AI performs excellently on common vehicles (Toyota Camry, Honda Accord, Ford F-150) with standard warning lights, but fails on less common makes (luxury European, older vehicles, trucks, EVs) or newer warning light symbols (EV-specific, ADAS systems). Accuracy disparity creates poor experience for 20-40% of user base.

**Why it happens:**
Pre-trained Vision APIs trained predominantly on common consumer vehicles. Dashboard warning light symbols vary significantly across manufacturers and model years. Newer symbols (EV battery warnings, adaptive cruise control, lane departure) underrepresented in training data. 1996-2010 vehicles have different symbol designs than 2020+ models.

**How to avoid:**
- Test Vision API accuracy across vehicle makes BEFORE launch:
  - Top 10 US manufacturers
  - Common European brands (BMW, Mercedes, VW, Volvo)
  - EVs (Tesla, Rivian, Nissan Leaf)
  - 1996-2005 older dashboards vs. 2020+ modern displays
- Set accuracy threshold: if <80% accuracy for a category, add manual fallback
- Build feedback loop: "Was this identification correct?" to identify systematic failures
- Maintain manual override database for problematic vehicle/symbol combinations
- Consider fine-tuning Vision API with custom dashboard image dataset
- Transparent messaging: "Best results with 2015+ Toyota, Honda, Ford" if bias exists

**Warning signs:**
- Reviews mentioning specific makes/models not working
- Accuracy varies wildly between user segments
- Older vehicle owners have higher failure rates
- EV or luxury vehicle owners report poor results
- "Works great on my Honda, terrible on my BMW" reviews

**Phase to address:**
Phase 1 (Core Flow MVP) - Test against diverse vehicle set during alpha. Phase 3 should build custom training dataset if bias significantly impacts user experience.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping vehicle make/model confirmation, using only image recognition | Faster user flow, fewer friction points | Massive diagnostic accuracy problems, liability exposure, user trust damage | Never - vehicle context is critical for accuracy |
| Using generic OBD-II lookup table instead of vehicle-specific data | Easier implementation, single data source | 40%+ misdiagnosis rate, high user churn, reputation damage | Only for MVP if clearly disclaimered and replaced by Phase 2 |
| No image quality validation before Vision API call | Simpler client code | Wasted API costs, poor UX from failed recognitions, cost explosion at scale | Only during prototype/alpha testing |
| Storing raw user photos without compression/optimization | Easier storage implementation | Database/storage costs explode, slow page loads, compliance risk (privacy) | Never - implement compression and retention policy from day one |
| Single Vision API provider without fallback | Easier integration, no complexity | Complete service failure if provider down/rate limited, vendor lock-in, no accuracy comparison | MVP only, must add fallback by Phase 2 |
| Hard-coded affiliate links in codebase | Quick monetization setup | Cannot A/B test, cannot change partners easily, harder to track conversions | Early MVP if revenue not critical; migrate to database by Phase 4 |
| No offline mode for previously viewed diagnoses | Simpler PWA architecture | Poor UX when connectivity drops, users can't reference previous results | Acceptable for MVP if <10% users experience connectivity issues |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vision API (Google/Gemini) | Not handling rate limits gracefully, app crashes when quota exceeded | Implement exponential backoff, queue system, friendly error messages, billing alerts at 80% quota |
| Supabase Auth | Storing sensitive vehicle/diagnosis data without Row Level Security (RLS) | Enable RLS from day one, never trust client-side auth checks, encrypt PII |
| Stripe Subscriptions | Not handling webhook failures, subscription status becomes desynced | Idempotent webhook handlers, retry logic, regular reconciliation jobs, test with Stripe CLI |
| PWA Camera API | Assuming camera permissions granted, no fallback for denied access | Request permissions with clear explanation, allow file upload alternative, handle iOS Safari quirks |
| Affiliate Networks | Assuming links always valid, no broken link detection | Periodic link validation, fallback to direct manufacturer parts pages, track click-through rates |
| Vision API | Sending user photos without privacy consideration (face/license plate in frame) | Client-side cropping/masking before upload, auto-delete images after 24hrs, privacy policy disclosure |
| Supabase Storage | No retention policy for user-uploaded images | Automated cleanup job (delete images >30 days old), GDPR-compliant deletion on account closure |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No image compression before upload | Slow uploads on mobile networks, high storage costs | Client-side compression to <500KB, WebP format, max resolution 1920x1080 | >100 daily users |
| Synchronous Vision API calls blocking UI | Users wait 3-5 seconds staring at blank screen | Async processing with progress indicator, optimistic UI showing "Analyzing..." | >50 concurrent users |
| Loading all user diagnostic history on dashboard | Page load times increase to 10+ seconds | Pagination (10 items), infinite scroll, or virtual scrolling | Users with >20 historical scans |
| No database indexes on user_id, created_at queries | Slow dashboard queries as user base grows | Add indexes on all foreign keys and timestamp fields used in WHERE clauses | >10K users |
| Vision API responses not cached | Same warning light queried repeatedly wastes API calls | Cache responses by image hash, 7-day TTL | >500 daily users |
| No CDN for static assets | Slow page loads globally, high bandwidth costs | Cloudflare/Vercel CDN, cache-control headers, optimize bundle size | Users outside primary region |
| Large client bundle with unused code | 2MB+ initial download, poor mobile experience | Code splitting, tree shaking, lazy load non-critical features | Launch - affects all users |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing user vehicle photos indefinitely | GDPR violations, privacy breach, unnecessary attack surface | Auto-delete images 24-48hrs after diagnosis, encrypted at rest, user-initiated deletion option |
| No Row Level Security (RLS) on Supabase diagnosis table | User A can access User B's diagnostic history and vehicle info | Enable RLS policies: `user_id = auth.uid()` on all user tables, test with multiple accounts |
| Exposing Vision API key in client-side code | API key theft, unauthorized usage, cost explosion from abuse | All API calls through Supabase Edge Functions/backend, never expose keys in frontend |
| Not sanitizing vehicle make/model inputs | SQL injection, XSS attacks via stored vehicle info | Parameterized queries, input validation, escape HTML in display, CSP headers |
| Unvalidated file uploads (user photos) | Malware uploads, executable files disguised as images, stored XSS | Validate Content-Type, check magic bytes, re-encode images server-side, virus scanning for >1K daily uploads |
| Affiliate links with user PII in URL params | Privacy leak, tracking exposure, GDPR violation | Anonymized tracking tokens, no user email/name in affiliate URLs, disclose tracking in privacy policy |
| Session tokens in localStorage (vulnerable to XSS) | Account takeover if XSS vulnerability exists | HttpOnly cookies for auth tokens, Supabase handles this correctly if configured properly |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account creation before first scan | 80% drop-off, users want to try before committing | Anonymous first scan, convert to account after showing value, email optional for results |
| No guidance on how to photograph dashboard | 60%+ failed recognitions, user frustration, app deleted | Step-by-step photo guide with examples, real-time feedback ("too dark", "too far"), video tutorial |
| Showing only technical diagnostic codes (P0171) | Non-technical users confused, "what does this mean?", one-star reviews | Plain English explanation FIRST, code as secondary detail, visual severity indicator (red/yellow/green) |
| Immediate paywall after free tier exhausted | User with urgent problem hits paywall, negative reviews, churn | Soft paywall: show limited results or downgraded accuracy, explain premium benefits, offer trial |
| No explanation of severity/urgency | Users don't know if safe to drive or need tow truck immediately | Color-coded severity (Red: STOP DRIVING, Yellow: Schedule Soon, Green: Monitor), plain language urgency |
| Auto-playing video ads during diagnosis flow | Users trying to diagnose urgent car problem interrupted by ads, rage uninstall | No ads during critical flow, ads only in educational content sections, respect user urgency |
| Complex vehicle year/model dropdown (500+ options) | Decision fatigue, abandoned flow, typos | Auto-suggest search field, detect from uploaded photo if possible, "I don't know" option with generic results |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Image Upload:** Often missing file size limits - verify 10MB max, reject >5MB with warning
- [ ] **Vision API Integration:** Often missing error handling for rate limits - verify graceful degradation when quota exceeded
- [ ] **Vehicle Selection:** Often missing validation that year/make/model is valid combination - verify against real VIN database or known-good combinations
- [ ] **Diagnosis Display:** Often missing severity indicators - verify color-coded urgency and "safe to drive?" guidance
- [ ] **Affiliate Links:** Often missing tracking/attribution - verify conversion tracking, broken link detection, commission reconciliation
- [ ] **Subscription Flow:** Often missing cancellation edge cases - verify handles Stripe webhook failures, cancellation during trial, refund requests
- [ ] **User Dashboard:** Often missing empty states - verify messaging when user has no scan history, no vehicles, no subscriptions
- [ ] **Privacy Compliance:** Often missing GDPR data export/deletion - verify user can download all data, request full account deletion
- [ ] **PWA Installation:** Often missing iOS Safari testing - verify install prompt works, camera permissions granted, offline mode functional on iOS
- [ ] **Error Messaging:** Often missing specific actionable guidance - verify errors explain what happened AND what user should do next

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Poor diagnostic accuracy driving negative reviews | MEDIUM-HIGH | 1) Immediately add disclaimers to all results, 2) Email affected users with corrected info + refund offer, 3) Implement vehicle-specific validation, 4) Respond to reviews acknowledging issue and fix |
| Vision API costs exceeding revenue | HIGH | 1) Implement emergency rate limiting (10 scans/user/day), 2) Pause free tier temporarily, 3) Add client-side quality validation, 4) Migrate to cheaper API or hybrid model, 5) Consider investor funding if growth worth cost |
| User data breach or privacy violation | CRITICAL | 1) Immediately contain: disable affected systems, 2) Engage legal counsel, 3) Notify affected users within 72hrs (GDPR), 4) Implement missing security controls, 5) Third-party security audit, 6) Consider cybersecurity insurance claim |
| Subscription churn >30% first month | MEDIUM | 1) User interviews to understand why (5-10 churned users), 2) Add ongoing-value features (maintenance tracking), 3) Test alternative pricing (pay-per-scan), 4) Improve onboarding to demonstrate value, 5) Consider pivot if fundamentally wrong model |
| Liability lawsuit from misdiagnosis | CRITICAL | 1) Engage attorney immediately, 2) Review liability insurance policy, 3) Preserve all relevant logs/data, 4) DO NOT communicate with claimant without legal counsel, 5) Strengthen disclaimers for future, 6) Consider product pivot away from diagnostic advice |
| Camera access broken on iOS Safari update | LOW-MEDIUM | 1) Add file upload fallback immediately, 2) Test on latest iOS Safari, 3) Update PWA manifest and permissions requests, 4) Communicate workaround to users via in-app banner, 5) Monitor WebKit bug tracker for resolution |
| Affiliate partner terminates relationship | LOW | 1) Have 2-3 backup affiliate programs ready, 2) Update links in database (not hardcoded), 3) Test new links thoroughly, 4) Communicate any price changes to users, 5) Track conversion rates to ensure new partner performs |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Over-reliance on visual recognition without context | Phase 1 (Core Flow MVP) | Manual testing with 10+ vehicle types, verify diagnosis changes based on make/model selection |
| Poor image quality degrading accuracy | Phase 1 (Core Flow MVP) | Test with intentionally poor photos (low light, glare, blur), verify rejection or guidance shown |
| Treating OBD-II codes as direct part recommendations | Phase 1 (Core Flow MVP) | Review all diagnosis outputs, verify "possible causes" language, no definitive "replace X" statements |
| Liability exposure from diagnostic authority | Phase 1 (Core Flow MVP) | Legal review of all user-facing text, disclaimers on every diagnosis screen, attorney sign-off before launch |
| Subscription model without demonstrable value | Phase 4 (Monetization) | Measure free-to-paid conversion >8%, first-month churn <25%, conduct user interviews about value |
| Vision API cost explosion | Phase 2 (Production Hardening) | Monitor cost-per-user <$0.10, billing alerts configured, rate limiting tested with load test |
| Training data bias toward common vehicles | Phase 1 (Alpha Testing) | Test accuracy across 20+ vehicle makes, document accuracy rates by segment, >75% for all segments or flag limitation |
| PWA camera access issues on iOS Safari | Phase 1 (Core Flow MVP) | Test on real iOS devices (not simulator), verify permissions flow, file upload fallback works |
| No offline mode for previous diagnoses | Phase 3 (Enhanced Features) | Test with network disconnected, verify cached results accessible, appropriate messaging shown |
| Inadequate error handling for API failures | Phase 2 (Production Hardening) | Simulate API downtime, rate limiting, network failures - verify graceful degradation and user messaging |
| Missing Supabase Row Level Security | Phase 1 (Core Flow MVP) | Attempt to access another user's data via API, verify blocked, security audit before launch |
| Broken affiliate links | Phase 4 (Monetization) | Automated link checker runs weekly, manual spot-check 10 links, tracking confirms commissions received |

## Sources

### AI Diagnostic Tools - General
- [AI for Automotive Repair: Complete 2025 Guide](https://dialzara.com/blog/ai-in-automotive-troubleshooting-use-cases-and-guide)
- [Artificial Intelligence-Driven Vehicle Fault Diagnosis - ScienceDirect](https://www.sciencedirect.com/org/science/article/pii/S152614922400290X)
- [The Diagnostic Challenge - Auto Service World](https://www.autoserviceworld.com/the-diagnostic-challenge/)

### Vision AI & Image Recognition
- [Computer Vision in Automotive - N-iX](https://www.n-ix.com/computer-vision-in-automotive/)
- [Low-Light Image Enhancement - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12027663/)
- [Understanding Bias in Large-Scale Visual Datasets - arXiv](https://arxiv.org/html/2412.01876v1)
- [Fair Human-Centric Image Benchmark - Sony AI](https://ai.sony/articles/Groundbreaking-Fairness-Evaluation-Dataset-From-Sony%20AI%20/)
- [OCR Accuracy Benchmarks 2026 - Medium](https://medium.com/@info_59976/ocr-accuracy-benchmarks-the-2026-digital-transformation-revolution-2f7095c2696f)

### PWA & Camera Access
- [PWA Camera Access Guide 2025](https://simicart.com/blog/pwa-camera-access/)
- [Camera Access Issues in iOS PWA - STRICH](https://kb.strich.io/article/29-camera-access-issues-in-ios-pwa)
- [PWA Offline Capabilities - GoMage](https://www.gomage.com/blog/pwa-offline/)
- [Progressive Web App Offline Support - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)

### Subscription Model & Retention
- [State of Subscription Apps 2025 - RevenueCat](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [Mobile App Retention Benchmarks 2025](https://growth-onomics.com/mobile-app-retention-benchmarks-by-industry-2025/)
- [Subscription App Churn Reasons - RevenueCat](https://www.revenuecat.com/blog/growth/subscription-app-churn-reasons-how-to-fix/)
- [Free Trial Conversion Rates - Adapty](https://adapty.io/blog/trial-conversion-rates-for-in-app-subscriptions/)

### Vision API Pricing & Scaling
- [Google Cloud Vision API Pricing 2026](https://www.g2.com/products/google-cloud-vision-api/pricing)
- [Gemini API Pricing - Google AI](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API Rate Limits 2026](https://www.aifreeapi.com/en/posts/gemini-api-rate-limit-explained)
- [Cloud Vision Quotas - Google Cloud](https://cloud.google.com/vision/quotas)

### OBD-II & Diagnostics
- [Complete OBD2 Code List - OBD2Pros](https://obd2pros.com/dtc-codes/)
- [OBD-II Trouble Codes - OBD-Codes.com](https://www.obd-codes.com/)

### Supabase Security
- [Supabase Security Overview](https://supabase.com/security)
- [Securing Your Data - Supabase Docs](https://supabase.com/docs/guides/database/secure-data)
- [Supabase Security 2025 Retro](https://supabase.com/blog/supabase-security-2025-retro)
- [Best Security Practices in Supabase - Supadex](https://www.supadex.app/blog/best-security-practices-in-supabase-a-comprehensive-guide)

---
*Pitfalls research for: DashDecoder - AI-Powered Vehicle Dashboard Diagnostic PWA*
*Researched: 2026-02-04*
