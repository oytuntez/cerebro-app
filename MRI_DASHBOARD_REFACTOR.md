# MRI Dashboard Refactor Notes

## Project Overview
- **Goal**: Transform the current blog/article dashboard into an MRI analysis dashboard
- **Key Features**:
  - Upload brain MRI files
  - Track files through inngest pipeline
  - Display analysis results from supabase

## Architecture Components
- **cerebro-app**: Frontend dashboard (current project)
- **cerebro-engine**: Backend processing pipelines
- **Supabase**: Data storage for both projects
- **Inngest**: Pipeline orchestration

## Current State Analysis

### Dashboard Structure
- Currently reads like a blog/article management system
- Key findings:
  - [x] Current dashboard components: LatestPosts, PostRanks
  - [x] Brain visualization component exists at `/brain-demo`
  - [x] Authentication flow working with Supabase auth
  - [ ] Need to check existing file upload mechanisms

### Cerebro Engine
- Contains MRI processing pipelines
- Functions found:
  - `upload_nifti.py`
  - `freesurfer_recon_all.py`
  - `freesurfer_parse_statistics.py`
  - `freesurfer_store_files.py`
  - `calculate_roi_volumes.py`
  - Population and user analysis functions

### Data Flow
1. User uploads MRI file (nifti_files table) → 
2. File processed by cerebro-engine (inngest pipeline) → 
3. Results stored in Supabase (freesurfer_* tables) → 
4. Dashboard displays results

### Existing Database Schema
- **nifti_files**: Main file upload tracking
  - id (UUID)
  - file_type (text)
  - user_id (UUID)
  - parent_nifti_file_id (UUID)
  - created_at, updated_at

- **FreeSurfer measurement tables**:
  - freesurfer_global_measures
  - freesurfer_cortical_regions
  - freesurfer_subcortical_segmentations
  - freesurfer_curvature_stats
  - freesurfer_summary_stats

All tables have RLS policies for user data isolation.

## Next Steps
1. Examine current dashboard structure
2. Review Supabase schema
3. Understand inngest pipeline integration
4. Plan component refactor

## Questions to Answer
- [x] What MRI file formats are supported? → NIfTI (.nii.gz)
- [x] What tables exist in Supabase? → nifti_files + freesurfer_* tables
- [x] How is the inngest pipeline triggered? → Event-based via `nifti_file_uploaded` event
- [ ] What visualizations are needed?
- [ ] How to integrate file upload with inngest from the frontend?

## Inngest Pipeline Architecture
1. **Server**: Served via Lambda, locally you can run: `sam local start-api`
2. **Functions**:
   - `upload_nifti`: Main entry point, triggered by `nifti_file_uploaded` event
   - `resample_atlas_for_user_nifti`: Processes the uploaded file
   - `calculate_roi_volumes`: Calculates region of interest volumes
   - `freesurfer_recon_all`: Full FreeSurfer reconstruction
   - `freesurfer_parse_statistics`: Parses FreeSurfer output
   - `freesurfer_store_files`: Stores results in Supabase

3. **Flow**: Upload → Store in Supabase storage → Trigger inngest → Process → Store results

## Phase 1 Progress Update

### ✅ Completed Components

#### 1. File Upload System
- **✅ Route**: `/dashboard/upload` - Complete with drag-and-drop interface
- **✅ API**: `POST /api/v1/mri` - Handles multi-file uploads to Supabase
- **✅ Validation**: .nii.gz format and 1GB size limit enforced
- **✅ Progress**: Real-time upload progress with XMLHttpRequest
- **✅ UX**: Success message and auto-redirect to scans page

#### 2. Dashboard Navigation
- **✅ Updated Config**: Replaced blog items with MRI items
- **✅ New Items**: Upload MRI, My Scans, Results
- **✅ Icons**: Upload, Brain, BarChart3 icons added

### ⏳ Next Phase Components

#### 3. Processing Queue & Status
- Display list of uploaded files
- Show processing status for each
- Polling for status updates

#### 4. Dashboard Layout Updates
- **Keep**: Sidebar structure, notification system, user menu
- **Remove**: Blog widgets from home page

## TODO List (Prioritized)

### High Priority - Immediate
1. ✅ Plan Phase 1 in detail with user input
2. ✅ Create API route for file upload (/api/v1/mri/upload)
3. ✅ Update navigation menu (remove blog items, add MRI items)
4. ✅ Create upload page component at /dashboard/upload
5. ✅ Implement file validation (format, size)
6. ✅ Add progress indicator for uploads

