import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Timer } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-mono text-center mb-8 text-foreground/80">
          Timing Practice
        </h1>
        <Card className="max-w-md mx-auto p-6 bg-background border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <Timer className="w-5 h-5 text-foreground/70" />
            <h2 className="text-xl font-mono text-foreground/70">Race Settings</h2>
          </div>
          <Link href="/race">
            <Button className="w-full bg-primary/10 hover:bg-primary/20">
              Start New Race
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}