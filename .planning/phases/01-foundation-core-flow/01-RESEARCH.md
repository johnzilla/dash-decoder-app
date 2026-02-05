# Phase 1: Foundation & Core Flow - Research

**Researched:** 2026-02-04
**Domain:** Progressive Web App (PWA) with Camera Access, Vision AI Integration, and Modern React Stack
**Confidence:** HIGH

## Summary

Phase 1 implements a photo-to-diagnosis journey for dashboard warning lights using a modern React PWA stack. The standard approach uses Vite + React + TypeScript with shadcn/ui components, vite-plugin-pwa for installability, and GPT-4o Vision API for AI analysis. Camera access works reliably in modern browsers via getUserMedia API with HTTPS requirement. The architecture is straightforward for a single-developer project: feature-based folder structure, Context API for state, and localStorage for vehicle persistence.

The research confirms all technical decisions are viable with mature tooling. Key findings: GPT-4o Vision provides the best balance of capability and cost ($2.50/M input tokens), iOS Safari has known PWA camera permission quirks requiring testing, and image quality validation should use canvas-based Laplacian blur detection. The stack is well-documented with HIGH confidence for implementation.

**Primary recommendation:** Use Vite + React 19 + TypeScript strict mode with vite-plugin-pwa for installability, shadcn/ui for UI components, GPT-4o Vision API for image analysis, and canvas-based validation for image quality checks before API submission.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 6.x (latest) | Build tool & dev server | Zero-config, fastest HMR, native ESM, official React template |
| React | 19.x | UI framework | Industry standard, shadcn/ui requires React 19 for latest features |
| TypeScript | 5.x | Type safety | Required for shadcn/ui, prevents runtime errors, better DX |
| vite-plugin-pwa | 1.2.0+ | PWA features | Zero-config service worker, manifest generation, installability |
| shadcn/ui | Latest | UI components | Copy-paste components, locked decision from user, Tailwind-based |
| Tailwind CSS | 4.x | Styling | Required for shadcn/ui, mobile-first utility framework |
| React Router | 7.x | Client routing | SPA routing, framework-agnostic, supports outlet pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.x | Form handling | Vehicle search, any user input forms |
| Zod | 3.x | Schema validation | Runtime validation + TS type inference |
| @hookform/resolvers | 3.x | RHF + Zod bridge | Integrates Zod schemas with React Hook Form |
| vite-plugin-mkcert | Latest | HTTPS localhost | Camera API requires HTTPS, even in dev |
| clsx | Latest | Conditional classes | Required by shadcn/ui cn() helper |
| tailwind-merge | Latest | Merge Tailwind classes | Required by shadcn/ui cn() helper |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GPT-4o Vision | Claude Sonnet 4 Vision | Claude: $3/$15 vs GPT-4o: $2.50/$10 per M tokens, similar capabilities |
| GPT-4o Vision | Google Vision AI | Google: More complex setup, less flexible for custom analysis |
| Context API | Redux Toolkit | Redux: Overkill for small app, adds boilerplate without benefit |
| Context API | Zustand | Zustand: Valid choice if state grows, but Context sufficient for Phase 1 |
| localStorage | IndexedDB | IndexedDB: Better for large datasets, but localStorage sufficient for vehicle data |
| React Router | TanStack Router | TanStack: More type-safe, but React Router more established |

