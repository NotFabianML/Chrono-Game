'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Timer, Flag, Users } from 'lucide-react';
import type { RaceConfig } from './race-settings';

interface Cyclist {
  id: number;
  position: number; // Progreso: de 0 a 100. Inicialmente -10 para estar fuera de la pista.
  speed: number;
  startTime: number;
  finishTime?: number;
  lane: number; // Para horizontal: posición vertical aleatoria; para vertical: posición horizontal aleatoria.
}

const DEFAULT_CONFIG: RaceConfig = {
  cyclistCount: 15,
  minSpeed: 1,
  maxSpeed: 5,
  cyclistSize: 24,
  minNumber: 1,
  maxNumber: 100,
  orientation: 'horizontal',
};

export default function RaceSimulator() {
  const [cyclists, setCyclists] = useState<Cyclist[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [raceStartTime, setRaceStartTime] = useState(0);
  const [userTimes, setUserTimes] = useState<Record<number, number>>({});
  const [config, setConfig] = useState<RaceConfig>(DEFAULT_CONFIG);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent<RaceConfig>) => {
      setConfig(event.detail);
      generateCyclists(event.detail);
    };

    window.addEventListener('updateRaceConfig', handleConfigUpdate as EventListener);
    return () => {
      window.removeEventListener('updateRaceConfig', handleConfigUpdate as EventListener);
    };
  }, []);

  const generateUniqueNumbers = (count: number, min: number, max: number): number[] => {
    const range = max - min + 1;
    if (count > range) {
      console.warn("Cyclist count exceeds available unique numbers. Limiting to maximum available.");
      count = range;
    }
    const numbers = Array.from({ length: range }, (_, i) => i + min);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, count);
  };

  const generateCyclists = (raceConfig: RaceConfig = config) => {
    const uniqueNumbers = generateUniqueNumbers(raceConfig.cyclistCount, raceConfig.minNumber, raceConfig.maxNumber);
    const newCyclists: Cyclist[] = uniqueNumbers.map(num => ({
      id: num,
      // Si es horizontal, spawnean a la izquierda (-10%); si es vertical, spawnean por encima (-10% top)
      position: -10,
      speed: raceConfig.minSpeed + Math.random() * (raceConfig.maxSpeed - raceConfig.minSpeed),
      startTime: Math.random() * 2000,
      finishTime: undefined,
      // Para horizontal: lane es la posición vertical; para vertical: lane es la posición horizontal.
      lane: Math.random() * 80 + 10, // Valor entre 10% y 90%
    }));
    setCyclists(newCyclists);
  };

  const handleStartRace = () => {
    setIsRacing(true);
    setCountdown(3);
  };

  const handleResetRace = () => {
    generateCyclists();
    setIsRacing(false);
    setUserTimes({});
    setRaceStartTime(0);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    let percentComplete: number;
    if (config.orientation === 'vertical') {
      // Para vertical de arriba a abajo: se calcula el progreso usando la posición Y desde el top.
      percentComplete = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      percentComplete = ((e.clientX - rect.left) / rect.width) * 100;
    }
    const nearestCyclist = cyclists
      .filter(c => c.finishTime && !userTimes[c.id])
      .sort((a, b) => Math.abs(a.position - percentComplete) - Math.abs(b.position - percentComplete))[0];
    if (nearestCyclist) {
      recordTime(nearestCyclist.id);
    }
  };

  const recordTime = (cyclistId: number) => {
    if (!raceStartTime) return;
    const elapsedTime = (Date.now() - raceStartTime) / 1000;
    setUserTimes(prev => ({ ...prev, [cyclistId]: elapsedTime }));
  };

  useEffect(() => {
    if (countdown > 0 && isRacing) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && isRacing && raceStartTime === 0) {
      setRaceStartTime(Date.now());
    }
  }, [countdown, isRacing, raceStartTime]);

  useEffect(() => {
    if (isRacing && countdown === 0) {
      const interval = setInterval(() => {
        setCyclists(prevCyclists =>
          prevCyclists.map(cyclist => {
            const elapsed = Date.now() - raceStartTime;
            if (elapsed < cyclist.startTime || cyclist.finishTime) {
              return cyclist;
            }
            const newPosition = cyclist.position + cyclist.speed;
            const finished = newPosition >= 100;
            return {
              ...cyclist,
              position: finished ? 100 : newPosition,
              finishTime: finished ? Date.now() : undefined,
            };
          })
        );
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRacing, countdown, raceStartTime]);

  const allFinished = cyclists.every(c => c.finishTime);

  const sortedCyclists = [...cyclists].sort((a, b) => {
    if (!a.finishTime && !b.finishTime) return 0;
    if (!a.finishTime) return 1;
    if (!b.finishTime) return -1;
    return a.finishTime - b.finishTime;
  });

  // Ajusta las clases del contenedor de la pista según la orientación.
  // Si es vertical, aumentamos la altura para un mayor recorrido (por ejemplo, h-[500px]).
  const trackClass =
    config.orientation === 'vertical'
      ? "relative h-[500px] mt-8 border-t-2 border-b-2 border-border/30 overflow-hidden"
      : "relative h-[300px] mt-8 border-l-2 border-r-2 border-border/30 overflow-hidden";

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-background border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-foreground/70" />
            <h2 className="text-xl font-mono text-foreground/70">Race Control</h2>
          </div>
          <Button onClick={handleResetRace} variant="outline" className="border-border/50">
            <Users className="mr-2 h-4 w-4" />
            New Race
          </Button>
        </div>

        {!isRacing && cyclists.length > 0 && (
          <Button onClick={handleStartRace} className="w-full bg-primary/10 hover:bg-primary/20">
            <Flag className="mr-2 h-4 w-4" />
            Start Race
          </Button>
        )}

        {isRacing && countdown > 0 && (
          <div className="text-center text-6xl font-mono text-primary/70">{countdown}</div>
        )}

        <div ref={trackRef} className={trackClass} onClick={handleTrackClick}>
          {cyclists.map(cyclist => {
            let style: React.CSSProperties;
            if (config.orientation === 'vertical') {
              // En vertical: se mueve de arriba a abajo. Spawnean fuera de la pista (top: -10%) y avanzan hasta 100%.
              style = {
                top: `${cyclist.position}%`,
                left: `${cyclist.lane}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${config.cyclistSize}px`,
              };
            } else {
              style = {
                left: `${cyclist.position}%`,
                top: `${cyclist.lane}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${config.cyclistSize}px`,
              };
            }
            return (
              <div key={cyclist.id} className="cyclist-number text-primary/90 absolute" style={style}>
                {cyclist.id}
              </div>
            );
          })}
        </div>

        {allFinished && (
          <Card className="mt-6 p-4 bg-secondary/50 border-none">
            <h3 className="text-lg font-mono mb-4 text-foreground/70">Results</h3>
            <div className="space-y-2 font-mono">
              {sortedCyclists.map(cyclist => {
                const actualTime = cyclist.finishTime ? ((cyclist.finishTime - raceStartTime) / 1000).toFixed(2) : '-';
                const userTime = userTimes[cyclist.id] ? userTimes[cyclist.id].toFixed(2) : '-';
                const difference =
                  userTime !== '-' && actualTime !== '-' ? (Number(userTime) - Number(actualTime)).toFixed(2) : null;
                return (
                  <div key={cyclist.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/70">#{cyclist.id}</span>
                    <div className="flex gap-4">
                      <span className="text-foreground/50">{actualTime}s</span>
                      <span className="text-foreground/50">{userTime}s</span>
                      {difference && (
                        <span className={Number(difference) === 0 ? 'text-green-500/70' : 'text-yellow-500/70'}>
                          {difference}s
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}
