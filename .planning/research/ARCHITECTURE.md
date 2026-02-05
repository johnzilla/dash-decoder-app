# Architecture Research

**Domain:** AI-powered image analysis PWA with Supabase backend
**Researched:** 2026-02-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                         PWA Client Layer                           │
├───────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Camera    │  │   Image    │  │   User     │  │  Payment   │  │
│  │  Capture   │  │  Upload    │  │   Auth     │  │  UI        │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │
│        │               │               │               │          │
│  ┌─────┴───────────────┴───────────────┴───────────────┴──────┐  │
│  │              Service Worker (PWA Shell)                      │  │
│  │      - Offline Queueing    - Asset Caching                   │  │
│  │      - Background Sync     - Push Notifications              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     IndexedDB                                 │ │
│  │  - Image Queue  - Scan History  - User Preferences           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌───────────────────────────────────────────────────────────────────┐
│                      Supabase Backend Layer                        │
├───────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐    ┌────────────────────┐                 │
│  │  Auth Module       │    │  Storage Bucket    │                 │
│  │  - JWT Sessions    │    │  - Dashboard Pics  │                 │
│  │  - User Profiles   │    │  - Public URLs     │                 │
│  └─────────┬──────────┘    └──────────┬─────────┘                 │
│            │                           │                           │
│  ┌─────────┴───────────────────────────┴─────────┐                │
│  │          PostgreSQL Database                   │                │
│  │  Tables: users, scans, subscriptions,          │                │
│  │          scan_results, affiliate_links         │                │
│  └────────────────────────────────────────────────┘                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Supabase Edge Functions                          │ │
│  │                                                                │ │
│  │  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │ analyze-image │  │ create-scan  │  │ webhook-stripe   │   │ │
│  │  │ (AI call)     │  │ (orchestrate)│  │ (subscriptions)  │   │ │
│  │  └───────┬───────┘  └──────┬───────┘  └─────────┬────────┘   │ │
│  │          │                  │                     │            │ │
│  └──────────┼──────────────────┼─────────────────────┼────────────┘ │
└─────────────┼──────────────────┼─────────────────────┼──────────────┘
              │                  │                     │
              ↓                  │                     ↓
     ┌─────────────────┐         │           ┌─────────────────┐
     │  OpenAI Vision  │         │           │  Stripe API     │
     │  API (GPT-4o)   │         │           │  - Checkout     │
     │  - Image Analysis│        │           │  - Webhooks     │
     │  - JSON Response │        │           │  - Portal       │
     └─────────────────┘         │           └─────────────────┘
                                 ↓
                        ┌─────────────────┐
                        │  Affiliate APIs │
                        │  - Parts Links  │
                        │  - Price Data   │
                        └─────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Camera Capture** | Access device camera, capture photos, handle permissions | MediaDevices API (getUserMedia), HTML5 File Input |
| **Image Upload** | Queue uploads, handle offline, compress images | IndexedDB for queue, Background Sync API, Canvas API for compression |
| **Service Worker** | Cache assets, manage offline behavior, sync when online | Workbox (Google), custom service worker registration |
| **Auth Module** | User authentication, session management, tier enforcement | Supabase Auth (JWT), protected routes, subscription checks |
| **Edge Functions** | Serverless API endpoints, orchestrate AI calls, webhook handling | Deno runtime, Supabase Edge Functions (globally distributed) |
| **PostgreSQL** | Persistent data storage, relational queries, RLS policies | Supabase Postgres with Row Level Security |
| **Storage Bucket** | Image file storage, CDN delivery, public URL generation | Supabase Storage with S3-compatible API |
| **Vision API** | AI image analysis, warning light identification, vehicle detection | OpenAI GPT-4o Vision API with structured JSON responses |
| **Payment System** | Subscription management, checkout flow, webhook processing | Stripe Checkout + Customer Portal, subscription lifecycle events |

## Recommended Project Structure

