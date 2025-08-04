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
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">Pending</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-gray-200 text-gray-800 text-xs">Processing</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-300 text-gray-800 text-xs">Completed</Badge>
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
    <div className="min-w-[200px]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between flex items-center break-all text-left text-base h-10 px-3 py-3 rounded-md transition-colors hover:bg-secondary/20 hover:text-foreground hover:no-underline text-muted-foreground"
          >
            <div className="flex items-center space-x-3 text-left flex-1">
              <Brain className="size-5 min-w-5" />
              <span className="truncate">
                {selectedScan ? `Scan ${formatDate(selectedScan.created_at)}` : 'Select Scan'}
              </span>
            </div>
            <ChevronDown className="size-5 min-w-5 shrink-0" />
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
