# Feature Research

**Domain:** Vehicle Dashboard Diagnostic / Warning Light Apps
**Researched:** 2026-02-04
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Warning light identification** | Core value proposition - users need to know what the light means | MEDIUM | Database of 90+ warning lights is standard. DashDecoder uses AI vision instead of manual search |
| **Clear explanation of the issue** | Users need plain-language description of what's wrong | LOW | Most apps provide detailed descriptions. Must avoid technical jargon |
| **Severity/urgency indicator** | Users need to know if they can keep driving or must stop immediately | LOW | Color-coded system (red=critical, yellow/orange=soon, green=info) is industry standard |
| **Basic safety guidance** | Users expect "can I drive?" or "pull over now" advice | MEDIUM | Liability consideration - must be clear these are informational, not professional diagnosis |
| **Vehicle-specific information** | Generic advice is insufficient - users expect info for their make/model/year | HIGH | Requires comprehensive vehicle database (1996+ OBD-II). DashDecoder guesses vehicle from photo then asks user to confirm |
| **Mobile-friendly interface** | Users are typically in/near their car when they need help | LOW | PWA architecture addresses this. Must work on various screen sizes |
| **Search/browse capability** | Users may want to look up lights before they appear | LOW | Alternative to photo upload. Standard feature in all warning light apps |
| **Free tier access** | Users expect to try before buying, especially for emergency situations | LOW | Industry standard: basic identification free, advanced features paid. DashDecoder offers 1-2 free scans |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI photo recognition** | Eliminates need to manually search through light database. Faster, easier UX | HIGH | DashDecoder's core differentiator. Competes with iOS 17 Visual Look Up. Requires ML model training |
| **Vehicle identification from photo** | Reduces friction - user doesn't need to know their VIN or navigate menus | HIGH | AI recognizes vehicle from dashboard context clues. Fallback to manual selection if confidence low |
| **Repair cost estimates** | Helps users budget and avoid mechanic price gouging | MEDIUM | FIXD and BlueDriver offer this. Requires regional pricing database and common repair scenarios |
| **Step-by-step DIY fix instructions** | Empowers non-technical users to attempt simple repairs | MEDIUM | Creates stickiness. Requires curated content library. Video guides valuable but HIGH complexity |
| **Parts recommendations with affiliate links** | Monetization opportunity + user convenience | LOW-MEDIUM | Amazon affiliate standard. DashDecoder includes this in core plan. Must ensure recommendations are accurate |
| **Maintenance reminders/tracking** | Preventive value - helps users avoid future warning lights | MEDIUM | Apps like Loggy, CARFAX Car Care specialize in this. Could be Phase 2+ for DashDecoder |
| **No hardware required** | Lower barrier to entry vs OBD2 scanner apps | LOW | DashDecoder advantage - photo-based means no $40-100 hardware purchase |
| **One-time use friendly** | Users can get value without committing to subscription | MEDIUM | Free tier enables this. Contrast with FIXD/Carly requiring hardware + subscription |
| **Multi-language support** | Expands addressable market significantly | MEDIUM | Not common in US-focused apps but valuable for global reach |
| **Offline capability** | Works in poor cellular areas (parking garages, rural) | HIGH | PWA can cache warning light database. Complex for AI inference |
| **History log with photos** | Users can track recurring issues and show mechanic | MEDIUM | Good retention feature. Requires account persistence |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **OBD2 scanner integration** | Users want comprehensive diagnostics | Hardware requirement defeats photo-only convenience. Saturated market (FIXD, Carly, BlueDriver). Complex support burden | Partner with OBD2 app for premium users who want deeper diagnosis |
| **Direct mechanic booking** | One-stop solution for diagnosis + repair | Low margins, high complexity. Mechanic quality control issues. Geographic limitations. Competing with established platforms (RepairPal, YourMechanic) | Provide mechanic search links, let users choose their trusted shop |
| **Live chat with mechanics** | Users want real-time human expertise | Expensive to staff (FIXD charges extra $69.99/year). Liability concerns. Response time expectations. Doesn't scale | Comprehensive, well-written guidance + FAQ. Premium tier could offer async mechanic Q&A |
| **Customization/vehicle coding** | Power users want to modify vehicle settings | Highly vehicle-specific. Requires OBD2 hardware. Liability/warranty concerns. Niche feature that complicates core product | Carly specializes in this - not DashDecoder's focus. Stay in diagnostic lane |
| **Real-time monitoring** | Users want continuous vehicle health tracking | Requires always-on OBD2 connection. Battery drain. Notification fatigue. Moves away from "I have a light" use case | Focus on point-in-time diagnosis. Let dedicated monitoring apps (Hum, Cardr) handle continuous tracking |
| **Comprehensive repair videos** | Users want to learn how to fix everything | Production cost extremely high. Liability if user causes damage. Maintenance burden for 1000s of vehicle/issue combinations | Link to existing YouTube content. Curate quality resources rather than create from scratch |
| **Social features / community forums** | Users want to share experiences | Moderation burden. Misinformation risk (bad repair advice could cause harm). Dilutes core product focus | Link to established communities (Reddit r/MechanicAdvice). Focus on authoritative content |

