'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Brain, Calendar, FileText, Loader2, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'

interface NiftiFile {
  id: string
  created_at: string
  updated_at: string | null
  file_type: string
  user_id: string | null
  parent_nifti_file_id: string | null
  processing_status?: 'pending' | 'processing' | 'completed' | 'error'
}

export function ScansList() {
  const [files, setFiles] = useState<NiftiFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/v1/mri')
      const data = await response.json()

      if (response.ok) {
        setFiles(data.files)
      } else {
        setError(data.error || 'Failed to fetch scans')
      }
    } catch (err) {
      setError('Network error while fetching scans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <Brain className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading your scans...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No scans uploaded yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Upload your first MRI scan to get started with brain analysis
          </p>
          <Button asChild>
            <Link href="/dashboard/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload MRI Scan
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {files.map((file) => {
          const status = file.processing_status || 'pending'
          const createdDate = new Date(file.created_at)
          
          return (
            <Card key={file.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          MRI Scan
                        </h3>
                        {getStatusBadge(status)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        Uploaded {format(createdDate, 'MMM d, yyyy at h:mm a')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        File ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{file.id}</code>
                      </div>
                      {status === 'processing' && (
                        <div className="mt-2 text-sm text-blue-600">
                          Processing through analysis pipeline...
                        </div>
                      )}
                      {status === 'completed' && (
                        <div className="mt-2 text-sm text-green-600">
                          Analysis complete - results available
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {status === 'completed' && (
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/results?scan=${file.id}`}>
                          View Results
                        </Link>
                      </Button>
                    )}
                    {status === 'processing' && (
                      <Button variant="outline" size="sm" disabled>
                        Processing...
                      </Button>
                    )}
                    {status === 'pending' && (
                      <Button variant="outline" size="sm" disabled>
                        Queued
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchFiles}>
          Refresh Status
        </Button>
      </div>
    </div>
  )
}