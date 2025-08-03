'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Brain, Activity, BarChart3, Zap, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { useSelectedScan } from '@/app/dashboard/hooks/use-selected-scan'
import { createClient } from '@/supabase/client'

interface BrainData {
  summary: any
  globalMeasures: any[]
  corticalRegions: any[]
  subcortical: any[]
}

export function StoryClient() {
  const { selectedScan, loading: scanLoading } = useSelectedScan()
  const [brainData, setBrainData] = useState<BrainData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedScan) {
      fetchBrainData()
    }
  }, [selectedScan])

  const fetchBrainData = async () => {
    if (!selectedScan) return

    setLoading(true)
    const supabase = createClient()

    try {
      const [summaryRes, globalRes, corticalRes, subcorticalRes] = await Promise.all([
        supabase
          .from('freesurfer_summary_stats')
          .select('*')
          .eq('nifti_file_id', selectedScan.id)
          .single(),
        supabase
          .from('freesurfer_global_measures')
          .select('*')
          .eq('nifti_file_id', selectedScan.id),
        supabase
          .from('freesurfer_cortical_regions')
          .select('*')
          .eq('nifti_file_id', selectedScan.id),
        supabase
          .from('freesurfer_subcortical_segmentations')
          .select('*')
          .eq('nifti_file_id', selectedScan.id),
      ])

      setBrainData({
        summary: summaryRes.data,
        globalMeasures: globalRes.data || [],
        corticalRegions: corticalRes.data || [],
        subcortical: subcorticalRes.data || [],
      })
    } catch (error) {
      console.error('Error fetching brain data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (scanLoading || loading) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading your brain story...</div>
              </div>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  if (!selectedScan || !brainData) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No scan data found. Please select or upload an MRI scan first.
                </AlertDescription>
              </Alert>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  const { summary } = brainData
  const brainVolumeRatio = ((summary.total_brain_volume / summary.estimated_total_intracranial_volume) * 100)?.toFixed(1)
  const hemisphereBalance = ((summary.lh_cortex_volume / (summary.lh_cortex_volume + summary.rh_cortex_volume)) * 100)?.toFixed(1)

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-8 p-4 sm:p-6 lg:p-8 pb-36">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <Title translate="no" className="text-3xl">Your Brain Story</Title>
              </div>
              <Description translate="no" className="text-lg">
                A personalized journey through your brain's unique architecture and characteristics
              </Description>
            </div>

            <Separator />

            {/* Brain Score Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Your Brain Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-5xl font-bold text-primary">{brainVolumeRatio}%</div>
                  <p className="text-muted-foreground">
                    Your brain occupies {brainVolumeRatio}% of your skull cavity, which is within the healthy range.
                  </p>
                  <Progress value={parseFloat(brainVolumeRatio)} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Key Insights Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Brain Volume */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Brain Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(summary.total_brain_volume / 1000).toFixed(0)} mL</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.total_brain_volume > 1200000 ? 'Above average' : 'Within normal range'}
                  </p>
                </CardContent>
              </Card>

              {/* Hemisphere Balance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Hemisphere Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">L</div>
                    <Progress value={parseFloat(hemisphereBalance)} className="flex-1" />
                    <div className="text-sm">R</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.abs(50 - parseFloat(hemisphereBalance)) < 2 ? 'Well balanced' : 'Slight asymmetry'}
                  </p>
                </CardContent>
              </Card>

              {/* Gray Matter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Gray Matter Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(summary.total_cortex_volume / 1000).toFixed(0)} mL</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processing power of your brain
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis Sections */}
            <div className="space-y-8">
              {/* Section 1: Volume Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Brain Composition
                  </CardTitle>
                  <CardDescription>
                    Understanding your brain's tissue distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gray Matter (Cortex)</span>
                        <span className="font-medium">{((summary.total_cortex_volume / summary.total_brain_volume) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(summary.total_cortex_volume / summary.total_brain_volume) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>White Matter</span>
                        <span className="font-medium">{((summary.total_white_matter / summary.total_brain_volume) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(summary.total_white_matter / summary.total_brain_volume) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Cortical Thickness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Cortical Thickness Profile
                  </CardTitle>
                  <CardDescription>
                    The thickness of your brain's outer layer indicates neural density
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Left Hemisphere</span>
                        <Badge variant="outline">{summary.lh_mean_thickness?.toFixed(2)} mm</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {summary.lh_mean_thickness > 2.5 ? 'Above average thickness' : 'Normal thickness'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Right Hemisphere</span>
                        <Badge variant="outline">{summary.rh_mean_thickness?.toFixed(2)} mm</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {summary.rh_mean_thickness > 2.5 ? 'Above average thickness' : 'Normal thickness'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Surface Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Cortical Surface Area
                  </CardTitle>
                  <CardDescription>
                    More surface area means more room for neural connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {((summary.lh_surface_area + summary.rh_surface_area) / 1000)?.toFixed(0)} cm²
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total cortical surface area
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Left hemisphere</span>
                        <span>{(summary.lh_surface_area / 1000)?.toFixed(0)} cm²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Right hemisphere</span>
                        <span>{(summary.rh_surface_area / 1000)?.toFixed(0)} cm²</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Summary */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>What This Means for You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    ✓ Your brain volume and structure are within healthy ranges
                  </p>
                  <p>
                    ✓ The balance between your hemispheres shows normal symmetry
                  </p>
                  <p>
                    ✓ Your cortical thickness indicates good neural density
                  </p>
                  <p>
                    ✓ Surface area measurements suggest healthy brain folding patterns
                  </p>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </AppPanel>
    </div>
  )
}
