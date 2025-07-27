'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

// This will be our actual 3D component
function ThreeDScene() {
  const [error, setError] = useState<string | null>(null);
  const [Canvas, setCanvas] = useState<any>(null);
  const [OrbitControls, setOrbitControls] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadThree = async () => {
      try {
        // Load modules one by one with delays
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const fiberModule = await import('@react-three/fiber');
        if (!mounted) return;
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const dreiModule = await import('@react-three/drei');
        if (!mounted) return;
        
        setCanvas(() => fiberModule.Canvas);
        setOrbitControls(() => dreiModule.OrbitControls);
        
      } catch (err: any) {
        console.error('Failed to load Three.js:', err);
        setError(err.message);
      }
    };

    loadThree();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] bg-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>3D Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!Canvas || !OrbitControls) {
    return (
      <div className="w-full h-full min-h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading 3D...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-gray-950">
      <Canvas camera={{ position: [5, 5, 5] }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}

// Dynamically import with aggressive no-SSR settings
const DynamicThreeDScene = dynamic(() => Promise.resolve(ThreeDScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-gray-800 flex items-center justify-center">
      <div className="text-white">Initializing 3D Engine...</div>
    </div>
  )
});

export default function BrainViewerNuclear({ className, ...props }: BrainViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Extra delay to ensure hydration is complete
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-800 flex items-center justify-center", className)}>
        <div className="text-white">Preparing 3D...</div>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full min-h-[600px]", className)}>
      <DynamicThreeDScene />
    </div>
  );
} 