## Feature Dependencies

```
[Warning Light Identification]
    ├──requires──> [AI Vision Model]
    └──requires──> [Warning Light Database]

[Vehicle-Specific Information]
    ├──requires──> [Warning Light Identification]
    ├──requires──> [Vehicle Database (1996+ OBD-II)]
    └──requires──> [Vehicle Confirmation UI]

[Repair Cost Estimates]
    ├──requires──> [Warning Light Identification]
    ├──requires──> [Vehicle-Specific Information]
    └──requires──> [Regional Pricing Database]

[Parts Recommendations]
    ├──requires──> [Warning Light Identification]
    ├──requires──> [Vehicle-Specific Information]
    └──requires──> [Affiliate Integration (Amazon)]

[DIY Fix Instructions]
    ├──requires──> [Warning Light Identification]
    └──requires──> [Vehicle-Specific Information]

[History Log]
    ├──requires──> [User Authentication]
    └──requires──> [Photo Storage]

[Maintenance Reminders]
    ├──requires──> [History Log]
    ├──requires──> [Vehicle-Specific Information]
    └──requires──> [Notification System]

[Free Tier] ──enables──> [User Acquisition]
[Subscription Tier] ──monetizes──> [Repeat Users]
```

### Dependency Notes

- **AI Vision Model requires Warning Light Database:** Model must be trained on labeled warning light images
- **Vehicle-Specific Information requires Warning Light Identification:** Must know what light it is before providing vehicle-specific guidance
- **Parts Recommendations requires Vehicle-Specific Information:** Part compatibility depends on exact make/model/year
- **Subscription Tier enhances Free Tier:** Free tier creates acquisition funnel, subscription monetizes engaged users
- **History Log requires User Authentication:** Can't track history without persistent user identity (Supabase auth)

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] **Photo upload interface** — Core UX. Must work smoothly on mobile
- [x] **AI warning light identification** — Core differentiator vs manual search apps
- [x] **Vehicle identification (AI guess + manual confirm)** — Required for vehicle-specific info
- [x] **Warning light explanation** — Table stakes. Plain language description
- [x] **Severity indicator** — Safety-critical. Color-coded urgency
- [x] **Basic fix steps** — Core value. What should user do next?
- [x] **Parts recommendations with affiliate links** — Monetization strategy
- [x] **Free tier (1-2 scans)** — Acquisition strategy
- [x] **Paid tier ($4.99/month Stripe)** — Core revenue model
- [x] **User authentication (Supabase)** — Required for free tier tracking and subscriptions
- [x] **Responsive PWA** — Table stakes for mobile-first use case

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **History log with photos** — Add when users request "where are my old scans?" (retention feature)
- [ ] **Browse warning lights** — Add when analytics show users want to search without uploading photo
- [ ] **Repair cost estimates** — Add when users ask "how much will this cost?" Requires pricing data
- [ ] **Enhanced DIY instructions** — Improve based on user feedback on initial fix steps
- [ ] **Vehicle database expansion** — Add pre-1996 vehicles if users request (not OBD-II standard)
- [ ] **Multi-language support** — Add based on geographic user data showing international demand
- [ ] **Offline mode improvements** — Add if rural users report connectivity issues
- [ ] **Email/SMS alerts** — Add if users want reminders or follow-ups

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Maintenance tracking** — Defer until core diagnostic use case is proven. Different user persona
- [ ] **Maintenance reminders** — Requires maintenance tracking. Preventive vs reactive use case
- [ ] **Multiple vehicle support** — Add when users request managing family fleet. Not MVP
- [ ] **PDF export of diagnosis** — Add if users need to share with mechanics
- [ ] **Integration with mechanic networks** — Complex partnerships. Defer until scale
- [ ] **OBD2 scanner partnership** — Only if users demand deeper diagnostics beyond warning lights
- [ ] **Predictive diagnostics** — Requires significant data/ML. Premium tier in future
- [ ] **API for third-party integrations** — Only relevant at scale

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Photo upload interface | HIGH | LOW | P1 |
| AI warning light identification | HIGH | HIGH | P1 |
| Warning light explanation | HIGH | LOW | P1 |
| Severity indicator | HIGH | LOW | P1 |
| Vehicle identification (AI + manual) | HIGH | HIGH | P1 |
| Basic fix steps | HIGH | MEDIUM | P1 |
| User authentication | HIGH | LOW | P1 |
| Free tier (1-2 scans) | HIGH | MEDIUM | P1 |
| Paid subscription ($4.99/mo) | HIGH | MEDIUM | P1 |
| Parts recommendations + affiliate | MEDIUM | LOW | P1 |
| Responsive PWA | HIGH | LOW | P1 |
| History log | MEDIUM | MEDIUM | P2 |
| Browse warning lights | MEDIUM | LOW | P2 |
| Repair cost estimates | HIGH | MEDIUM | P2 |
| Enhanced DIY instructions | MEDIUM | MEDIUM | P2 |
| Offline mode | LOW | HIGH | P2 |
| Multi-language support | MEDIUM | MEDIUM | P2 |
| Maintenance tracking | LOW | HIGH | P3 |
| Maintenance reminders | LOW | MEDIUM | P3 |
| Multiple vehicle support | LOW | MEDIUM | P3 |
| PDF export | LOW | LOW | P3 |
| OBD2 integration | LOW | HIGH | P3 |
| Predictive diagnostics | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitive Positioning

