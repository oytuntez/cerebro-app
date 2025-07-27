'use client';

import { useState, useCallback, useMemo } from 'react';
import type { BrainHemisphere } from '../types';

interface UseBrainControlsProps {
  leftHemisphere?: BrainHemisphere;
  rightHemisphere?: BrainHemisphere;
}

export function useBrainControls({ leftHemisphere, rightHemisphere }: UseBrainControlsProps) {
  const [showLeftHemi, setShowLeftHemi] = useState(true);
  const [showRightHemi, setShowRightHemi] = useState(true);
  const [transparency, setTransparency] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());

  // Get unique regions from both hemispheres
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    
    [leftHemisphere, rightHemisphere].forEach(hemi => {
      if (hemi?.annotation?.regions) {
        Object.values(hemi.annotation.regions).forEach(region => {
          if (region.name) regions.add(region.name);
        });
      }
    });
    
    return Array.from(regions).sort();
  }, [leftHemisphere, rightHemisphere]);

  const toggleLeftHemi = useCallback(() => {
    setShowLeftHemi(prev => !prev);
  }, []);

  const toggleRightHemi = useCallback(() => {
    setShowRightHemi(prev => !prev);
  }, []);

  const handleTransparencyChange = useCallback((value: number) => {
    setTransparency(value);
  }, []);

  const toggleWireframe = useCallback(() => {
    setWireframe(prev => !prev);
  }, []);

  const toggleRegion = useCallback((regionName: string) => {
    setSelectedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(regionName)) {
        newSet.delete(regionName);
      } else {
        newSet.add(regionName);
      }
      return newSet;
    });
  }, []);

  const selectAllRegions = useCallback(() => {
    setSelectedRegions(new Set(availableRegions));
  }, [availableRegions]);

  const unselectAllRegions = useCallback(() => {
    setSelectedRegions(new Set());
  }, []);

  // Initialize with all regions selected when hemispheres change
  const initializeRegions = useCallback(() => {
    if (availableRegions.length > 0 && selectedRegions.size === 0) {
      setSelectedRegions(new Set(availableRegions));
    }
  }, [availableRegions, selectedRegions.size]);

  return {
    // State
    showLeftHemi,
    showRightHemi,
    transparency,
    wireframe,
    selectedRegions,
    availableRegions,
    
    // Actions
    toggleLeftHemi,
    toggleRightHemi,
    handleTransparencyChange,
    toggleWireframe,
    toggleRegion,
    selectAllRegions,
    unselectAllRegions,
    initializeRegions,
    
    // Setters for external control
    setShowLeftHemi,
    setShowRightHemi,
    setTransparency,
    setWireframe,
    setSelectedRegions
  };
} 