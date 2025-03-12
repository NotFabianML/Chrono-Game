import RaceSimulator from '@/components/race-simulator';
import RaceSettings from '@/components/race-settings';

export default function RacePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-mono text-center mb-8 text-foreground/80">
          Timing Practice
        </h1>
        <RaceSettings />
        <RaceSimulator />
      </div>
    </main>
  );
}