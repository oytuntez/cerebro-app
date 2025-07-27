'use client';

import React, { Suspense, useEffect, useState } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewer({
  leftHemisphere,
  rightHemisphere,
  showLeftHemi = true,
  showRightHemi = true,
  transparency = 0,
  wireframe = false,
  selectedRegions = new Set(),
  className
}: BrainViewerProps) {
  const [isClient, setIsClient] = useState(false);
  const [components, setComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadComponents = async () => {
      try {
        const [fiberModule, dreiModule, meshModule] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('./BrainMesh')
        ]);

        setComponents({
          Canvas: fiberModule.Canvas,
          OrbitControls: dreiModule.OrbitControls,
          PerspectiveCamera: dreiModule.PerspectiveCamera,
          BrainMesh: meshModule.default
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to load Three.js components:', error);
        setLoading(false);
      }
    };

    loadComponents();
  }, [isClient]);

  if (!isClient || loading) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading 3D Engine...</p>
        </div>
      </div>
    );
  }

  if (!components) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", className)}>
        <div className="text-center text-red-400">
          <p>Failed to load 3D components</p>
          <p className="text-sm mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  const { Canvas, OrbitControls, PerspectiveCamera, BrainMesh } = components;

  return (
    <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true
        }}
        camera={{ position: [200, 100, 200], fov: 50 }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[100, 100, 100]} 
            intensity={0.8}
            castShadow
          />
          <directionalLight 
            position={[-100, -100, -100]} 
            intensity={0.3}
          />

          {/* Brain Meshes */}
          {leftHemisphere && (
            <BrainMesh
              hemisphere={leftHemisphere}
              transparency={transparency}
              wireframe={wireframe}
              selectedRegions={selectedRegions}
              visible={showLeftHemi}
            />
          )}
          
          {rightHemisphere && (
            <BrainMesh
              hemisphere={rightHemisphere}
              transparency={transparency}
              wireframe={wireframe}
              selectedRegions={selectedRegions}
              visible={showRightHemi}
            />
          )}

          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={500}
            minDistance={50}
          />
          
          <PerspectiveCamera 
            makeDefault 
            position={[200, 100, 200]} 
            fov={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 