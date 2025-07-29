'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export default function UploadPageClient() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isCompressed = file.name.endsWith('.nii.gz')
      const isUncompressed = file.name.endsWith('.nii') && !isCompressed

      if (!isCompressed && !isUncompressed) {
        toast({
          title: 'Invalid file format',
          description: `${file.name} is not a .nii or .nii.gz file`,
          variant: 'destructive',
        })
        return false
      }
      if (file.size > 1024 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 1GB limit`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    const newFiles = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gzip': ['.nii.gz'],
      'application/octet-stream': ['.nii'],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i]
      if (uploadFile.status !== 'pending') continue

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading' } : f
      ))

      const formData = new FormData()
      formData.append('files', uploadFile.file)

      try {
        // Create XMLHttpRequest to track progress
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setFiles(prev => prev.map((f, idx) =>
              idx === i ? { ...f, progress } : f
            ))
          }
        })

        // Create promise to handle the request
        const uploadPromise = new Promise<Response>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
              }))
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`))
            }
          }
          xhr.onerror = () => reject(new Error('Network error'))

          xhr.open('POST', '/api/v1/mri')
          xhr.send(formData)
        })

        const response = await uploadPromise
        const data = await response.json()

        if (data.success) {
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, status: 'completed', progress: 100 } : f
          ))
        } else {
          throw new Error(data.errors?.[0]?.error || 'Upload failed')
        }
      } catch (error) {
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ))
      }
    }

    setUploading(false)

    // Show success message if any files uploaded successfully
    const successCount = files.filter(f => f.status === 'completed').length
    if (successCount > 0) {
      toast({
        title: 'Upload complete',
        description: 'We are now processing your raw MRI. This may take a couple hours, we will notify you via email when your brain is ready to explore!',
      })

      // Redirect to scans page after a delay
      setTimeout(() => {
        router.push('/dashboard/scans')
      }, 3000)
    }
  }

  const pendingFiles = files.filter(f => f.status === 'pending').length
  const hasFiles = files.length > 0

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          hover:border-primary hover:bg-primary/5
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-1">
              Drag & drop MRI files here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Only .nii or .nii.gz files, max 1GB each
            </p>
          </>
        )}
      </div>

      {hasFiles && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
            <CardDescription>
              {pendingFiles} file{pendingFiles !== 1 ? 's' : ''} ready to upload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((uploadFile, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}
                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'completed' && (
                    <span className="text-xs text-green-600 font-medium">Uploaded</span>
                  )}
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {pendingFiles > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : `Upload ${pendingFiles} file${pendingFiles !== 1 ? 's' : ''}`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Processing Time:</strong> After upload, your MRI scan will be processed through our analysis pipeline.
          This typically takes 1-2 hours. You'll receive an email notification when your results are ready.
        </AlertDescription>
      </Alert>
    </div>
  )
}
