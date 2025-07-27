'use client';

import React from 'react';
import { Eye, EyeOff, Grid, Palette, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BrainControlsProps } from '../types';

export default function BrainControls({
  showLeftHemi,
  showRightHemi,
  transparency,
  wireframe,
  selectedRegions,
  availableRegions,
  onToggleLeftHemi,
  onToggleRightHemi,
  onTransparencyChange,
  onWireframeToggle,
  onRegionToggle,
  onSelectAllRegions,
  onUnselectAllRegions
}: BrainControlsProps) {
  return (
    <Card className="w-80 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Brain Controls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Hemisphere Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Hemispheres</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="left-hemi" className="flex items-center gap-2">
              {showLeftHemi ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Left Hemisphere
            </Label>
            <Switch
              id="left-hemi"
              checked={showLeftHemi}
              onCheckedChange={onToggleLeftHemi}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="right-hemi" className="flex items-center gap-2">
              {showRightHemi ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Right Hemisphere
            </Label>
            <Switch
              id="right-hemi"
              checked={showRightHemi}
              onCheckedChange={onToggleRightHemi}
            />
          </div>
        </div>

        <Separator />

        {/* Rendering Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Rendering</h3>
          
          <div className="space-y-2">
            <Label>Transparency: {Math.round(transparency * 100)}%</Label>
            <Slider
              value={[transparency * 100]}
              onValueChange={(value) => onTransparencyChange(value[0] / 100)}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="wireframe" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Wireframe
            </Label>
            <Switch
              id="wireframe"
              checked={wireframe}
              onCheckedChange={onWireframeToggle}
            />
          </div>
        </div>

        <Separator />

        {/* Region Controls */}
        {availableRegions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Regions ({selectedRegions.size}/{availableRegions.length})
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllRegions}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUnselectAllRegions}
                  className="text-xs"
                >
                  None
                </Button>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-1">
              {availableRegions.map((regionName) => (
                <div
                  key={regionName}
                  className="flex items-center justify-between py-1"
                >
                  <Label
                    htmlFor={`region-${regionName}`}
                    className="text-xs cursor-pointer flex-1 truncate"
                    title={regionName}
                  >
                    {regionName}
                  </Label>
                  <Switch
                    id={`region-${regionName}`}
                    checked={selectedRegions.has(regionName)}
                    onCheckedChange={() => onRegionToggle(regionName)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 