```
dash-decoder-app/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── service-worker.js       # Generated by build
│   └── icons/                  # App icons (various sizes)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx
│   │   │   └── ImagePreview.tsx
│   │   ├── scan/
│   │   │   ├── ScanUpload.tsx
│   │   │   ├── ScanResult.tsx
│   │   │   └── ScanHistory.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── subscription/
│   │   │   ├── PricingCard.tsx
│   │   │   ├── SubscriptionStatus.tsx
│   │   │   └── PaymentButton.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   ├── features/               # Feature-based organization
│   │   ├── dashboard-scan/
│   │   │   ├── api/
│   │   │   │   └── scanApi.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useScanUpload.ts
│   │   │   │   └── useScanHistory.ts
│   │   │   ├── store/
│   │   │   │   └── scanSlice.ts
│   │   │   └── types/
│   │   │       └── scan.types.ts
│   │   ├── subscription/
│   │   │   ├── api/
│   │   │   │   └── stripeApi.ts
│   │   │   ├── hooks/
│   │   │   │   └── useSubscription.ts
│   │   │   └── types/
│   │   │       └── subscription.types.ts
│   │   └── auth/
│   │       ├── api/
│   │       │   └── authApi.ts
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       └── context/
│   │           └── AuthContext.tsx
│   ├── services/               # External service integrations
│   │   ├── supabase.ts         # Supabase client initialization
│   │   ├── offline-queue.ts    # Background sync queue manager
│   │   └── storage.ts          # IndexedDB wrapper
│   ├── utils/                  # Helper functions
│   │   ├── imageCompression.ts
│   │   ├── errorHandling.ts
│   │   └── validators.ts
│   ├── hooks/                  # Shared custom hooks
│   │   ├── useOnlineStatus.ts
│   │   ├── useCamera.ts
│   │   └── usePersistedState.ts
│   ├── pages/                  # Route components
│   │   ├── HomePage.tsx
│   │   ├── ScanPage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── SubscriptionPage.tsx
│   │   └── ProfilePage.tsx
│   ├── store/                  # Global state management
│   │   ├── index.ts
│   │   └── rootReducer.ts
│   ├── types/                  # Shared TypeScript types
│   │   ├── database.types.ts   # Generated from Supabase
│   │   └── global.types.ts
│   ├── App.tsx
│   └── index.tsx
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── analyze-image/
│   │   │   └── index.ts        # OpenAI Vision API integration
│   │   ├── create-scan/
│   │   │   └── index.ts        # Scan orchestration
│   │   ├── webhook-stripe/
│   │   │   └── index.ts        # Stripe webhook handler
│   │   └── _shared/
│   │       ├── cors.ts
│   │       └── supabase.ts
│   ├── migrations/             # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_add_subscriptions.sql
│   └── config.toml             # Supabase configuration
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Structure Rationale

- **components/:** Domain-specific UI components grouped by feature area (camera, scan, auth). Shared components in `shared/` subfolder.
- **features/:** Feature-based architecture following [Bulletproof React](https://medium.com/@deltaromeoyanki/mastering-react-folder-structures-your-ultimate-guide-to-scalable-and-maintainable-projects-5e200d630025) pattern. Each feature contains its own API layer, hooks, state, and types. Scales well as complexity grows.
- **services/:** External integrations that can be swapped/mocked (Supabase client, offline queue, storage). Single responsibility principle.
- **supabase/functions/:** Edge Functions deployed to Deno runtime. Co-locate related logic; use `_shared/` for common utilities.
- **PWA files in public/:** Service worker and manifest at root level per PWA standards. Build tools generate optimized service worker.

## Architectural Patterns

### Pattern 1: Offline-First Image Upload with Queue

**What:** Images are captured/selected, stored locally in IndexedDB, and uploaded when connectivity allows. Background Sync API retries automatically.

**When to use:** Essential for PWAs where users might have intermittent connectivity (e.g., parking garages, rural areas).

**Trade-offs:**
- **Pros:** Better UX, no lost uploads, works offline
- **Cons:** Additional complexity, storage management, sync conflicts possible

**Example:**
```typescript
// services/offline-queue.ts
import Dexie, { Table } from 'dexie';

interface QueuedUpload {
  id?: number;
  imageBlob: Blob;
  userId: string;
  timestamp: number;
  status: 'pending' | 'uploading' | 'failed';
  retryCount: number;
}

class OfflineQueue extends Dexie {
  uploads!: Table<QueuedUpload>;