### DashDecoder's Unique Position

**Compared to OBD2 Scanner Apps (FIXD, Carly, BlueDriver):**
- ✅ No hardware required ($0 vs $40-100)
- ✅ Immediate use (photo vs buying/shipping/connecting scanner)
- ✅ Lower barrier to entry
- ❌ Less comprehensive diagnostics (warning lights only vs full OBD2 codes)
- ❌ Can't clear codes or monitor live data

**Compared to Manual Warning Light Apps:**
- ✅ AI photo identification (vs manual search through database)
- ✅ Vehicle identification reduces friction
- ✅ More modern UX/tech positioning
- ❌ Similar diagnostic depth

**Compared to iOS 17 Visual Look Up:**
- ✅ Vehicle-specific recommendations (iOS gives generic definitions)
- ✅ Monetization via parts/affiliate (iOS is free but generic)
- ✅ Cross-platform (iOS only)
- ✅ Repair guidance and next steps
- ❌ Requires separate app (iOS is built-in)

**Target User:** Non-technical car owner who sees warning light, wants immediate answer, doesn't want to buy hardware or read car manual. Willing to pay small fee for convenience and peace of mind.

## Competitor Feature Analysis

| Feature | FIXD | Carly | BlueDriver | Warning Light Camera | iOS 17 Visual Look Up | DashDecoder |
|---------|------|-------|------------|---------------------|---------------------|-------------|
| Hardware required | Yes ($60) | Yes ($70) | Yes ($100) | No | No | No |
| Subscription cost | $70/yr | $21-114/yr | Free | Free | Free | $5/mo ($60/yr) |
| AI photo recognition | No | No | No | Yes | Yes | Yes |
| Vehicle identification | Manual | Manual | Manual | No | No | AI + manual confirm |
| Warning light database | OBD2 codes | OBD2 codes | OBD2 codes | 90+ lights | Unknown | 100+ lights (target) |
| Severity indicator | Yes | Yes (ratings) | Yes | Yes | No | Yes (color-coded) |
| Repair cost estimates | Yes (premium) | Yes | Yes | No | No | Planned (v1.x) |
| Parts recommendations | No | No | Yes | No | No | Yes (affiliate) |
| DIY instructions | Yes | Yes | Yes | Basic | No | Yes |
| Clear codes | Yes | Yes | Yes | No | No | No |
| Live data monitoring | Yes | Yes | Yes | No | No | No |
| History tracking | Yes | Yes | Yes | No | No | Planned (v1.x) |
| Maintenance reminders | Yes (premium) | Yes | No | No | No | Planned (v2+) |
| Vehicle customization | No | Yes (major feature) | No | No | No | No |
| Multi-vehicle support | 5 vehicles | Multiple | 1 vehicle | Unlimited | N/A | Planned (v2+) |

