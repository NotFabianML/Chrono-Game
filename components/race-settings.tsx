'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export interface RaceConfig {
  cyclistCount: number;
  maxSpeed: number;
  minSpeed: number;
  cyclistSize: number;
  minNumber: number;
  maxNumber: number;
  orientation: 'horizontal' | 'vertical';
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

export default function RaceSettings() {
  const [config, setConfig] = useState<RaceConfig>(DEFAULT_CONFIG);

  const handleChange = (key: keyof RaceConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('updateRaceConfig', { detail: config }));
  };

  return (
    <Card className="p-6 bg-background border-border/50 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-foreground/70" />
        <h2 className="text-xl font-mono text-foreground/70">Race Configuration</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cyclistCount">Number of Cyclists</Label>
          <Input
            id="cyclistCount"
            type="number"
            min="1"
            value={config.cyclistCount}
            onChange={(e) => handleChange('cyclistCount', parseInt(e.target.value) || DEFAULT_CONFIG.cyclistCount)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="minSpeed">Minimum Speed</Label>
          <Input
            id="minSpeed"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={config.minSpeed}
            onChange={(e) => handleChange('minSpeed', parseFloat(e.target.value) || DEFAULT_CONFIG.minSpeed)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="maxSpeed">Maximum Speed</Label>
          <Input
            id="maxSpeed"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={config.maxSpeed}
            onChange={(e) => handleChange('maxSpeed', parseFloat(e.target.value) || DEFAULT_CONFIG.maxSpeed)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="cyclistSize">Cyclist Size (px)</Label>
          <Input
            id="cyclistSize"
            type="number"
            min="10"
            max="50"
            value={config.cyclistSize}
            onChange={(e) => handleChange('cyclistSize', parseInt(e.target.value) || DEFAULT_CONFIG.cyclistSize)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="minNumber">Min Number</Label>
          <Input
            id="minNumber"
            type="number"
            min="1"
            value={config.minNumber}
            onChange={(e) => handleChange('minNumber', parseInt(e.target.value) || DEFAULT_CONFIG.minNumber)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="maxNumber">Max Number</Label>
          <Input
            id="maxNumber"
            type="number"
            min={config.minNumber}
            value={config.maxNumber}
            onChange={(e) => handleChange('maxNumber', parseInt(e.target.value) || DEFAULT_CONFIG.maxNumber)}
            className="bg-background border-border/50"
          />
        </div>
        <div>
          <Label htmlFor="orientation">Orientation</Label>
          <select
            id="orientation"
            value={config.orientation}
            onChange={(e) => handleChange('orientation', e.target.value)}
            className="bg-background border-border/50 w-full p-2"
          >
            <option value="horizontal">Horizontal (Left to Right)</option>
            <option value="vertical">Vertical (Top to Bottom)</option>
          </select>
        </div>
        <Button type="submit" className="w-full bg-primary/10 hover:bg-primary/20">
          Apply Settings
        </Button>
      </form>
    </Card>
  );
}
