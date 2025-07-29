'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, Brain } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useSelectedScan } from '../hooks/use-selected-scan'

export function ScanSelector() {
  const { selectedScan, allScans, loading, selectScan } = useSelectedScan()
  const pathname = usePathname()
  
  const isResultsPage = pathname.startsWith('/dashboard/results/')

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">Processing</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Completed</Badge>
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Only show when we have files
  if (allScans.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2 hover:bg-muted/50"
          >
            <div className="flex items-start space-x-2 text-left">
              <Brain className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {selectedScan ? `Scan ${formatDate(selectedScan.created_at)}` : 'Select Scan'}
                </div>
                {selectedScan && (
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedScan.processing_status)}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {allScans.map((file) => (
            <DropdownMenuItem
              key={file.id}
              onClick={() => selectScan(file.id)}
              className="flex items-start space-x-2 p-3"
            >
              <Brain className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  Scan {formatDate(file.created_at)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(file.processing_status)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  ID: {file.id.slice(0, 8)}...
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}