### Key Insights

1. **Hardware-free is rare:** Only Warning Light Camera and iOS Visual Look Up don't require OBD2 hardware. This is DashDecoder's opportunity.

2. **Photo recognition is emerging:** Warning Light Camera and iOS 17 have it, but neither provides vehicle-specific repair guidance with monetization.

3. **Subscription pricing:** DashDecoder's $4.99/mo is competitive. FIXD charges $70/yr for premium, Carly $21-114/yr. Most free apps lack revenue model.

4. **OBD2 apps offer more depth:** They can clear codes, monitor live data, access all ECUs. DashDecoder focuses on simpler "what does this light mean?" use case.

5. **Parts recommendations uncommon:** Only BlueDriver offers this. Affiliate monetization is underutilized in this space.

6. **Free tier + freemium is rare:** Most OBD2 apps are one-time hardware purchase. DashDecoder's free tier (1-2 scans) enables viral acquisition.

## Market Insights

### User Pain Points (from research)

1. **Uncertainty and anxiety** — Users see warning light and panic. Need immediate reassurance about safety.
2. **Cost concerns** — Fear of mechanic overcharging. Want to know ballpark repair cost.
3. **Technical jargon** — OBD2 codes (P0420, etc.) are meaningless to average users. Need plain language.
4. **Hardware barriers** — Buying OBD2 scanner requires research, purchase, waiting for shipping, learning to use.
5. **Vehicle complexity** — Modern cars have 100+ warning lights. Manual search is tedious.

### Business Model Patterns

1. **Hardware + software** — FIXD ($60 hardware + $70/yr), Carly ($70 + $21-114/yr), BlueDriver ($100, no subscription)
2. **Freemium** — Basic features free, premium subscription for advanced. DashDecoder follows this.
3. **Affiliate revenue** — Parts recommendations with Amazon affiliate links. Underutilized opportunity.
4. **Professional services** — FIXD offers live mechanic chat for additional $70/yr. High-margin but scaling challenge.

### Pricing Analysis

| Product | Upfront Cost | Annual Cost | Total Year 1 | Target User |
|---------|-------------|-------------|--------------|-------------|
| FIXD | $59.99 | $69.99 | $129.98 | DIY enthusiast |
| Carly | $69.90 | $21.96-$113.76 | $91.86-$183.66 | Power user (VW/Audi) |
| BlueDriver | $99.95 | $0 | $99.95 | One-time buyer |
| DashDecoder | $0 | $59.88 ($4.99/mo) | $59.88 | Casual user |

**DashDecoder advantage:** Lowest Year 1 cost ($59.88 vs $91.86+), no upfront commitment, free tier for trial.