**Installation:**
```bash
# Core setup
pnpm create vite@latest dash-decoder-app -- --template react-ts
cd dash-decoder-app
pnpm install

# PWA support
pnpm add -D vite-plugin-pwa

# UI framework (Tailwind + shadcn/ui)
pnpm add tailwindcss @tailwindcss/vite
pnpm add -D @types/node
pnpm dlx shadcn@latest init

# Routing
pnpm add react-router

# Forms & validation
pnpm add react-hook-form zod @hookform/resolvers

# HTTPS development
pnpm add -D vite-plugin-mkcert
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui components (auto-generated)
│   ├── camera/         # Camera capture components
│   ├── diagnosis/      # Results display components
│   └── vehicle/        # Vehicle confirmation components
├── features/           # Feature-based organization
│   ├── scan/          # Scan flow logic
│   ├── vehicle/       # Vehicle identification
│   └── diagnosis/     # Diagnosis display
├── lib/               # Utilities and helpers
│   ├── api/          # API clients (OpenAI, vehicle data)
│   ├── validation/   # Image quality validation
│   └── utils.ts      # cn() helper and utilities
├── hooks/            # Custom React hooks
│   ├── useCamera.ts  # Camera access hook
│   ├── useStorage.ts # localStorage wrapper
│   └── useVision.ts  # Vision API integration
├── types/            # TypeScript types
│   ├── diagnosis.ts  # Diagnosis data structures
│   ├── vehicle.ts    # Vehicle types
│   └── api.ts        # API response types
├── routes/           # React Router pages
│   ├── home.tsx      # Landing with scan button
│   ├── scan.tsx      # Camera capture flow
│   └── results.tsx   # Diagnosis results
└── App.tsx           # Root component with routing
```

### Pattern 1: Feature-First Organization
**What:** Group related files by feature/domain, not by technical type
**When to use:** Default for all new features in Phase 1
**Example:**
```typescript
// Good: Feature-first
src/features/scan/
  ├── components/
  │   ├── ScanButton.tsx
  │   └── CameraPreview.tsx
  ├── hooks/
  │   └── useScanFlow.ts
  └── index.ts

// Avoid: Type-first (outdated 2015 pattern)
src/
  ├── components/ScanButton.tsx
  ├── hooks/useScanFlow.ts
  └── services/scanService.ts
```

### Pattern 2: Camera Access with getUserMedia
**What:** Access device camera using MediaDevices API with proper error handling
**When to use:** For photo capture functionality (CAPT-01)
**Example:**
```typescript
// Source: MDN Web API documentation + React PWA best practices 2026
import { useRef, useState, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Request rear camera on mobile devices
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Rear camera preferred
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  }, [stream]);

  return { videoRef, startCamera, capturePhoto, stopCamera, error };
}
```

### Pattern 3: Image Quality Validation with Canvas
**What:** Client-side blur and brightness detection before API submission
**When to use:** Before sending images to Vision API (CAPT-02)
**Example:**
```typescript
// Source: Canvas-based blur detection (Revolut Tech Medium article)
export interface ImageQualityResult {
  isValid: boolean;
  blurScore: number;
  brightness: number;
  issues: string[];
}

export async function validateImageQuality(
  imageDataUrl: string
): Promise<ImageQualityResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Laplacian blur detection
      const blurScore = calculateLaplacianVariance(imageData);
      const brightness = calculateBrightness(imageData);

      const issues: string[] = [];
      if (blurScore < 100) issues.push('Image is too blurry');
      if (brightness < 40) issues.push('Image is too dark');
      if (brightness > 240) issues.push('Image is too bright');

      resolve({
        isValid: issues.length === 0,
        blurScore,
        brightness,
        issues
      });
    };
    img.src = imageDataUrl;
  });
}

function calculateLaplacianVariance(imageData: ImageData): number {
  // Simplified Laplacian operator for blur detection
  const data = imageData.data;
  const width = imageData.width;
  let sum = 0;
  let count = 0;

  for (let y = 1; y < imageData.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const laplacian = Math.abs(
        -data[idx] +
        data[idx - 4] + data[idx + 4] +
        data[idx - width * 4] + data[idx + width * 4]
      );
      sum += laplacian;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Average RGB values
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return sum / (data.length / 4);
}
```

