'use client'

import * as React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface NiftiFile {
  id: string
  created_at: string
  updated_at: string | null
  file_type: string
  user_id: string | null
  parent_nifti_file_id: string | null
  processing_status?: 'pending' | 'processing' | 'completed' | 'error'
}

interface ScanContextValue {
  selectedScan: NiftiFile | null
  allScans: NiftiFile[]
  loading: boolean
  error: string | null
  selectScan: (scanId: string) => void
  refreshScans: () => Promise<void>
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined)

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [selectedScan, setSelectedScan] = useState<NiftiFile | null>(null)
  const [allScans, setAllScans] = useState<NiftiFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const scanIdFromUrl = searchParams.get('scan')

  const fetchScans = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/mri')
      const data = await response.json()

      if (response.ok) {
        const scans = data.files || []
        setAllScans(scans)
        
        // Determine which scan to select
        let scanToSelect: NiftiFile | null = null
        
        if (scanIdFromUrl) {
          // Use scan from URL if specified
          scanToSelect = scans.find((scan: NiftiFile) => scan.id === scanIdFromUrl) || null
        }
        
        if (!scanToSelect && scans.length > 0) {
          // Default to most recent completed scan, or most recent scan if none completed
          scanToSelect = scans.find((scan: NiftiFile) => scan.processing_status === 'completed') || scans[0]
        }
        
        setSelectedScan(scanToSelect)
        
        // Update URL if we have a scan but no scan ID in URL (for results pages)
        if (scanToSelect && !scanIdFromUrl && pathname.startsWith('/dashboard/results/')) {
          const newUrl = `${pathname}?scan=${scanToSelect.id}`
          router.replace(newUrl)
        }
      } else {
        setError(data.error || 'Failed to fetch scans')
      }
    } catch (err) {
      setError('Network error while fetching scans')
    } finally {
      setLoading(false)
    }
  }

  const selectScan = (scanId: string) => {
    const scan = allScans.find(s => s.id === scanId)
    if (scan) {
      setSelectedScan(scan)
      
      // Update URL on results pages
      if (pathname.startsWith('/dashboard/results/')) {
        const newUrl = `${pathname}?scan=${scanId}`
        router.push(newUrl)
      }
    }
  }

  const refreshScans = async () => {
    await fetchScans()
  }

  useEffect(() => {
    fetchScans()
  }, [scanIdFromUrl])

  const value: ScanContextValue = {
    selectedScan,
    allScans,
    loading,
    error,
    selectScan,
    refreshScans,
  }

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function useSelectedScan() {
  const context = useContext(ScanContext)
  if (context === undefined) {
    throw new Error('useSelectedScan must be used within a ScanProvider')
  }
  return context
}