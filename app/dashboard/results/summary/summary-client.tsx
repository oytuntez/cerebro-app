'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Brain, Globe, Layers, TrendingUp } from 'lucide-react'

import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { useSelectedScan } from '@/app/dashboard/hooks/use-selected-scan'
import { createClient } from '@/supabase/client'

interface SummaryStats {
  total_brain_volume: number
  estimated_total_intracranial_volume: number
  total_cortex_volume: number
  total_white_matter: number
  lh_mean_thickness: number
  rh_mean_thickness: number
  lh_cortex_volume: number
  lh_surface_area: number
  lh_mean_curvature: number
  rh_cortex_volume: number
  rh_surface_area: number
  rh_mean_curvature: number
}

export function SummaryClient() {
  const { selectedScan, loading: scanLoading } = useSelectedScan()
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null)
  const [counts, setCounts] = useState({
    globalCount: 0,
    corticalCount: 0,
    subcorticalCount: 0,
    curvatureCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedScan) {
      fetchSummaryData()
    }
  }, [selectedScan])

  const fetchSummaryData = async () => {
    if (!selectedScan) return

    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch summary statistics
      const { data: stats } = await supabase
        .from('freesurfer_summary_stats')
        .select('*')
        .eq('nifti_file_id', selectedScan.id)
        .single()

      setSummaryStats(stats)

      // Count measurements from each table
      const [
        { count: globalCount },
        { count: corticalCount },
        { count: subcorticalCount },
        { count: curvatureCount }
      ] = await Promise.all([
        supabase
          .from('freesurfer_global_measures')
          .select('*', { count: 'exact', head: true })
          .eq('nifti_file_id', selectedScan.id),
        supabase
          .from('freesurfer_cortical_regions')
          .select('*', { count: 'exact', head: true })
          .eq('nifti_file_id', selectedScan.id),
        supabase
          .from('freesurfer_subcortical_segmentations')
          .select('*', { count: 'exact', head: true })
          .eq('nifti_file_id', selectedScan.id),
        supabase
          .from('freesurfer_curvature_stats')
          .select('*', { count: 'exact', head: true })
          .eq('nifti_file_id', selectedScan.id),
      ])

      setCounts({
        globalCount: globalCount || 0,
        corticalCount: corticalCount || 0,
        subcorticalCount: subcorticalCount || 0,
        curvatureCount: curvatureCount || 0
      })
    } catch (error) {
      console.error('Error fetching summary data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (scanLoading) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  if (!selectedScan) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Title translate="no">Summary Statistics</Title>
                  <Description translate="no">Overview of your brain MRI analysis results</Description>
                </div>
              </div>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No scans found. Please upload an MRI scan first.
                </AlertDescription>
              </Alert>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-8 p-4 sm:p-6 lg:p-12 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2">
                <Title translate="no">Summary Statistics</Title>
                <Description translate="no">Overview of your brain MRI analysis results</Description>
              </div>
            </div>
            <Separator className="my-8" />

      {summaryStats ? (
        <>
          {/* Key Brain Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">Total Brain Volume</CardTitle>
                <Brain className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">
                  {summaryStats.total_brain_volume?.toFixed(0) || 'N/A'} mm³
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated total intracranial: {summaryStats.estimated_total_intracranial_volume?.toFixed(0) || 'N/A'} mm³
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">Cortex Volume</CardTitle>
                <Layers className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">
                  {summaryStats.total_cortex_volume?.toFixed(0) || 'N/A'} mm³
                </div>
                <p className="text-sm text-muted-foreground">
                  White matter: {summaryStats.total_white_matter?.toFixed(0) || 'N/A'} mm³
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">Mean Thickness</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">
                  {((summaryStats.lh_mean_thickness + summaryStats.rh_mean_thickness) / 2).toFixed(3) || 'N/A'} mm
                </div>
                <p className="text-sm text-muted-foreground">
                  LH: {summaryStats.lh_mean_thickness?.toFixed(3) || 'N/A'} / RH: {summaryStats.rh_mean_thickness?.toFixed(3) || 'N/A'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Hemisphere Comparison */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Left Hemisphere</CardTitle>
                <CardDescription>Measurements for the left hemisphere</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Cortex Volume</span>
                  <span className="text-muted-foreground">{summaryStats.lh_cortex_volume?.toFixed(0) || 'N/A'} mm³</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Surface Area</span>
                  <span className="text-muted-foreground">{summaryStats.lh_surface_area?.toFixed(0) || 'N/A'} mm²</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Mean Thickness</span>
                  <span className="text-muted-foreground">{summaryStats.lh_mean_thickness?.toFixed(3) || 'N/A'} mm</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Mean Curvature</span>
                  <span className="text-muted-foreground">{summaryStats.lh_mean_curvature?.toFixed(3) || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Right Hemisphere</CardTitle>
                <CardDescription>Measurements for the right hemisphere</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Cortex Volume</span>
                  <span className="text-muted-foreground">{summaryStats.rh_cortex_volume?.toFixed(0) || 'N/A'} mm³</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Surface Area</span>
                  <span className="text-muted-foreground">{summaryStats.rh_surface_area?.toFixed(0) || 'N/A'} mm²</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Mean Thickness</span>
                  <span className="text-muted-foreground">{summaryStats.rh_mean_thickness?.toFixed(3) || 'N/A'} mm</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Mean Curvature</span>
                  <span className="text-muted-foreground">{summaryStats.rh_mean_curvature?.toFixed(3) || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Summary statistics are being processed. Please check back later.
          </AlertDescription>
        </Alert>
      )}

      {/* Measurement Counts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Global Measures</CardTitle>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold mb-2">{counts.globalCount}</div>
            <p className="text-sm text-muted-foreground">measurements available</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Cortical Regions</CardTitle>
            <Brain className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold mb-2">{counts.corticalCount}</div>
            <p className="text-sm text-muted-foreground">regions analyzed</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Subcortical</CardTitle>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold mb-2">{counts.subcorticalCount}</div>
            <p className="text-sm text-muted-foreground">structures segmented</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Curvature Stats</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold mb-2">{counts.curvatureCount}</div>
            <p className="text-sm text-muted-foreground">surface measurements</p>
          </CardContent>
        </Card>
      </div>
          </main>
        </div>
      </AppPanel>
    </div>
  )
}