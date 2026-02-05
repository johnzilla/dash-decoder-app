import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-6">
        <h1 className="text-2xl font-bold text-center">DashDecoder</h1>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-bold mb-4">
            Decode Your Dashboard
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Snap a photo of any warning light and get an instant AI-powered diagnosis
          </p>

          {/* Hero CTA button - big and prominent per CONTEXT.md */}
          <Button
            onClick={() => navigate('/scan')}
            size="lg"
            className="w-full max-w-xs h-16 text-xl font-semibold"
          >
            Scan Your Dashboard
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            No account required - try it free
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-sm text-muted-foreground">
        <p>Works with all OBD-II vehicles (1996+)</p>
      </footer>
    </div>
  );
}
