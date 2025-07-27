'use client';

import { useEffect, useState } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewerDebug(props: BrainViewerProps) {
  const [status, setStatus] = useState('Mounting...');
  const [error, setError] = useState<string | null>(null);
  const [ThreeComponent, setThreeComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        setStatus('Loading Three.js...');
        
        // Test basic Three.js first
        const three = await import('three');
        if (!mounted) return;
        
        setStatus('Loading React Three Fiber...');
        const fiber = await import('@react-three/fiber');
        if (!mounted) return;
        
        setStatus('Loading Drei...');
        const drei = await import('@react-three/drei');
        if (!mounted) return;
        
        setStatus('Creating component...');
        
        // Create a simple test component
        const TestComponent = () => {
          const [mounted2, setMounted2] = useState(false);
          
          useEffect(() => {
            setMounted2(true);
          }, []);
          
          if (!mounted2) return null;
          
          return (
            <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden", props.className)}>
              <fiber.Canvas>
                <drei.OrbitControls />
                <ambientLight intensity={0.6} />
                <mesh>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="orange" />
                </mesh>
              </fiber.Canvas>
            </div>
          );
        };
        
        setThreeComponent(() => TestComponent);
        setStatus('Ready!');
        
      } catch (err: any) {
        console.error('Load error:', err);
        setError(`Failed: ${err.message}`);
        setStatus('Error');
      }
    };
    
    // Add delay to ensure client mount
    setTimeout(load, 100);
    
    return () => {
      mounted = false;
    };
  }, [props.className]);

  if (error) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", props.className)}>
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">Debug Error</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-2 text-gray-500">Check console for details</p>
        </div>
      </div>
    );
  }

  if (!ThreeComponent) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", props.className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">{status}</p>
        </div>
      </div>
    );
  }

  return <ThreeComponent />;
} 