  constructor() {
    super('DashDecoderQueue');
    this.version(1).stores({
      uploads: '++id, userId, status, timestamp'
    });
  }

  async addToQueue(imageBlob: Blob, userId: string) {
    await this.uploads.add({
      imageBlob,
      userId,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    });

    // Trigger Background Sync if available
    if ('serviceWorker' in navigator && 'sync' in registration) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('upload-images');
    } else {
      // Fallback: immediate upload attempt
      this.processQueue();
    }
  }

  async processQueue() {
    const pending = await this.uploads
      .where('status').equals('pending')
      .toArray();

    for (const item of pending) {
      try {
        await this.uploadImage(item);
      } catch (error) {
        console.error('Upload failed:', error);
        await this.uploads.update(item.id!, {
          retryCount: item.retryCount + 1,
          status: item.retryCount >= 3 ? 'failed' : 'pending'
        });
      }
    }
  }

  private async uploadImage(item: QueuedUpload) {
    // Mark as uploading
    await this.uploads.update(item.id!, { status: 'uploading' });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dashboard-images')
      .upload(`${item.userId}/${item.id}.jpg`, item.imageBlob);

    if (error) throw error;

    // Remove from queue on success
    await this.uploads.delete(item.id!);
  }
}

export const offlineQueue = new OfflineQueue();
```

**References:**
- [Building An Offline-Friendly Image Upload System — Smashing Magazine](https://www.smashingmagazine.com/2025/04/building-offline-friendly-image-upload-system/)
- [How to Build Offline-first Progressive Web Apps (PWAs) with React & Redux](https://medium.com/pgs-software/how-to-build-offline-first-progressive-web-apps-pwas-with-react-redux-7d58553e70)

### Pattern 2: Edge Function AI Orchestration

**What:** Supabase Edge Function acts as orchestration layer, coordinating between OpenAI Vision API, database writes, and response formatting. Keeps API keys secure server-side.

**When to use:** When you need to integrate multiple services, handle authentication, and process AI responses before returning to client.

**Trade-offs:**
- **Pros:** Secure (keys never exposed), flexible processing, globally distributed edge compute
- **Cons:** Cold starts possible, limited execution time, debugging harder than local

**Example:**
```typescript
// supabase/functions/analyze-image/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check subscription tier and scan limits
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, scans_used, scans_limit')
      .eq('user_id', user.id)
      .single();

    if (subscription && subscription.scans_used >= subscription.scans_limit) {
      return new Response(JSON.stringify({ error: 'Scan limit reached' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get image URL from request
    const { imageUrl } = await req.json();

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a vehicle diagnostic expert. Analyze dashboard warning lights and provide structured diagnostic information.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the warning light in this dashboard image. Provide: 1) warning light name, 2) likely vehicle make/model if visible, 3) severity (low/medium/high/critical), 4) brief description.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500
      })
    });

    const aiResult = await openaiResponse.json();
    const analysisData = JSON.parse(aiResult.choices[0].message.content);

    // Store scan result in database
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        warning_light: analysisData.warning_light,
        vehicle_guess: analysisData.vehicle,
        severity: analysisData.severity,
        description: analysisData.description,
        ai_response: aiResult
      })
      .select()
      .single();

    if (scanError) throw scanError;

    // Update scan count
    if (subscription) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ scans_used: subscription.scans_used + 1 })
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ scan, analysis: analysisData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