### Pattern 4: Vision API Integration with GPT-4o
**What:** Send validated images to OpenAI Vision API for analysis
**When to use:** After image quality validation passes (AI-01, AI-02)
**Example:**
```typescript
// Source: OpenAI Vision API documentation 2026
export interface VisionAnalysisResult {
  warningLight: {
    name: string;
    code?: string;
    confidence: number;
  };
  vehicle: {
    make?: string;
    model?: string;
    year?: number;
    confidence: number;
  };
  rawResponse: string;
}

export async function analyzeWarningLight(
  imageDataUrl: string
): Promise<VisionAnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive diagnostic assistant. Analyze dashboard warning lights and identify vehicle details from dashboard appearance.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify the warning light shown in this dashboard photo. Provide: 1) Warning light name, 2) OBD-II code if visible, 3) Your confidence level. Also guess the vehicle make, model, and year from dashboard styling if possible.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high' // Use high detail for better accuracy
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1 // Low temperature for consistent diagnostic output
    })
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse structured response (you may want to use Zod schema validation)
  return parseVisionResponse(content);
}
```

### Pattern 5: PWA Manifest Configuration
**What:** Configure web app manifest for installability
**When to use:** Initial project setup (PWA-02)
**Example:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(), // HTTPS for camera access in development
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'DashDecoder',
        short_name: 'DashDecoder',
        description: 'AI-powered dashboard warning light diagnosis',
        theme_color: '#2563EB', // Blue accent from landing page
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // For Android adaptive icons
          }
        ]
      },
      devOptions: {
        enabled: true // Test PWA features in development
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
            handler: 'NetworkOnly', // Never cache API requests
            options: {
              cacheName: 'openai-api',
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Pattern 6: Vehicle Data Persistence with localStorage
**What:** Remember user's vehicle across sessions to avoid repeated confirmation
**When to use:** After vehicle confirmation (AI-03 requirement)
**Example:**
```typescript
// hooks/useStorage.ts
export interface StoredVehicle {
  make: string;
  model: string;
  year: number;
  timestamp: number;
}

export function useVehicleStorage() {
  const getVehicle = (): StoredVehicle | null => {
    try {
      const stored = localStorage.getItem('dash-decoder-vehicle');
      if (!stored) return null;

      const vehicle: StoredVehicle = JSON.parse(stored);

      // Expire after 90 days
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      if (vehicle.timestamp < ninetyDaysAgo) {
        localStorage.removeItem('dash-decoder-vehicle');
        return null;
      }

      return vehicle;
    } catch {
      return null;
    }
  };

  const saveVehicle = (make: string, model: string, year: number) => {
    const vehicle: StoredVehicle = {
      make,
      model,
      year,
      timestamp: Date.now()
    };
    localStorage.setItem('dash-decoder-vehicle', JSON.stringify(vehicle));
  };

  const clearVehicle = () => {
    localStorage.removeItem('dash-decoder-vehicle');
  };

  return { getVehicle, saveVehicle, clearVehicle };
}
```

### Anti-Patterns to Avoid
- **Declaring state as regular variables:** Always use useState/useReducer/useContext, never let state = value
- **Missing dependencies in useEffect/useCallback:** Always include all dependencies to avoid stale closures
- **Array indexes as keys:** Use stable unique IDs for list items to avoid re-render bugs
- **Inline objects/arrays as props:** Creates new references on every render, breaks memoization
- **Everything in one Context:** Split contexts by concern (ScanContext, VehicleContext, DiagnosisContext)
- **Type-first folder structure:** Use feature-first organization for better code locality
- **Fetching in useEffect without cleanup:** Always return cleanup function to prevent race conditions

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image blur detection | Custom convolution algorithm | Canvas Laplacian variance method | Well-tested, 300+ threshold standard, handles edge cases |
| Form validation | Manual field validation | React Hook Form + Zod | Type-safe, runtime validation, handles arrays/nested objects |
| PWA service worker | Custom service worker | vite-plugin-pwa | Handles precaching, updates, offline fallback automatically |
| Tailwind class merging | String concatenation | clsx + tailwind-merge | Prevents class conflicts, required by shadcn/ui |
| Camera permission handling | Custom promise wrapper | MediaDevices API directly | Browsers handle permission UI, just catch errors |
| HTTPS certificates | Manual cert generation | vite-plugin-mkcert | Auto-generates trusted local CA, team-friendly |
| Routing state management | URL string parsing | React Router loader/params | Type-safe, handles edge cases, server-side ready |

**Key insight:** This stack is mature (2023-2026) with excellent tooling. Don't rebuild what the ecosystem provides. Focus effort on the unique value: AI diagnosis accuracy and UX flow.

## Common Pitfalls

### Pitfall 1: iOS Safari Camera Permission Quirks
**What goes wrong:** Camera permissions are not persistent in PWA mode on iOS, re-prompting on every page load or URL hash change
**Why it happens:** iOS WebKit security model treats installed PWAs differently than Safari tabs, doesn't persist media permissions
**How to avoid:**
- Test camera flow thoroughly on iOS Safari AND as installed PWA during implementation
- Don't rely on hash routing (`#/scan`) — use full path routing to minimize permission re-prompts
- Consider fallback to file input (`<input type="file" accept="image/*" capture="environment">`) for iOS if getUserMedia fails
- Document in USER.md: "For best experience on iOS, use in Safari browser instead of installing to home screen"
**Warning signs:** Users on iOS report being asked for camera permission repeatedly

### Pitfall 2: Vision API Cost Runaway
**What goes wrong:** Unexpected high API costs from large images or too many retries
**Why it happens:** High-detail images cost 765+ tokens, failed validation retries compound costs
**How to avoid:**
- Validate image quality client-side BEFORE Vision API call (blur/brightness checks)
- Resize images to max 1920x1080 before sending to API
- Use `detail: 'high'` sparingly — only when AI confidence is low on first attempt
- Set rate limiting on API calls (max 1 request per 3 seconds per user)
- Monitor API usage in OpenAI dashboard weekly during beta
**Warning signs:** Daily API costs exceed $5 with < 100 users

### Pitfall 3: HTTPS Requirement Not Met in Development
**What goes wrong:** Camera API returns "NotAllowedError" or "NotFoundError" even with permission
**Why it happens:** getUserMedia requires HTTPS even on localhost (security policy), HTTP fails silently
**How to avoid:**
- Use vite-plugin-mkcert from day 1 of development
- Verify `https://localhost:5173` in browser address bar, not `http://`
- Add mkcert to setup instructions in README
- Test on mobile devices using HTTPS tunnel (ngrok) for real device testing
**Warning signs:** Camera works on production but fails on teammate's local setup

### Pitfall 4: Service Worker Caching API Responses
**What goes wrong:** Users see stale diagnosis results from cached API responses
**Why it happens:** Default Workbox caching strategies cache all fetch requests including API calls
**How to avoid:**
- Configure Workbox runtimeCaching with NetworkOnly for OpenAI API URLs
- Never cache requests to `api.openai.com` or vehicle database APIs
- Only precache static assets (JS/CSS/HTML/images)
- Test in DevTools Application > Service Workers to verify cache behavior
**Warning signs:** Users report seeing old diagnosis results after re-scanning same light

### Pitfall 5: Image Quality Validation False Positives
**What goes wrong:** Valid dashboard photos rejected as "too blurry" or "too dark"
**Why it happens:** Fixed thresholds don't account for all lighting conditions and dashboard styles
**How to avoid:**
- Start with lenient thresholds during beta (blur < 80, brightness 30-250)
- Log all rejections with metadata (blur score, brightness, user agent) to tune thresholds
- Provide "Submit Anyway" button in validation error state for edge cases
- Test with 20+ different vehicle makes/years in various lighting (garage, night, direct sun)
**Warning signs:** > 20% validation rejection rate in production logs

### Pitfall 6: Dependency Array Omissions
**What goes wrong:** Stale closures cause bugs where state updates don't trigger expected behavior
**Why it happens:** React ESLint rule disabled or ignored, developers remove deps to "fix" re-render issues
**How to avoid:**
- Enable `react-hooks/exhaustive-deps` ESLint rule with error level (not warning)
- Never disable the rule — fix the root cause (useCallback, useMemo, or state refactor)
- Review all useEffect/useCallback/useMemo during PR for correct deps
- Use TypeScript strict mode to catch some closure issues at compile time
**Warning signs:** Intermittent bugs where clicking button uses old state value

### Pitfall 7: shadcn/ui Import Path Misconfiguration
**What goes wrong:** Component imports fail with "Cannot find module '@/components/ui/button'"
**Why it happens:** Path alias not configured in both tsconfig.json AND vite.config.ts
**How to avoid:**
- Follow shadcn/ui installation guide exactly — both configs must match
- Verify `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }` in tsconfig
- Verify `resolve.alias` in vite.config.ts: `'@': path.resolve(__dirname, './src')`
- Run `pnpm dlx shadcn@latest add button` to test — should succeed without errors
**Warning signs:** TypeScript errors on @/ imports, components not rendering

## Code Examples

Verified patterns from official sources:

### React Router 7 SPA Setup
```typescript
// Source: React Router official documentation 2026
import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './routes/home';
import { Scan } from './routes/scan';
import { Results } from './routes/results';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/results/:scanId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Vehicle Search with React Hook Form + Zod
```typescript
// Source: React Hook Form + Zod integration guide 2026
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number()
    .min(1996, 'Only OBD-II vehicles (1996+) supported')
    .max(new Date().getFullYear() + 1)
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export function VehicleSearchForm({ onSubmit }: { onSubmit: (data: VehicleFormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('make')} placeholder="Make" />
      {errors.make && <span>{errors.make.message}</span>}

      <input {...register('model')} placeholder="Model" />
      {errors.model && <span>{errors.model.message}</span>}

      <input {...register('year', { valueAsNumber: true })} type="number" placeholder="Year" />
      {errors.year && <span>{errors.year.message}</span>}

      <button type="submit">Confirm Vehicle</button>
    </form>
  );
}
```

### Environment Variables Type Safety
```typescript
// Source: Vite environment variables documentation 2026
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Usage in components:
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
// TypeScript will enforce string type and show autocomplete
```

### Lazy Loading Routes for Performance
```typescript
// Source: React Suspense documentation 2026
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

const Home = lazy(() => import('./routes/home'));
const Scan = lazy(() => import('./routes/scan'));
const Results = lazy(() => import('./routes/results'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/results/:scanId" element={<Results />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### TypeScript Strict Configuration
```json
// Source: TypeScript strict mode guide for React 2026
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting - Enable ALL strict checks */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2021-2023 | 10-20x faster dev server, native ESM, better DX |
| Redux for all state | Context API + Zustand | 2023-2026 | Simpler for small apps, less boilerplate |
| npm packages for components | shadcn/ui copy-paste | 2023-2026 | Full component ownership, no dependency bloat |
| Separate manifest.json | vite-plugin-pwa manifest | 2022-2026 | Auto-inject manifest, easier updates |
| Custom service worker | Workbox via plugin | 2020-2026 | Zero-config precaching, handles updates |
| Manual HTTPS certs | vite-plugin-mkcert | 2021-2026 | Auto-trusted local CA, team-friendly |
| Tailwind v3 | Tailwind v4 | 2025-2026 | CSS-first config, faster builds, smaller bundles |
| React 18 | React 19 | 2024-2025 | Better compiler, improved Suspense, Actions API |
| Class components | Function components + hooks | 2019-2026 | Standard pattern, better composition |
| PropTypes | TypeScript | 2020-2026 | Compile-time checks, editor support |

**Deprecated/outdated:**
- `create-react-app`: Officially deprecated 2023, use Vite
- `componentDidMount`: Use useEffect instead
- `defaultProps`: Use ES6 default parameters
- Chrome-only PWA support: All major browsers support PWA as of 2025-2026
- Service worker required for install prompt: Manifest-only install added 2025

## Open Questions

Things that couldn't be fully resolved:

1. **Vehicle Database API Selection**
   - What we know: NHTSA vPIC is free with no API key, Back4app has 2009-2022 data, CarAPI has 1940-present
   - What's unclear: Which has best search UX for "type-to-search" and best dashboard style identification support
   - Recommendation: Start with NHTSA vPIC (free, government-backed, no quota), add CarAPI if coverage gaps found during beta testing

2. **iOS Safari PWA Camera Persistence**
   - What we know: Confirmed issue in WebKit bugs 215884 and 185448, permissions don't persist in standalone mode
   - What's unclear: Whether iOS 18+ has improved this behavior (search results don't confirm latest iOS version fixes)
   - Recommendation: Plan for file input fallback on iOS, test thoroughly with iOS 17+ devices during implementation, document workaround in user guide

3. **Vision API Accuracy Threshold**
   - What we know: GPT-4o Vision can identify objects, text, and contextual details; fine-tuning available
   - What's unclear: Real-world accuracy for dashboard warning lights across 20+ vehicle makes without fine-tuning
   - Recommendation: Track accuracy during beta, plan for fine-tuning if baseline accuracy < 75% (STATE.md notes this concern)

4. **Image Quality Threshold Values**
   - What we know: Laplacian variance method is standard, typical blur threshold ~100-300
   - What's unclear: Optimal thresholds for dashboard photos specifically (different from general photography)
   - Recommendation: Start lenient (blur < 80, brightness 30-250), log all validations during beta, tune based on real user data

5. **Dark Mode Implementation Timing**
   - What we know: User wants auto dark/light mode (system preference), shadcn/ui supports dark mode out of box
   - What's unclear: Whether to implement in Phase 1 or defer to Phase 2 polish
   - Recommendation: Implement in Phase 1 (low effort with shadcn/ui, better UX for night-time scanning use case)

## Sources

### Primary (HIGH confidence)
- Vite official documentation (https://vite.dev) - Build tool configuration and plugin usage
- shadcn/ui Vite installation guide (https://ui.shadcn.com/docs/installation/vite) - Component setup verified
- Vite PWA plugin documentation (https://vite-pwa-org.netlify.app) - PWA configuration patterns
- OpenAI Vision API pricing (https://platform.openai.com/docs/pricing) - Cost structure verified January 2026
- React Router v7 documentation (https://reactrouter.com/how-to/spa) - SPA routing patterns
- React Hook Form + Zod guide (https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Form validation integration
- TypeScript strict mode guide (https://oneuptime.com/blog/post/2026-01-15-strict-typescript-configuration-react/view) - tsconfig best practices
- MDN getUserMedia API (https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - Camera access specification

### Secondary (MEDIUM confidence)
- Canvas-based blur detection (https://medium.com/revolut/canvas-based-javascript-blur-detection-b92ab1075acf) - Laplacian variance method verified by multiple sources
- PWA installability requirements (https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) - MDN verified, 2026 updates confirmed
- React folder structure 2026 (https://www.robinwieruch.de/react-folder-structure/) - Feature-first pattern consensus
- Mobile-first breakpoints 2026 (https://www.browserstack.com/guide/responsive-design-breakpoints) - Standard breakpoint values
- Vite environment variables (https://vite.dev/guide/env-and-mode) - Official documentation for VITE_ prefix

### Tertiary (LOW confidence - mark for validation)
- iOS Safari camera quirks - Multiple GitHub issues and knowledge base articles confirm (WebKit bugs 215884, 185448), but no official Apple documentation on fixes in iOS 18+
- Vehicle database APIs - Comparison based on feature pages, not hands-on testing
- Vision API accuracy for warning lights - No specific benchmarks found for this use case, general object detection accuracy documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation, versions confirmed current as of Feb 2026
- Architecture: HIGH - Patterns verified with official React, Vite, TypeScript documentation and recent 2026 guides
- Pitfalls: MEDIUM-HIGH - iOS Safari camera issue confirmed by multiple sources but no hands-on verification; other pitfalls verified by community best practices and official warnings
- Vision API capabilities: MEDIUM - GPT-4o Vision capabilities verified, but dashboard warning light accuracy not specifically benchmarked
- Vehicle database: MEDIUM - Free options identified, but hands-on comparison not performed

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable ecosystem, but AI APIs evolve quickly)
**Next review triggers:**
- Vite major version release (6.x → 7.x)
- React Router major version release (7.x → 8.x)
- OpenAI Vision API pricing changes
- iOS 18+ confirmed PWA camera permission fixes