### High Priority - Next
7. ✅ Create "My Scans" page to list uploaded files
8. ✅ Build processing queue component  
9. ⏳ Implement polling for status updates
10. ⏳ Update dashboard home page (remove blog widgets)

## Current Implementation Status

**Core upload functionality is complete and functional!**

### What's Working:
- ✅ File upload with validation
- ✅ Progress tracking
- ✅ Storage in Supabase
- ✅ Database record creation
- ✅ Navigation updated
- ✅ User-friendly drag & drop interface

### Issues Found:
- ✅ Upload page missing dashboard layout (no navigation/header) - FIXED

### Ready for Testing:
The upload system can now be tested end-to-end. Users can:
1. Navigate to /dashboard/upload
2. Drag/drop .nii.gz files
3. See upload progress
4. Get success confirmation
5. Files stored in Supabase with user authentication

### Latest Updates:
- ✅ Upload page now follows posts directory structure
- ✅ Added layout.tsx with AppBar/AppPanel
- ✅ Page.tsx has proper Title/Description/Separator
- ✅ Client component handles upload functionality
- ✅ Simplified UI - removed unnecessary "Select Files" card wrapper
- ✅ Clean interface with direct drop area and info box
- ✅ "My Scans" page created at /dashboard/scans
- ✅ Lists uploaded files from nifti_files table
- ✅ Shows processing status with badges and icons
- ✅ Handles empty state with call-to-action
- ✅ Processing queue component integrated

### Medium Priority - Later
11. ⏳ Create Results page structure
12. ⏳ Add Inngest JS SDK integration
13. ⏳ Create API endpoint to trigger inngest pipeline
14. ⏳ Connect upload flow to inngest trigger

### Phase 2 & 3 (Future)
15. ⏳ Real-time pipeline status tracking
16. ⏳ FreeSurfer results display components
17. ⏳ Integrate 3D brain visualization
18. ⏳ Data charts and analysis views

## Pipeline Status Implementation Plan

### Current State
- `nifti_files` table has no status field
- Processing happens in cerebro-engine via Inngest
- Results stored in `freesurfer_*` tables when complete

### Status Detection Strategy
We'll infer status by checking multiple sources:

1. **Pending** (default)
   - File exists in `nifti_files`
   - No Inngest run ID stored
   - No results in freesurfer tables

2. **Processing**
   - Inngest run ID exists (stored in localStorage/session)
   - Query Inngest API for run status
   - No results in freesurfer tables yet

3. **Completed**
   - Results exist in any `freesurfer_*` table for this `nifti_file_id`
   - Can query: `freesurfer_global_measures`, `freesurfer_summary_stats`, etc.

4. **Error**
   - Inngest run failed (via API check)
   - OR timeout exceeded with no results (e.g., >3 hours)

### Implementation Steps

#### 1. Enhance GET /api/v1/mri endpoint
```typescript
// For each file, check:
// - Query freesurfer_summary_stats for results
// - Check localStorage/session for Inngest run IDs
// - Return inferred status with each file
```

#### 2. Store Inngest Run IDs
When triggering pipeline in POST endpoint:
- Get Inngest run ID from response
- Store mapping: `fileId -> runId` in localStorage
- Pass to frontend for tracking

#### 3. Add Status Checking Logic
```typescript
async function getFileStatus(fileId: string, inngestRunId?: string) {
  // Check for results first (fastest check)
  const results = await supabase
    .from('freesurfer_summary_stats')
    .select('id')
    .eq('nifti_file_id', fileId)
    .single()
  
  if (results.data) return 'completed'
  
  // Check Inngest if we have run ID
  if (inngestRunId) {
    const inngestStatus = await checkInngestRun(inngestRunId)
    if (inngestStatus === 'running') return 'processing'
    if (inngestStatus === 'failed') return 'error'
  }
  
  return 'pending'
}
```

#### 4. Frontend Polling
- Poll every 10 seconds while any status is 'processing' or 'pending'
- Store Inngest run IDs in component state
- Update UI reactively

### Alternative Approaches Considered
1. **Add status field to nifti_files** - Requires schema migration
2. **Create status tracking table** - More complex, requires coordination with cerebro-engine
3. **Use Inngest webhooks** - Would need webhook endpoint and real-time updates
