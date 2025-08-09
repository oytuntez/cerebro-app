'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { BrainViewerProps } from './types'
import { useBrainData } from '@/components/brain-visualization/hooks/useBrainData'

// Simple loading component
function LoadingComponent({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-full min-h-[600px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-950 ${className || ''}`}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        <p className="text-sm text-white">Loading 3D Brain Viewer...</p>
      </div>
    </div>
  )
}

// Dynamically import the entire brain viewer with no SSR
const DynamicBrainViewer = dynamic(() => import('./BrainViewer'), {
  ssr: false,
  loading: () => <LoadingComponent />,
})

interface BrainViewerWrapperProps extends BrainViewerProps {
  useDemo?: boolean
  scanId?: string
  transparentBackground?: boolean
}

export default function BrainViewerWrapper({
  leftHemisphere: providedLeft,
  rightHemisphere: providedRight,
  useDemo = false,
  scanId,
  transparentBackground = false,
  ...props
}: BrainViewerWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const {
    leftHemisphere: loadedLeft,
    rightHemisphere: loadedRight,
    loading,
    loadFromUrls,
  } = useBrainData()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only load demo data if useDemo is true and no hemispheres are provided
    if (mounted && useDemo && !providedLeft && !providedRight && !scanId) {
      // Load demo data from public directory
      loadFromUrls({
        leftAsc: '/lh.asc',
        rightAsc: '/rh.asc',
        leftAnnot: '/lh.custom_regions_de_ki.json',
        rightAnnot: '/rh.custom_regions_de_ki.json',
      })
    }
    // TODO: Add API loading logic when scanId is provided
  }, [mounted, useDemo, providedLeft, providedRight, scanId, loadFromUrls])

  if (!mounted || loading) {
    return <LoadingComponent className={props.className} />
  }

  // Use provided hemispheres if available, otherwise use loaded ones
  const leftHemisphere = providedLeft || loadedLeft
  const rightHemisphere = providedRight || loadedRight

  return (
    <DynamicBrainViewer
      leftHemisphere={leftHemisphere}
      rightHemisphere={rightHemisphere}
      transparentBackground={transparentBackground}
      {...props}
    />
  )
}