**References:**
- [Running AI Models | Supabase Docs](https://supabase.com/docs/guides/functions/ai-models)
- [GPT-4o Vision Guide: Building with OpenAI's Image API](https://getstream.io/blog/gpt-4o-vision-guide/)

### Pattern 3: Event-Driven Subscription Management

**What:** Stripe webhooks trigger Edge Functions that update subscription state in database. No polling required; immediate state updates.

**When to use:** For all subscription lifecycle events (created, canceled, payment failed, trial ending). Essential for reliable billing.

**Trade-offs:**
- **Pros:** Real-time updates, reliable, Stripe handles retry logic
- **Cons:** Requires webhook endpoint security, idempotency handling needed

**Example:**
```typescript
// supabase/functions/webhook-stripe/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16'
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Create or update subscription record
      await supabase.from('subscriptions').upsert({
        user_id: session.metadata?.user_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        tier: 'premium',
        status: 'active',
        scans_limit: 999999,
        scans_used: 0,
        current_period_end: new Date(session.expires_at * 1000).toISOString()
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          scans_limit: 2 // Revert to free tier
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      // Mark subscription as past_due
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**References:**
- [Build a subscriptions integration | Stripe Documentation](https://docs.stripe.com/billing/subscriptions/build-subscriptions)
- [Design a subscriptions integration | Stripe Documentation](https://docs.stripe.com/billing/subscriptions/design-an-integration)

## Data Flow

### Request Flow: Image Upload → AI Analysis → Result Display

```
[User captures image with camera]
         ↓
[Image stored in IndexedDB queue] ← Offline resilience
         ↓
[Check online status]
         ↓ (if online)
[Compress image using Canvas API] ← Reduce bandwidth
         ↓
[Upload to Supabase Storage bucket]
         ↓
[Receive public image URL]
         ↓
[Call Edge Function: create-scan]
         ↓
    ┌────┴────────────────────────────────┐
    │ Edge Function Orchestration          │
    │  1. Verify JWT token                 │
    │  2. Check subscription tier/limits   │
    │  3. Call analyze-image function      │
    │     ↓                                 │
    │  [Call OpenAI Vision API]            │
    │     ↓                                 │
    │  [Parse structured JSON response]    │
    │     ↓                                 │
    │  4. Store scan in database           │
    │  5. Update scan count                │
    │  6. Fetch affiliate links (if needed)│
    └────┬─────────────────────────────────┘
         ↓
[Return result to client]
         ↓
[Display diagnosis with severity, steps, parts links]
         ↓
[Cache result in IndexedDB for offline viewing]
```

### State Management Flow

```
[User Action: Upload Image]
         ↓
[Dispatch Redux Action: uploadScanRequest]
         ↓
[Redux Thunk Middleware]
         ↓
    ┌───┴─────────────────────────┐
    │ Async operations:            │
    │  - Upload to Storage         │
    │  - Call Edge Function        │
    │  - Handle errors/retries     │
    └───┬─────────────────────────┘
        ↓
[Dispatch Action: uploadScanSuccess or uploadScanFailure]
         ↓
[Reducer updates state]
         ↓
[Components re-render via useSelector]
         ↓
[UI reflects new state (loading → success → result display)]
```

### Authentication Flow

```
[User lands on app]
         ↓
[Check Supabase session from localStorage]
         ↓
    ┌───┴──────────────────────────┐
    │ Session exists?              │
    ├─ YES ─┬─ NO ───┐             │
    │       │        │             │
    └───────┴────────┴─────────────┘
            ↓        ↓
    [Load user]  [Show login]
    [profile]        ↓
            ↓    [User signs in]
            ↓        ↓
            ↓    [Supabase Auth]
            ↓        ↓
            ↓    [JWT stored in localStorage]
            ↓        ↓
            └────────┴─────────→ [Protected routes accessible]
                                        ↓
                              [All API calls include JWT in Authorization header]
```

### Subscription Check Flow

```
[User attempts scan]
         ↓
[Frontend checks subscription state from Redux]
         ↓
    ┌───┴──────────────────────────────┐
    │ Free tier with scans remaining?  │
    │        OR                         │
    │ Active premium subscription?     │
    └───┬──────────────────────────────┘
        ↓
    ┌───┴────────┐
    │  YES   NO  │
    └───┬────┬───┘
        ↓    ↓
   [Allow] [Block & show upgrade modal]
    scan       ↓
               [Redirect to Stripe Checkout]
                       ↓
               [Stripe handles payment]
                       ↓
               [Webhook updates DB]
                       ↓
               [Frontend polls subscription status]
                       ↓
               [User can now scan]
```

### Key Data Flows

1. **Image Capture → Upload → Analysis:** User-initiated flow where camera access → local storage → cloud upload → AI processing happens in sequence. Each step has error handling and offline fallbacks.

2. **Subscription Lifecycle:** Event-driven flow where Stripe webhooks push updates to Edge Functions, which update database state. Frontend polls/subscribes to changes.

3. **Offline Sync:** Bidirectional flow where user actions queue locally when offline, Background Sync API retries uploads, and results sync back down when reconnected.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Current architecture sufficient. Single Supabase instance, free OpenAI tier. Focus on product-market fit. Monitor database query performance. |
| **1k-10k users** | Add database indexes on frequently queried columns (user_id, created_at). Enable Supabase connection pooling. Consider CDN for cached images. Implement rate limiting on Edge Functions. |
| **10k-100k users** | Upgrade Supabase to Pro tier for better connection limits. Implement Redis caching layer for subscription status checks. Use Stripe webhooks queue for idempotency. Add monitoring (Sentry, LogRocket). Consider image processing queue (BullMQ) to handle spikes. |
| **100k+ users** | Separate read replicas for analytics queries. Implement database sharding by user ID if needed. Consider moving to dedicated Stripe account. Add CDN caching for API responses. Implement circuit breakers for external API calls. Consider microservices for affiliate link fetching. |

### Scaling Priorities

1. **First bottleneck: Database connections**
   - **Symptom:** "too many connections" errors from Supabase
   - **Fix:** Enable connection pooling (PgBouncer), optimize queries, add indexes
   - **Prevention:** Monitor connection count, implement query batching

2. **Second bottleneck: OpenAI API rate limits**
   - **Symptom:** 429 errors from OpenAI, slow response times during peaks
   - **Fix:** Implement request queue with exponential backoff, cache common results (same warning light), consider OpenAI Batch API for lower priority requests
   - **Prevention:** Monitor API usage, implement circuit breaker pattern

3. **Third bottleneck: Storage costs**
   - **Symptom:** High Supabase Storage bills, slow image loading
   - **Fix:** Implement image compression before upload, add retention policy (delete old images), use CDN caching, consider cheaper storage for old scans
   - **Prevention:** Set up usage alerts, implement tiered storage

## Anti-Patterns

### Anti-Pattern 1: Calling OpenAI API Directly from Frontend

**What people do:** Make OpenAI API calls directly from React components with API key in environment variables.

**Why it's wrong:**
- Exposes API keys in client bundle (security risk)
- No rate limiting or cost controls
- Can't implement proper error handling or retries
- Can't audit usage per user
- CORS issues with OpenAI API

**Do this instead:** Always proxy AI API calls through Edge Functions. Keep API keys server-side. Implement authentication, rate limiting, and usage tracking at the edge function level.

```typescript
// ❌ BAD: Direct API call from frontend
const analyzeImage = async (imageUrl: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: { 'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}` }, // Exposed!
    // ...
  });
};

// ✅ GOOD: Call Edge Function which handles OpenAI internally
const analyzeImage = async (imageUrl: string) => {
  const { data, error } = await supabase.functions.invoke('analyze-image', {
    body: { imageUrl }
  });
};
```

### Anti-Pattern 2: Storing Uncompressed Images

**What people do:** Upload raw camera images (often 3-8MB) directly to storage without compression.

**Why it's wrong:**
- Expensive storage costs (images accumulate quickly)
- Slow upload times (especially on mobile networks)
- Excessive bandwidth usage
- Poor user experience on slow connections
- Storage quotas hit quickly

**Do this instead:** Compress images client-side before upload using Canvas API. Target 500KB-1MB for sufficient quality while reducing costs 80-90%.

```typescript
// ✅ GOOD: Compress before upload
import { compressImage } from '@/utils/imageCompression';

const uploadImage = async (file: File) => {
  // Compress to max 1MB, 0.8 quality
  const compressed = await compressImage(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.8
  });

  const { data, error } = await supabase.storage
    .from('dashboard-images')
    .upload(`${userId}/${Date.now()}.jpg`, compressed);
};
```

### Anti-Pattern 3: Blocking UI on Upload/Analysis

**What people do:** Show a spinner and block all UI while waiting for AI analysis to complete (can take 5-15 seconds).

**Why it's wrong:**
- Poor perceived performance
- User can't navigate away or do other tasks
- Increased bounce rate
- App feels unresponsive
- No visibility into progress

**Do this instead:** Use optimistic UI updates, show progress indicators, allow background processing, and navigate user to results page when ready.

```typescript
// ✅ GOOD: Non-blocking upload with progress
const handleScan = async (image: Blob) => {
  // Immediately navigate to results page in loading state
  navigate(`/scan/${scanId}`, {
    state: { status: 'uploading', progress: 0 }
  });

  // Upload in background
  offlineQueue.addToQueue(image, userId);

  // Results page subscribes to scan updates
  // User can navigate elsewhere and check back later
};
```

### Anti-Pattern 4: Not Implementing Offline Support

**What people do:** Build standard SPA without service worker, app breaks completely when offline.

**Why it's wrong:**
- PWA without offline capability isn't truly a PWA
- Users lose access in parking garages, elevators, rural areas
- Lost scans when connectivity drops mid-upload
- Competitive disadvantage vs native apps
- Poor App Store reviews ("doesn't work offline")

**Do this instead:** Implement service worker with cache-first strategy for assets, queue-and-sync for uploads, and show offline indicator.

```typescript
// ✅ GOOD: Workbox-based offline support
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// API calls: Network first, fallback to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);

