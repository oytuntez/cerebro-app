import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
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

interface GlobalMeasure {
  id: string
  measure_name: string
  measure_field: string
  value: number
  unit: string | null
  source_file: string | null
}

// Group measures by category
function groupMeasuresByCategory(measures: GlobalMeasure[]) {
  const groups: Record<string, GlobalMeasure[]> = {}
  
  measures.forEach(measure => {
    // Extract category from measure_name (e.g., "Brain Segmentation Volume" -> "Brain Segmentation")
    const category = measure.measure_name.includes('Volume') ? 'Volume Measurements' :
                    measure.measure_name.includes('Ratio') ? 'Ratios and Indices' :
                    measure.measure_name.includes('Count') ? 'Counts' :
                    measure.measure_name.includes('ICV') ? 'Intracranial Volume' :
                    'Other Measurements'
    
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(measure)
  })
  
  return groups
}

interface GlobalMeasuresPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GlobalMeasuresPage({ searchParams }: GlobalMeasuresPageProps) {
  const { user } = await getUserAPI()
  
  if (!user) redirect('/auth/signin')

  const supabase = createClient()

  // Check if scan ID is provided, otherwise get most recent completed scan
  const scanId = searchParams.scan
  let scan
  
  if (scanId && typeof scanId === 'string') {
    // Get the specified scan
    const { data } = await supabase
      .from('nifti_files')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .eq('file_type', 'nii')
      .single()
    scan = data
  }
  
  if (!scan) {
    // Get most recent completed scan or any scan as fallback
    const { data: completedScan } = await supabase
      .from('freesurfer_summary_stats')
      .select('nifti_file_id, nifti_files(*)')
      .eq('nifti_files.user_id', user.id)
      .eq('nifti_files.file_type', 'nii')
      .order('nifti_files.created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (completedScan?.nifti_files) {
      scan = completedScan.nifti_files
    } else {
      // Fallback to any scan if no completed ones exist
      const { data: anyScan } = await supabase
        .from('nifti_files')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', 'nii')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      scan = anyScan
    }
  }

  if (!scan) {
    redirect('/dashboard/scans')
  }

  // Fetch global measures
  const { data: globalMeasures, error } = await supabase
    .from('freesurfer_global_measures')
    .select('*')
    .eq('nifti_file_id', scan.id)
    .order('measure_name', { ascending: true })

  if (error) {
    console.error('Error fetching global measures:', error)
  }

  const measures = globalMeasures || []
  const groupedMeasures = groupMeasuresByCategory(measures)

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Global Brain Measures</Title>
                <Description translate="no">Overall brain measurements and statistics</Description>
              </div>
            </div>
            <Separator />

      {measures.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedMeasures).map(([category, categoryMeasures]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {categoryMeasures.length} measurement{categoryMeasures.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Measure</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryMeasures.map((measure) => (
                      <TableRow key={measure.id}>
                        <TableCell className="font-medium">{measure.measure_name}</TableCell>
                        <TableCell>
                          <code className="text-xs">{measure.measure_field}</code>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {measure.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </TableCell>
                        <TableCell>
                          {measure.unit ? (
                            <Badge variant="secondary">{measure.unit}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {measure.source_file ? (
                            <code className="text-xs text-muted-foreground">{measure.source_file}</code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
            No global measurements found. Your scan may still be processing.
          </AlertDescription>
        </Alert>
      )}
          </main>
        </div>
      </AppPanel>
    </div>
  )
}