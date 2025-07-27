'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { BrainViewerProps } from './types';

// Simple loading component
function LoadingComponent({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full min-h-[600px] bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center ${className || ''}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-sm">Loading 3D Brain Viewer...</p>
      </div>
    </div>
  );
}

// Dynamically import the entire brain viewer with no SSR
const DynamicBrainViewer = dynamic(() => import('./BrainViewer'), {
  ssr: false,
  loading: () => <LoadingComponent />
});

export default function BrainViewerWrapper(props: BrainViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingComponent className={props.className} />;
  }

  return <DynamicBrainViewer {...props} />;
} 