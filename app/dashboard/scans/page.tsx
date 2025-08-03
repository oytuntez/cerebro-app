import * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'
import { Description } from '@/components/description'

import { ScansList } from './scans-list'

export default function ScansPage() {
  return (
    <main className="flex-1 space-y-4 overflow-auto p-8 pb-36">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title translate="no">My Scans</Title>
          <Description translate="no">View and manage your uploaded MRI scans</Description>
        </div>
      </div>
      <Separator />
      <ScansList />
    </main>
  )
}