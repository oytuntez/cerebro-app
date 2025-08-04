import * as React from 'react'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AppBar } from '@/app/dashboard/components/app-bar'
import { AppPanel } from '@/app/dashboard/components/app-panel'
import { getUserAPI } from '@/queries/server/users'
import ApproachAvoidanceClient from './approach-avoidance-client'

interface ApproachAvoidancePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ApproachAvoidancePage({ searchParams }: ApproachAvoidancePageProps) {
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
                  <Title translate="no">Approach vs Avoidance Systems</Title>
                  <Description translate="no">Exploring the neural circuits of motivation and threat response</Description>
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

  // Fetch cortical regions for approach-avoidance related areas
  const { data: corticalRegions } = await supabase
    .from('freesurfer_cortical_regions')
    .select('*')
    .eq('nifti_file_id', scan.id)

  const regions = corticalRegions || []

  return (
    <div className="min-h-screen">
      <AppBar className="sticky left-0 top-0 z-10" />
      <AppPanel>
        <div className="flex flex-col">
          <main className="space-y-4 p-4 sm:p-6 lg:p-8 pb-36">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Title translate="no">Approach vs Avoidance Systems</Title>
                <Description translate="no">Exploring the neural circuits of motivation and threat response</Description>
              </div>
            </div>
            <Separator />

            <ApproachAvoidanceClient />
          </main>
        </div>
      </AppPanel>
    </div>
  )
}