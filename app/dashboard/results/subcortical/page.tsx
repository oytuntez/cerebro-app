import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Layers } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface SubcorticalSegmentation {
  id: string
  seg_id: number
  structure_name: string
  nvoxels: number | null
  volume_mm3: number | null
  norm_mean: number | null
  norm_stddev: number | null
  norm_min: number | null
  norm_max: number | null
  norm_range: number | null
}

// Group structures by category
function groupStructuresByCategory(structures: SubcorticalSegmentation[]) {
  const groups: Record<string, SubcorticalSegmentation[]> = {}
  
  structures.forEach(structure => {
    let category = 'Other'
    const name = structure.structure_name.toLowerCase()
    
    if (name.includes('hippocampus')) category = 'Hippocampus'
    else if (name.includes('amygdala')) category = 'Amygdala'
    else if (name.includes('thalamus')) category = 'Thalamus'
    else if (name.includes('caudate')) category = 'Caudate'
    else if (name.includes('putamen')) category = 'Putamen'
    else if (name.includes('pallidum')) category = 'Pallidum'
    else if (name.includes('ventricle') || name.includes('csf')) category = 'Ventricles & CSF'
    else if (name.includes('white-matter') || name.includes('wm')) category = 'White Matter'
    else if (name.includes('cortex')) category = 'Cortex'
    else if (name.includes('cerebellum')) category = 'Cerebellum'
    else if (name.includes('brain-stem')) category = 'Brain Stem'
    
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(structure)
  })
  
  return groups
}

interface SubcorticalPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SubcorticalPage({ searchParams }: SubcorticalPageProps) {
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
                  <Title translate="no">Subcortical Segmentations</Title>
                  <Description translate="no">Volume and intensity measurements for subcortical structures</Description>
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

  // Fetch subcortical segmentations
  const { data: segmentations, error } = await supabase
    .from('freesurfer_subcortical_segmentations')
    .select('*')
    .eq('nifti_file_id', scan.id)
    .order('structure_name', { ascending: true })

  if (error) {
    console.error('Error fetching subcortical segmentations:', error)
  }

  const structures = segmentations || []
  const groupedStructures = groupStructuresByCategory(structures)
  
  // Calculate total brain volume for percentage calculations
  const totalVolume = structures.reduce((sum, s) => sum + (s.volume_mm3 || 0), 0)

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-1 flex-col">
          <main className="flex-1 space-y-4 overflow-auto p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Subcortical Segmentations</Title>
                <Description translate="no">Volume and intensity measurements for subcortical structures</Description>
              </div>
            </div>
            <Separator />

      {structures.length > 0 ? (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Structures</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{structures.length}</div>
                <p className="text-xs text-muted-foreground">segmented structures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)} cm³</div>
                <p className="text-xs text-muted-foreground">across all structures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Structure</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {structures.reduce((max, s) => 
                    (s.volume_mm3 || 0) > (max.volume_mm3 || 0) ? s : max, 
                    structures[0]
                  )?.structure_name || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">by volume</p>
              </CardContent>
            </Card>
          </div>

          {/* Grouped Structures */}
          {Object.entries(groupedStructures)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryStructures]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {categoryStructures.length} structure{categoryStructures.length !== 1 ? 's' : ''} • 
                  Total volume: {(categoryStructures.reduce((sum, s) => sum + (s.volume_mm3 || 0), 0) / 1000).toFixed(1)} cm³
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Structure</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                      <TableHead className="text-right">Voxels</TableHead>
                      <TableHead className="text-right">Mean Intensity</TableHead>
                      <TableHead className="text-right">Std Dev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryStructures
                      .sort((a, b) => (b.volume_mm3 || 0) - (a.volume_mm3 || 0))
                      .map((structure) => {
                        const percentage = totalVolume > 0 
                          ? ((structure.volume_mm3 || 0) / totalVolume) * 100 
                          : 0
                        
                        return (
                          <TableRow key={structure.id}>
                            <TableCell className="font-medium">{structure.structure_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{structure.seg_id}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {structure.volume_mm3?.toFixed(1) || '-'} mm³
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2">
                                <Progress value={percentage} className="w-16" />
                                <span className="text-xs text-muted-foreground w-12 text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {structure.nvoxels?.toLocaleString() || '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {structure.norm_mean?.toFixed(2) || '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {structure.norm_stddev?.toFixed(2) || '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No subcortical segmentation data found. Your scan may still be processing.
          </AlertDescription>
        </Alert>
      )}
          </main>
        </div>
      </AppPanel>
    </div>
  )
}