## Sources

### AI-Powered Diagnostics
- [AI for Automotive Repair: Complete 2025 Guide](https://dialzara.com/blog/ai-in-automotive-troubleshooting-use-cases-and-guide)
- [OBDAI – World's First AI OBD2 Scanner & Car Diagnostic App](https://obdai.app/)
- [How AI Is Revolutionizing Car Diagnostics](https://burtbrothers.com/tips/how-ai-is-changing-car-diagnostics/)
- [AI-Driven Diagnostic System for Vehicles](https://www.sae.org/publications/technical-papers/content/2024-01-5225/)

### Dashboard Warning Light Apps
- [Car Warning Lights Explained App](https://apps.apple.com/us/app/car-warning-lights-explained/id893411270)
- [Warning Light Camera App](https://apps.apple.com/us/app/warning-light-camera/id1465343815)
- [Dashboard Warning Lights App (Android)](https://play.google.com/store/apps/details?id=oht.lightsymbols.guidewarrninglight.lightdiagnostics.light.dashboard.dashboardwarninglights&hl=en_US)
- [Dashboard Warning Lights Decoded by iPhone – iOS 17 Feature](https://www.caranddriver.com/news/a44625839/dashboard-warning-lights-iphone-ios-update/)

### OBD2 Scanner Apps & Hardware
- [Best OBD2 Scanners for 2026, Tested](https://www.caranddriver.com/car-accessories/g42938164/best-obd2-car-scanners-tested/)
- [6 Best OBD2 ELM327 Apps for Android/iPhone (2026 Tested)](https://obdadvisor.com/best-obd2-app/)
- [Car Scanner ELM OBD2 App](https://apps.apple.com/us/app/car-scanner-elm-obd2/id1259933623)

### Competitor Comparisons
- [BlueDriver vs. Carly](https://www.mycarly.com/blog/car-diagnostics/carly-vs-bluedriver-best-obd2-scanner/)
- [FIXD vs Bluedriver](https://pixoneye.com/fixd-vs-bluedriver/)
- [Carly vs. FIXD](https://www.mycarly.com/blog/obd/carly-vs-fixd-obd2-scanner/)
- [FIXD vs. BlueDriver Which Is Better?](https://www.fixdapp.com/blog/fixd-vs-bluedriver/)

### Pricing & Features
- [FIXD - The Car Scanner](https://www.fixd.com/)
- [Is Carly Diagnostics Any Good? Complete 2026 Review](https://www.mycarly.com/blog/car-diagnostics/is-carly-diagnostics-any-good-complete-review-and-analysis/)
- [Carista OBD2 Pricing](https://carista.com/en/pricing)

### Maintenance Tracking
- [Loggy.com | Your vehicle's history in one place](https://www.loggy.com/)
- [Vehicle Maintenance Tracker App](https://apps.apple.com/us/app/vehicle-maintenance-tracker/id1315913699)
- [CARFAX Car Care](https://www.carfax.com/Service/)
- [Car Maintenance Tracking](https://www.acg.aaa.com/connect/blogs/5c/auto/car-maintenance-tracking-service-logs-apps-and-technologies)

### Severity & Diagnostics
- [Cardr: Smart Vehicle Diagnostic App](https://cardr.com/app/)
- [DTC Codes: Understanding Diagnostic Trouble Code Lists](https://gomotive.com/blog/dtc-codes/)
- [Vehicle Diagnostics System | Hum by Verizon](https://www.hum.com/features/vehicle-diagnostics/)

### Parts & Affiliate
- [RepairSolutions2 - Advanced Diagnostic Tools](https://www.innova.com/pages/repairsolutions2-app)
- [10 Diagnostic Apps and Devices to Make You a Better Driver](https://www.popularmechanics.com/cars/how-to/g767/10-diagnostic-apps-and-devices-to-make-you-a-better-driver/)

---
*Feature research for: Vehicle Dashboard Diagnostic / Warning Light Apps*
*Researched: 2026-02-04*
