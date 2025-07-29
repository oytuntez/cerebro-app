import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { z } from 'zod'
import { gunzipSync } from 'zlib'

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes
const ACCEPTED_FILE_TYPES = ['.nii.gz', 'application/gzip', 'application/x-gzip'];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadResults = []
    const errors = []

    for (const file of files) {
      try {
        // Validate file
        const isCompressed = file.name.endsWith('.nii.gz')
        const isUncompressed = file.name.endsWith('.nii') && !isCompressed
        
        if (!isCompressed && !isUncompressed) {
          errors.push({
            filename: file.name,
            error: 'Invalid file format. Only .nii or .nii.gz files are accepted.'
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            filename: file.name,
            error: 'File size exceeds 1GB limit.'
          })
          continue
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Handle decompression if needed
        let fileBuffer: Buffer
        if (isCompressed) {
          // Decompress the .gz file
          fileBuffer = gunzipSync(buffer)
        } else {
          // Already uncompressed
          fileBuffer = buffer
        }

        // Create unique file path
        const timestamp = Date.now()
        const storagePath = `${user.id}/${timestamp}.nii`

        // Upload .nii file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('nifti_gz_files')
          .upload(storagePath, fileBuffer, {
            contentType: 'application/octet-stream',
            upsert: false
          })

        if (uploadError) {
          errors.push({
            filename: file.name,
            error: uploadError.message
          })
          continue
        }

        // Create record in nifti_files table using storage object ID
        const { data: fileRecord, error: dbError } = await supabase
          .from('nifti_files')
          .insert({
            id: uploadData.id, // Use storage object ID as the record ID, due to foreign key
            user_id: user.id,
            file_type: 'nii',
          })
          .select()
          .single()

        if (dbError) {
          // If database insert fails, try to clean up the uploaded file
          await supabase.storage
            .from('nifti_gz_files')
            .remove([storagePath])

          errors.push({
            filename: file.name,
            error: 'Failed to create database record',
            dbError,
          })
          continue
        }

        uploadResults.push({
          id: fileRecord.id,
          filename: file.name,
          size: file.size,
          uploadedAt: fileRecord.created_at,
          status: 'uploaded'
        })

        // TODO: Trigger Inngest pipeline here
        // This will be implemented later with Inngest JS SDK

      } catch (fileError) {
        errors.push({
          filename: file.name,
          error: 'Unexpected error during upload'
        })
      }
    }

    return NextResponse.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors: errors,
      message: uploadResults.length > 0
        ? "We are now processing your raw MRI. This may take a couple hours, we will notify you via email when your brain is ready to explore!"
        : "Upload failed. Please check the errors and try again."
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine file processing status
async function getFileStatus(supabase: any, fileId: string): Promise<'pending' | 'processing' | 'completed' | 'error'> {
  // Check if results exist in freesurfer_summary_stats (indicates completion)
  const { data: summaryResults } = await supabase
    .from('freesurfer_summary_stats')
    .select('id')
    .eq('nifti_file_id', fileId)
    .single()

  if (summaryResults) {
    return 'completed'
  }

  // Check other freesurfer tables as alternative completion indicators
  const { data: globalResults } = await supabase
    .from('freesurfer_global_measures')
    .select('id')
    .eq('nifti_file_id', fileId)
    .single()

  if (globalResults) {
    return 'completed'
  }

  // TODO: In the future, we can add Inngest API checks here
  // For now, assume files without results are pending
  return 'pending'
}

// GET endpoint to check upload status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('user.id', user.id);

    // Get user's uploaded files
    const { data: files, error } = await supabase
      .from('nifti_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_type', 'nii')
      .order('created_at', { ascending: false })

    console.log(files, error);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      )
    }

    // Enhance each file with processing status
    const filesWithStatus = await Promise.all(
      (files || []).map(async (file) => {
        const status = await getFileStatus(supabase, file.id)
        return {
          ...file,
          processing_status: status
        }
      })
    )

    return NextResponse.json({
      files: filesWithStatus
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
