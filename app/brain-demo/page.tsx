'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const BrainDemoClient = dynamic(() => import('./BrainDemoClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading Brain Visualization</h2>
        <p className="text-muted-foreground">Initializing 3D components...</p>
      </div>
    </div>
  )
});

export default function BrainDemoPage() {
  return <BrainDemoClient />;
} 