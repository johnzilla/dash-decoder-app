import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">DashDecoder</h1>
        <p className="text-muted-foreground mt-2">AI-powered dashboard warning light diagnosis</p>
        <Button className="mt-4">Get Started</Button>
      </main>
    </div>
  );
}
