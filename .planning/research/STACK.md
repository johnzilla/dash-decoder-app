# Stack Research

**Domain:** AI-powered vehicle dashboard diagnostic PWA
**Researched:** 2026-02-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (latest: supports PPR & Cache Components) | React meta-framework with built-in PWA support | Official Next.js PWA guide eliminates need for external dependencies. Next.js 16 includes Cache Components and Partial Pre-Rendering for instant navigation. Vercel deployment optimized. Server Components reduce client JS for mobile users. |
| React | 19.2+ | UI library | React 19 stable with Server Components, Actions, useOptimistic for instant UI updates, and use() hook for simplified data fetching. New useFormStatus hook perfect for upload states. |
| TypeScript | 5.9.3 | Type safety | Industry standard for React apps. TypeScript 5.9 includes expandable hovers and improved language server. TypeScript 7 (Go rewrite) coming but 5.9 stable for production. |
| Tailwind CSS | 4.x | Utility-first styling | Tailwind v4 moves to CSS-first configuration. shadcn/ui officially supports v4. Perfect for responsive PWA layouts. Smaller bundle sizes than v3. |

### Backend & Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | 2.94.1 (@supabase/supabase-js) | Auth, PostgreSQL database, storage | Already integrated with landing page. Handles auth (email/password, magic links, social), PostgreSQL with Row Level Security for multi-tenant data, and file storage for uploaded images. Native React hooks via @supabase/ssr for Next.js App Router. |
| Vercel | N/A | Hosting & deployment | Native Next.js platform. Zero-config PWA deployment. Edge Functions for low-latency. Built-in analytics. Git-based deployment workflow. Free tier sufficient for MVP. |
| Stripe | @stripe/stripe-js 4.x, @stripe/react-stripe-js 2.x | Payment processing | Official React integration. Subscriptions API handles recurring billing. Webhooks for subscription lifecycle events. Customer Portal for self-service. Test mode for development. |

### AI/Vision APIs

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| OpenAI GPT-4o | Latest API | Primary vision AI for dashboard light recognition | $2.50 input / $10 output per million tokens. Vision: ~85 tokens per low-detail image (~$0.0021/image). GPT-4o best balance of accuracy and cost. Supports image analysis, OCR, object detection. Multi-modal (text + vision). |
| OpenAI GPT-4o-mini | Latest API | Fallback/budget option | $0.15 input / $0.60 output per million tokens (16x cheaper). Good for high-volume users or cost optimization. Trade-off: slightly lower accuracy. |
| Claude Sonnet 4.5 | Latest API | Alternative/comparison testing | $3 input / $15 output per million tokens. Strong vision capabilities. Useful for A/B testing accuracy. Prompt caching (90% savings on repeated context) if sending vehicle database info. |

**Recommendation:** Start with GPT-4o for accuracy. Add GPT-4o-mini tier for free users if budget requires. Avoid Google Gemini Vision ($0.0011/image but separate pricing model complicates billing).

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | Latest (Tailwind v4 compatible) | Unstyled accessible UI components | Pre-built components (Dialog, Form, Button, Card, etc.) built on Radix UI. Copy-paste, not installed. Fully customizable with Tailwind. Accessible by default (WCAG 2.1). |
| Radix UI | Latest | Headless accessible primitives | Foundation for shadcn/ui. Handles ARIA, focus management, keyboard navigation. Use directly if shadcn component doesn't exist. |
| React Hook Form | 7.x | Form state management | Superior performance vs Formik. Uncontrolled components minimize re-renders. Perfect for image upload form. Works with Zod validation. |
| Zod | 3.x | Schema validation | TypeScript-first runtime validation. Type inference means single source of truth. Validate API responses, form inputs, environment variables. |
| browser-image-compression | 2.x | Client-side image compression | Compress images before upload (save bandwidth, faster uploads). Supports JPEG, PNG, WebP, BMP. Web Worker support for non-blocking compression. Can reduce 4MB images to ~500KB. |
| Dexie.js | 4.x | IndexedDB wrapper | Offline storage for scan history. Minimalistic API over IndexedDB. Sync queued scans when back online. Essential for PWA offline capability. |
| @tanstack/react-query | 5.x | Server state management | Cache AI responses. Optimistic updates for instant UI. Automatic background refetching. Works seamlessly with Server Components. |
| next-intl | 3.x | Internationalization (future) | If expanding beyond English. Works with Next.js App Router. |

