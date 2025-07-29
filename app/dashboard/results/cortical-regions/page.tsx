import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Brain } from 'lucide-react'
import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { getUserAPI } from '@/queries/server/users'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface CorticalRegion {
  id: string
  hemisphere: 'lh' | 'rh'
  structure_name: string
  atlas: string
  num_vertices: number | null
  surface_area: number | null
  gray_vol: number | null
  thick_avg: number | null
  thick_std: number | null
  mean_curv: number | null
  gauss_curv: number | null
  fold_ind: number | null
  curv_ind: number | null
}

interface CorticalRegionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CorticalRegionsPage({ searchParams }: CorticalRegionsPageProps) {
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
      <div className="h-screen w-screen overflow-hidden">
        <AppBar className="sticky left-0 top-0 z-10" />
        <AppPanel>
          <div className="flex flex-1 flex-col">
            <main className="flex-1 space-y-4 overflow-auto p-8 pb-36">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Title translate="no">Cortical Regions</Title>
                  <Description translate="no">Detailed measurements for each cortical region</Description>
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

  // Fetch cortical regions
  const { data: corticalRegions, error } = await supabase
    .from('freesurfer_cortical_regions')
    .select('*')
    .eq('nifti_file_id', scan.id)
    .order('structure_name', { ascending: true })

  if (error) {
    console.error('Error fetching cortical regions:', error)
  }

  const regions = corticalRegions || []

  const lhRegions = regions.filter(r => r.hemisphere === 'lh')
  const rhRegions = regions.filter(r => r.hemisphere === 'rh')

  const RegionTable = ({ regions, hemisphere }: { regions: CorticalRegion[], hemisphere: string }) => (
    <Table>
      <TableCaption>{regions.length} regions in {hemisphere}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          <TableHead className="text-right">Surface Area</TableHead>
          <TableHead className="text-right">Gray Volume</TableHead>
          <TableHead className="text-right">Avg Thickness</TableHead>
          <TableHead className="text-right">Std Thickness</TableHead>
          <TableHead className="text-right">Mean Curvature</TableHead>
          <TableHead>Atlas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {regions.map((region) => (
          <TableRow key={region.id}>
            <TableCell className="font-medium">{region.structure_name}</TableCell>
            <TableCell className="text-right font-mono">
              {region.surface_area?.toFixed(1) || '-'} mm²
            </TableCell>
            <TableCell className="text-right font-mono">
              {region.gray_vol?.toFixed(1) || '-'} mm³
            </TableCell>
            <TableCell className="text-right font-mono">
              {region.thick_avg?.toFixed(3) || '-'} mm
            </TableCell>
            <TableCell className="text-right font-mono">
              {region.thick_std?.toFixed(3) || '-'}
            </TableCell>
            <TableCell className="text-right font-mono">
              {region.mean_curv?.toFixed(3) || '-'}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{region.atlas}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-1 flex-col">
          <main className="flex-1 space-y-4 overflow-auto p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Cortical Regions</Title>
                <Description translate="no">Detailed measurements for each cortical region</Description>
              </div>
            </div>
            <Separator />

      {regions.length > 0 ? (
        <>
          <div className="flex items-center gap-4">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {regions.length} regions total
            </span>
          </div>

          <Tabs defaultValue="both" className="space-y-4">
            <TabsList>
              <TabsTrigger value="both">Both Hemispheres</TabsTrigger>
              <TabsTrigger value="left">Left Hemisphere</TabsTrigger>
              <TabsTrigger value="right">Right Hemisphere</TabsTrigger>
            </TabsList>

            <TabsContent value="both" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Left Hemisphere</CardTitle>
                    <CardDescription>{lhRegions.length} regions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Surface Area:</span>
                        <span className="font-mono">
                          {lhRegions.reduce((sum, r) => sum + (r.surface_area || 0), 0).toFixed(1)} mm²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Gray Volume:</span>
                        <span className="font-mono">
                          {lhRegions.reduce((sum, r) => sum + (r.gray_vol || 0), 0).toFixed(1)} mm³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Thickness:</span>
                        <span className="font-mono">
                          {(lhRegions.reduce((sum, r) => sum + (r.thick_avg || 0), 0) / lhRegions.length).toFixed(3)} mm
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Right Hemisphere</CardTitle>
                    <CardDescription>{rhRegions.length} regions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Surface Area:</span>
                        <span className="font-mono">
                          {rhRegions.reduce((sum, r) => sum + (r.surface_area || 0), 0).toFixed(1)} mm²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Gray Volume:</span>
                        <span className="font-mono">
                          {rhRegions.reduce((sum, r) => sum + (r.gray_vol || 0), 0).toFixed(1)} mm³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Thickness:</span>
                        <span className="font-mono">
                          {(rhRegions.reduce((sum, r) => sum + (r.thick_avg || 0), 0) / rhRegions.length).toFixed(3)} mm
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Left Hemisphere Regions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegionTable regions={lhRegions} hemisphere="left hemisphere" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Right Hemisphere Regions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegionTable regions={rhRegions} hemisphere="right hemisphere" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="left">
              <Card>
                <CardHeader>
                  <CardTitle>Left Hemisphere Regions</CardTitle>
                  <CardDescription>Detailed measurements for left hemisphere cortical regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegionTable regions={lhRegions} hemisphere="left hemisphere" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="right">
              <Card>
                <CardHeader>
                  <CardTitle>Right Hemisphere Regions</CardTitle>
                  <CardDescription>Detailed measurements for right hemisphere cortical regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegionTable regions={rhRegions} hemisphere="right hemisphere" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No cortical regions data found. Your scan may still be processing.
          </AlertDescription>
        </Alert>
      )}
          </main>
        </div>
      </AppPanel>
    </div>
  )
}