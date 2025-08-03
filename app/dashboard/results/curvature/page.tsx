import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, Brain } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { getUserAPI } from '@/queries/server/users'

interface CurvatureStats {
  id: string
  hemisphere: 'lh' | 'rh' | string
  curv_mean: number | null
  curv_std: number | null
  curv_min: number | null
  curv_min_vertex: number | null
  curv_max: number | null
  curv_max_vertex: number | null
  surface_area: number | null
  num_vertices: number | null
  vertex_area: number | null
  vertex_separation_mean: number | null
  vertex_separation_std: number | null
}

interface CurvaturePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CurvaturePage({ searchParams }: CurvaturePageProps) {
  const { user } = await getUserAPI()

  if (!user) redirect('/auth/signin')

  // Check if scan ID is provided
  const scanId = searchParams.scan
  if (!scanId || typeof scanId !== 'string') {
    redirect('/dashboard/scans')
  }

  const supabase = createClient()

  // Get the specified scan
  const { data: scan } = await supabase
    .from('nifti_files')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .eq('file_type', 'nii')
    .single()

  if (!scan) {
    return (
      <div className="min-h-screen">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-col">
            <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Title translate="no">Curvature Statistics</Title>
                  <Description translate="no">Surface curvature measurements for each hemisphere</Description>
                </div>
              </div>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No processed scans found. Please upload an MRI scan first.
                </AlertDescription>
              </Alert>
            </main>
          </div>
        </AppPanel>
      </div>
    )
  }

  // Fetch curvature stats
  const { data: curvatureStats, error } = await supabase
    .from('freesurfer_curvature_stats')
    .select('*')
    .eq('nifti_file_id', scan.id)
    .order('hemisphere', { ascending: true })

  if (error) {
    console.error('Error fetching curvature stats:', error)
  }

  const stats = curvatureStats || []
  const lhStats = stats.find(s => s.hemisphere === 'lh')
  const rhStats = stats.find(s => s.hemisphere === 'rh')

  const HemisphereCard = ({ stats, title }: { stats: CurvatureStats | undefined, title: string }) => {
    if (!stats) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>No data available</CardDescription>
          </CardHeader>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Surface area: {stats.surface_area?.toFixed(1) || 'N/A'} mm² •
            {stats.num_vertices?.toLocaleString() || 'N/A'} vertices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Curvature Statistics */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Curvature Measurements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean Curvature</p>
                  <p className="text-lg font-mono">{stats.curv_mean?.toFixed(4) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Std Deviation</p>
                  <p className="text-lg font-mono">{stats.curv_std?.toFixed(4) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                  <p className="text-lg font-mono">{stats.curv_min?.toFixed(4) || 'N/A'}</p>
                  {stats.curv_min_vertex && (
                    <Badge variant="outline" className="mt-1">
                      Vertex {stats.curv_min_vertex}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                  <p className="text-lg font-mono">{stats.curv_max?.toFixed(4) || 'N/A'}</p>
                  {stats.curv_max_vertex && (
                    <Badge variant="outline" className="mt-1">
                      Vertex {stats.curv_max_vertex}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Vertex Statistics */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Vertex Properties</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mean Vertex Area</p>
                  <p className="text-lg font-mono">{stats.vertex_area?.toFixed(3) || 'N/A'} mm²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Vertices</p>
                  <p className="text-lg font-mono">{stats.num_vertices?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mean Vertex Separation</p>
                  <p className="text-lg font-mono">{stats.vertex_separation_mean?.toFixed(3) || 'N/A'} mm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Separation Std Dev</p>
                  <p className="text-lg font-mono">{stats.vertex_separation_std?.toFixed(3) || 'N/A'} mm</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Curvature Statistics</Title>
                <Description translate="no">Surface curvature measurements for each hemisphere</Description>
              </div>
            </div>
            <Separator />

      {stats.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Surface Area</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((lhStats?.surface_area || 0) + (rhStats?.surface_area || 0)).toFixed(0)} mm²
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined hemispheres
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vertices</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((lhStats?.num_vertices || 0) + (rhStats?.num_vertices || 0)).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Surface mesh vertices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mean Curvature</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(((lhStats?.curv_mean || 0) + (rhStats?.curv_mean || 0)) / 2).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across hemispheres
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Hemisphere Details */}
          <div className="grid gap-4 lg:grid-cols-2">
            <HemisphereCard stats={lhStats} title="Left Hemisphere" />
            <HemisphereCard stats={rhStats} title="Right Hemisphere" />
          </div>

          {/* Comparison */}
          {lhStats && rhStats && (
            <Card>
              <CardHeader>
                <CardTitle>Hemisphere Comparison</CardTitle>
                <CardDescription>Asymmetry analysis between left and right hemispheres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="font-medium">Metric</div>
                    <div className="text-right font-medium">Left</div>
                    <div className="text-right font-medium">Right</div>
                    <div className="text-right font-medium">Asymmetry</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>Surface Area</div>
                    <div className="text-right font-mono">{lhStats.surface_area?.toFixed(1)}</div>
                    <div className="text-right font-mono">{rhStats.surface_area?.toFixed(1)}</div>
                    <div className="text-right">
                      {lhStats.surface_area && rhStats.surface_area ? (
                        <span className={
                          Math.abs((lhStats.surface_area - rhStats.surface_area) / lhStats.surface_area * 100) > 5
                            ? 'text-orange-600'
                            : ''
                        }>
                          {((lhStats.surface_area - rhStats.surface_area) / lhStats.surface_area * 100).toFixed(1)}%
                        </span>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>Mean Curvature</div>
                    <div className="text-right font-mono">{lhStats.curv_mean?.toFixed(4)}</div>
                    <div className="text-right font-mono">{rhStats.curv_mean?.toFixed(4)}</div>
                    <div className="text-right">
                      {lhStats.curv_mean && rhStats.curv_mean ? (
                        <span className={
                          Math.abs((lhStats.curv_mean - rhStats.curv_mean) / lhStats.curv_mean * 100) > 10
                            ? 'text-orange-600'
                            : ''
                        }>
                          {((lhStats.curv_mean - rhStats.curv_mean) / lhStats.curv_mean * 100).toFixed(1)}%
                        </span>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>Vertices</div>
                    <div className="text-right font-mono">{lhStats.num_vertices?.toLocaleString()}</div>
                    <div className="text-right font-mono">{rhStats.num_vertices?.toLocaleString()}</div>
                    <div className="text-right">
                      {lhStats.num_vertices && rhStats.num_vertices ? (
                        <span>
                          {((lhStats.num_vertices - rhStats.num_vertices) / lhStats.num_vertices * 100).toFixed(1)}%
                        </span>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No curvature statistics found. Your scan may still be processing.
          </AlertDescription>
        </Alert>
      )}
          </main>
        </div>
      </AppPanel>
    </div>
  )
}