### PWA-Specific

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native Next.js PWA | Built-in (Next.js 16+) | Service worker & manifest | Use Next.js built-in PWA support (App Router). No external dependencies needed. Generate manifest.json via app/manifest.ts. |
| Workbox | Via Next.js | Service worker utilities | Automatically handled by Next.js PWA. Precaching, runtime caching, offline fallbacks. No direct installation needed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Testing framework | 4.0.18 latest. 10-20x faster than Jest. Native ES modules. Jest-compatible API. Use with @testing-library/react. |
| @testing-library/react | Component testing | User-centric testing approach. Works with Vitest. |
| ESLint | Linting | v9 with @typescript-eslint/parser. Next.js includes ESLint config. Deprecated formatting rules (use Prettier separately). |
| Prettier | Code formatting | eslint-config-prettier to avoid conflicts. Format on save in IDE. |
| PostHog | Analytics & feature flags | Open-source product analytics. Native Vercel integration. GDPR-compliant. Feature flags for A/B testing AI models. No cookies required. |
| Vercel Analytics | Web analytics | Built-in with Vercel. Privacy-compliant. Tracks pageviews, unique users, time on page. Free on all plans. |

## Installation

```bash
# Core framework
npm install next@latest react@latest react-dom@latest

# TypeScript
npm install -D typescript @types/react @types/node

# Styling
npm install tailwindcss@latest postcss autoprefixer
npm install tailwindcss-animate # or tw-animate-css for v4

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Stripe
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# AI APIs (server-side)
npm install openai anthropic

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Image handling
npm install browser-image-compression

# Offline storage
npm install dexie

# Server state
npm install @tanstack/react-query

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Vite + React | If building pure SPA without SSR. Vite faster dev server but lacks Next.js routing, SSR, API routes. Not recommended for PWA with SEO needs. |
| OpenAI GPT-4o | Google Gemini Vision | If Google ecosystem preferred. Gemini has generous free tier (1000 requests/day) but complex token pricing. Not recommended unless cost is primary driver. |
| Supabase | Firebase | If already on Google Cloud. Firebase more mature but vendor lock-in. Supabase open-source and PostgreSQL (standard SQL). |
| Stripe | Paddle, Lemon Squeezy | If need merchant of record (handles taxes). Adds overhead for simple $4.99/month subscription. Not recommended for MVP. |
| Radix UI + shadcn/ui | React Aria Components | If need Adobe's accessibility expertise. More complex API. Radix easier for most use cases. |
| React Hook Form | Formik | Legacy choice. Formik heavier, more re-renders. Use Formik only if team already familiar. |
| Dexie.js | Direct IndexedDB | If need maximum control. Dexie simplifies 95% of use cases. Direct IndexedDB verbose and error-prone. |
| Vitest | Jest | If team strongly prefers Jest. Jest slower, requires more config for ES modules. Vitest recommended for new projects. |
| PostHog | Mixpanel, Amplitude | If need enterprise features. PostHog open-source, self-hostable, better pricing for startups. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Deprecated by React team in 2025. No longer maintained. | Next.js, Vite, or Remix |
| next-pwa (@shadowwalker/next-pwa) | Unmaintained since July 2024. Next.js now has built-in PWA support. | Next.js built-in PWA (App Router manifest.ts) |
| Webpack directly | Next.js uses Turbopack (Rust-based, faster). Custom Webpack config adds complexity. | Stick with Next.js defaults (Turbopack) |
| tailwindcss-animate (with Tailwind v4) | Deprecated for Tailwind v4. | tw-animate-css |
| AWS Access Keys for Amazon Associates | Amazon deprecated PA-API (April 30, 2026 deadline). | Amazon Creators API (OAuth 2.0) |
| Legacy Supabase keys | Transitioning to publishable keys for better security. | New publishable key format |
| GPT-4 Turbo (older model) | GPT-4o cheaper and faster. | GPT-4o or GPT-4o-mini |
| Redux Toolkit | Overkill for this app. Server state via React Query, client state via React 19 hooks. | React Query + useState/useOptimistic |
| Axios | fetch() built-in, Next.js provides enhanced fetch. | Native fetch() |
| Moment.js | Huge bundle size, no longer maintained. | date-fns or native Intl.DateTimeFormat |

## Stack Patterns by Variant

**If going mobile-native (future):**
- Add React Native with Expo
- Use @supabase/supabase-js (works in React Native)
- Add react-native-compressor for image compression
- Stripe still handles web payments (redirect from app)

**If scaling to enterprise:**
- Add Redis for caching AI responses (reduce API costs)
- Add BullMQ for background job processing
- Upgrade Supabase to Pro tier (better performance, dedicated resources)
- Add Sentry for error monitoring
- Consider self-hosted PostHog for data privacy

**If adding real-time features:**
- Use Supabase Realtime (built-in)
- Example: Live support chat, real-time diagnosis updates

**If going multi-language:**
- Add next-intl for i18n
- Store translations in Supabase (manageable by non-devs)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16 | React 19.x | Requires React 19 for Server Components |
| React 19 | React Hook Form 7.x | Fully compatible |
| Tailwind CSS 4.x | shadcn/ui latest | shadcn/ui officially supports Tailwind v4 as of January 2026 |
| @supabase/supabase-js 2.94+ | Next.js 16 | Use @supabase/ssr for App Router SSR support |
| Vitest 4.x | React 19 | Requires @testing-library/react compatible with React 19 |
| TypeScript 5.9 | All packages | Wait for TypeScript 7 (Go rewrite) - currently in development |
| Stripe Elements | React 19 | @stripe/react-stripe-js 2.x supports React 19 |

## Confidence Assessment

| Category | Confidence | Rationale |
|----------|-----------|-----------|
| Core Stack (Next.js, React, TypeScript) | HIGH | Verified via official docs and release notes. Next.js 16 released October 2025. React 19.2 latest stable. |
| PWA Implementation | HIGH | Official Next.js PWA guide published fall 2024. Built-in support verified. next-pwa deprecation confirmed. |
| AI Vision APIs | HIGH | Pricing verified from official OpenAI and Anthropic pricing pages. GPT-4o recommended by multiple sources for cost/accuracy balance. |
| Supabase Integration | HIGH | Version 2.94.1 verified from npm search. @supabase/ssr for Next.js App Router well-documented. |
| Stripe Subscriptions | HIGH | Official Stripe docs for React integration. Subscriptions API mature and well-supported. |
| UI Components (shadcn/Radix) | HIGH | shadcn/ui Tailwind v4 support confirmed. Radix UI accessibility standards verified. |
| Testing (Vitest) | MEDIUM | Version 4.0.18 verified. Performance claims based on community reports, not official benchmarks. |
| Analytics (PostHog) | MEDIUM | Vercel integration confirmed. Feature set based on documentation, not hands-on testing. |
| Image Compression | MEDIUM | browser-image-compression widely used. Version based on npm search. Performance (4MB→500KB) from blog posts, not official specs. |
| Amazon Associates Migration | HIGH | PA-API deprecation date (April 30, 2026) verified from official Amazon Associates help. Creators API migration required. |

## Sources

### Official Documentation
- [Next.js 16 Release](https://nextjs.org/blog/next-15-5) - Next.js 16 features (October 2025)
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2) - React 19.2 release notes
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official PWA guide
- [TypeScript 5.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html) - TypeScript release notes
- [Tailwind v4 - shadcn/ui](https://ui.shadcn.com/docs/tailwind-v4) - Tailwind v4 support
- [Supabase React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) - Supabase auth with React
- [Stripe React Docs](https://docs.stripe.com/sdks/stripejs-react) - React Stripe.js reference
- [OpenAI Pricing](https://openai.com/api/pricing/) - OpenAI API pricing
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing) - Claude API pricing

### Package Registries
- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js) - Version 2.94.1
- [browser-image-compression on npm](https://www.npmjs.com/package/browser-image-compression) - Client-side compression
- [Vitest on npm](https://www.npmjs.com/package/vitest) - Version 4.0.18

### Technical Articles (2026)
- [Top PWA Frameworks 2026](https://www.alphabold.com/top-frameworks-and-tools-to-build-progressive-web-apps/) - PWA framework comparison
- [Next.js PWA Implementation 2026](https://medium.com/@amirjld/how-to-implement-pwa-progressive-web-app-in-next-js-app-router-2026-f25a6797d5e6) - January 2026 guide
- [React Hook Form with Zod Complete Guide for 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Form validation patterns
- [Dexie.js for Offline Storage](https://blog.logrocket.com/dexie-js-indexeddb-react-apps-offline-data-storage/) - IndexedDB implementation
- [Prettier + ESLint Configuration That Actually Works](https://medium.com/@osmion/prettier-eslint-configuration-that-actually-works-without-the-headaches-a8506b710d01) - January 2026 linting setup

### Amazon Associates
- [Amazon Associates PA-API Deprecation](https://www.keywordrush.com/blog/amazon-creator-api-what-changed-and-how-to-switch/) - April 30, 2026 deadline confirmed

### Analytics & Monitoring
- [PostHog Vercel Integration](https://posthog.com/docs/libraries/vercel) - PostHog official docs
- [Vercel Analytics Guide](https://vercel.com/kb/guide/posthog-nextjs-vercel-feature-flags-analytics) - Using PostHog with Next.js

---
*Stack research for: DashDecoder AI-powered vehicle dashboard diagnostic PWA*
*Researched: 2026-02-04*
*Confidence: HIGH*
