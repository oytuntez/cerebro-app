'use client';

import { useEffect, useState } from 'react';
import type { BrainViewerProps } from './types';
import { cn } from '@/lib/utils';

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", className)}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-sm">Loading 3D Engine...</p>
      </div>
    </div>
  );
}

export default function BrainViewerSimple(props: BrainViewerProps) {
  const [BrainComponent, setBrainComponent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadBrainViewer = async () => {
      try {
        // Import the original BrainViewer dynamically
        const module = await import('./BrainViewer');
        setBrainComponent(() => module.default);
      } catch (error) {
        console.error('Failed to load BrainViewer:', error);
        // Fallback to error component
        setBrainComponent(() => () => (
          <div className={cn("w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center", props.className)}>
            <div className="text-center text-red-400">
              <p>Failed to load 3D components</p>
              <p className="text-sm mt-2">Please refresh the page</p>
            </div>
          </div>
        ));
      }
    };

    loadBrainViewer();
  }, [mounted, props.className]);

  if (!mounted || !BrainComponent) {
    return <LoadingSpinner className={props.className} />;
  }

  return <BrainComponent {...props} />;
} 