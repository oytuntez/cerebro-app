'use client';

import { useEffect, useState, useRef } from 'react';
import React from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

export default function BrainViewerBulletproof(props: BrainViewerProps) {
  const [status, setStatus] = useState('Initializing...');
  const [ThreeComponent, setThreeComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let mounted = true;
    
    const loadEverything = async () => {
      try {
        setStatus('Loading Three.js modules...');
        
        // Load all modules
        const [threeModule, fiberModule, dreiModule] = await Promise.all([
          import('three'),
          import('@react-three/fiber'),
          import('@react-three/drei')
        ]);
        
        if (!mounted) return;
        
        setStatus('Creating 3D scene...');
        
        // Create the component using React.createElement only
        const Component = () => {
          const [clientMounted, setClientMounted] = useState(false);
          
          useEffect(() => {
            setClientMounted(true);
          }, []);
          
          if (!clientMounted) return null;
          
          const Canvas = fiberModule.Canvas;
          const OrbitControls = dreiModule.OrbitControls;
          
          return React.createElement('div', {
            className: cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden", props.className)
          }, React.createElement(Canvas, {
            gl: { antialias: true, alpha: true },
            camera: { position: [100, 50, 100], fov: 50 }
          }, [
            React.createElement(OrbitControls, { key: 'controls' }),
            React.createElement('ambientLight', { key: 'ambient', intensity: 0.6 }),
            React.createElement('directionalLight', { 
              key: 'directional', 
              position: [10, 10, 5],
              intensity: 1
            }),
            React.createElement('mesh', { key: 'mesh' }, [
              React.createElement('boxGeometry', { key: 'geom', args: [20, 20, 20] }),
              React.createElement('meshStandardMaterial', { key: 'mat', color: '#ff6b35' })
            ])
          ]));
        };
        
        if (!mounted) return;
        
        setThreeComponent(() => Component);
        setStatus('Ready!');
        
      } catch (err: any) {
        console.error('Load error:', err);
        if (mounted) {
          setError(err.message || 'Unknown error');
          setStatus('Failed');
        }
      }
    };
    
    // Extra delay to ensure complete client mount
    const timer = setTimeout(loadEverything, 200);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [props.className]);

  if (error) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", props.className)}>
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">3D Load Failed</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!ThreeComponent) {
    return (
      <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", props.className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-sm">{status}</p>
        </div>
      </div>
    );
  }

  return React.createElement(ThreeComponent);
} 