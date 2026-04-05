import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ScanProvider } from '@/context/ScanContext';
import { PrivacyBanner } from '@/components/PrivacyBanner';

// Lazy load routes for better performance
const Home = lazy(() => import('@/routes/home'));
const Scan = lazy(() => import('@/routes/scan'));
const Results = lazy(() => import('@/routes/results'));

// Loading fallback
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScanProvider>
        <div className="min-h-screen bg-background text-foreground pb-10">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </Suspense>
          <PrivacyBanner />
        </div>
      </ScanProvider>
    </BrowserRouter>
  );
}