// Images: Cache first
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

// Background sync for queued uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-images') {
    event.waitUntil(processUploadQueue());
  }
});
```

### Anti-Pattern 5: Checking Subscription Status on Every Request

**What people do:** Query subscriptions table on every scan request to verify user's tier.

**Why it's wrong:**
- Unnecessary database load (subscriptions rarely change)
- Slower response times
- Increased Supabase costs
- Can hit connection limits faster
- Not using caching effectively

**Do this instead:** Cache subscription status in frontend Redux store, refresh on login and after subscription changes (via webhook). Use JWT claims for tier if possible.

```typescript
// ✅ GOOD: Cached subscription with selective refresh
const useCachedSubscription = () => {
  const subscription = useSelector(state => state.subscription);
  const dispatch = useDispatch();

  useEffect(() => {
    // Only fetch if not loaded or expired (24hr cache)
    const isStale = !subscription.lastFetched ||
      Date.now() - subscription.lastFetched > 24 * 60 * 60 * 1000;

    if (isStale) {
      dispatch(fetchSubscription());
    }
  }, []);

  // Realtime subscription to detect changes from webhooks
  useEffect(() => {
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'subscriptions' },
        (payload) => dispatch(updateSubscription(payload.new))
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return subscription;
};
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **OpenAI Vision API** | Edge Function → REST API | Use GPT-4o model. Structure responses with JSON mode. Implement retry logic with exponential backoff. Monitor token usage. |
| **Stripe** | Checkout (hosted) + Webhooks | Use Checkout for payment collection. Handle subscription lifecycle via webhooks to Edge Function. Implement idempotency keys. |
| **Supabase Auth** | Client SDK + JWT | Auth state managed via Supabase client. JWT passed in Authorization header to Edge Functions. RLS policies enforce user isolation. |
| **Supabase Storage** | Client SDK upload | Public bucket with RLS policies. Generate signed URLs for private images. Implement automatic cleanup for old images. |
| **Affiliate Networks** | Edge Function → REST API | Fetch on-demand during scan result display. Cache results. Consider background job for prefetching. Error handling critical (don't block scan results). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **React Components ↔ Redux Store** | Actions/Selectors | Components dispatch actions, read via useSelector. Keep business logic in thunks/sagas, not components. |
| **Frontend ↔ Supabase** | Supabase Client SDK | Authenticated requests include JWT automatically. Use RLS for security. Consider wrapping in API layer for testability. |
| **Edge Functions ↔ PostgreSQL** | Supabase Admin Client | Use service role key for elevated permissions. Bypass RLS when needed. Validate inputs (don't trust client). |
| **Service Worker ↔ IndexedDB** | Dexie.js wrapper | Queue management for offline uploads. Sync on Background Sync event. Handle conflicts carefully. |
| **Edge Function ↔ Edge Function** | HTTP requests via fetch | Rare, prefer single function handling full flow. Use shared utilities in `_shared/` folder. Consider security implications. |

## Build Order Implications

Based on component dependencies and architectural patterns, recommended build sequence:

### Phase 1: Foundation (Core architecture)
**Build first:** Supabase setup, authentication, database schema, basic PWA shell
**Why:** Everything depends on auth and database being functional. PWA manifest needed early for testing.
**Components:** Database migrations, RLS policies, Supabase client configuration, auth flows, service worker skeleton

### Phase 2: Core Flow (Image upload → analysis → display)
**Build second:** Camera capture, image upload with offline queue, Edge Function for AI analysis, results display
**Why:** This is the core value proposition. Proves feasibility before adding monetization.
**Components:** Camera component, offline queue manager, Supabase Storage integration, OpenAI Edge Function, result rendering

### Phase 3: Subscription & Limits (Monetization)
**Build third:** Stripe integration, scan limit enforcement, subscription management UI
**Why:** Requires core flow working first to understand what we're gating. Can validate demand before building billing.
**Components:** Stripe Checkout flow, webhook handler, subscription status checks, upgrade prompts

### Phase 4: Polish & Optimization (UX improvements)
**Build fourth:** Scan history, offline indicators, error handling, performance optimization
**Why:** Core functionality must work before optimizing. History is valuable but not MVP.
**Components:** History page, better loading states, error boundaries, image compression, analytics

### Dependency Graph

```
Database Schema & Auth
    ↓
Service Worker Setup
    ↓
Camera Capture → Image Upload Queue
    ↓
Supabase Storage Integration
    ↓
Edge Function (AI Analysis) ← Depends on auth working
    ↓
Results Display
    ↓
Scan Limits Check ← Can start here in parallel
    ↓
Stripe Integration
    ↓
Subscription Management
    ↓
History & Polish Features
```

**Critical path:** Database → Auth → Storage → Edge Function → AI Integration
**Can be parallel:** UI polish, history features, affiliate links after core flow works
**Defer to later:** Advanced features like vehicle confirmation, maintenance tracking

## Sources

### Architecture & PWA Patterns
- [Next-Gen PWAs: AI and ML Drive Personalized & Predictive Web Experiences](https://dev.to/vaib/next-gen-pwas-ai-and-ml-drive-personalized-predictive-web-experiences-2k34)
- [Building An Offline-Friendly Image Upload System — Smashing Magazine](https://www.smashingmagazine.com/2025/04/building-offline-friendly-image-upload-system/)
- [How to Build Offline-first Progressive Web Apps (PWAs) with React & Redux](https://medium.com/pgs-software/how-to-build-offline-first-progressive-web-apps-pwas-with-react-redux-7d58553e70)
- [Do PWAs Have Camera Access? Functions, Security, & Examples](https://profstep.com/blog/can-pwas-use-camera)
- [Mastering React Folder Structures: Your Ultimate Guide to Scalable and Maintainable Projects](https://medium.com/@deltaromeoyanki/mastering-react-folder-structures-your-ultimate-guide-to-scalable-and-maintainable-projects-5e200d630025)
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)

### Supabase & AI Integration
- [Building AI-Powered Apps with Supabase in 2025](https://scaleupally.io/blog/building-ai-app-with-supabase/)
- [Running AI Models | Supabase Docs](https://supabase.com/docs/guides/functions/ai-models)
- [AI & Vectors | Supabase Docs](https://supabase.com/docs/guides/ai)

### OpenAI Vision API
- [GPT-4o Vision Guide: Building with OpenAI's Image API](https://getstream.io/blog/gpt-4o-vision-guide/)
- [Complete Guide to GPT-4 Vision: Operation, Uses, and Integration](https://www.sales-hacking.com/en/post/gpt-vision)

### Stripe Integration
- [Build a subscriptions integration | Stripe Documentation](https://docs.stripe.com/billing/subscriptions/build-subscriptions)
- [Design a subscriptions integration | Stripe Documentation](https://docs.stripe.com/billing/subscriptions/design-an-integration)

### Service Workers & Offline
- [Offline-First PWAs: Service Worker Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)
- [Service workers that don't surprise you: deterministic caching for offline-first PWAs](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)

---
*Architecture research for: DashDecoder — AI-powered vehicle dashboard diagnostic PWA*
*Researched: 2026-02-04*
