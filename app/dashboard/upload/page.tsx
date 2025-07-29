import * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'

import UploadPageClient from './upload-page-client'

export default function UploadPage() {
  return (
    <main className="flex-1 space-y-4 overflow-auto p-8 pb-36">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title translate="no">Upload MRI Scan</Title>
          <Description translate="no">Upload your brain MRI scan in NIfTI format (.nii or .nii.gz) for analysis</Description>
        </div>
      </div>
      <Separator />
      <UploadPageClient />
    </main>
  )
}