-- FreeSurfer Database Tables
-- Tables to store parsed FreeSurfer statistics and measurements

-- Global brain measurements (from aseg.stats, brainvol.stats)
CREATE TABLE IF NOT EXISTS freesurfer_global_measures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nifti_file_id UUID NOT NULL REFERENCES nifti_files(id),
    measure_name TEXT NOT NULL,
    measure_field TEXT NOT NULL,
    value FLOAT NOT NULL,
    unit TEXT,
    source_file TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nifti_file_id, measure_name)
);

-- Cortical regional measurements (from aparc.stats files)
CREATE TABLE IF NOT EXISTS freesurfer_cortical_regions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nifti_file_id UUID NOT NULL REFERENCES nifti_files(id),
    hemisphere TEXT NOT NULL CHECK (hemisphere IN ('lh', 'rh')),
    structure_name TEXT NOT NULL,
    atlas TEXT NOT NULL DEFAULT 'aparc',
    num_vertices INTEGER,
    surface_area FLOAT,
    gray_vol FLOAT,
    thick_avg FLOAT,
    thick_std FLOAT,
    mean_curv FLOAT,
    gauss_curv FLOAT,
    fold_ind INTEGER,
    curv_ind FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nifti_file_id, hemisphere, structure_name, atlas)
);

-- Subcortical segmentations (from aseg.stats)
CREATE TABLE IF NOT EXISTS freesurfer_subcortical_segmentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nifti_file_id UUID NOT NULL REFERENCES nifti_files(id),
    seg_id INTEGER NOT NULL,
    structure_name TEXT NOT NULL,
    nvoxels INTEGER,
    volume_mm3 FLOAT,
    norm_mean FLOAT,
    norm_stddev FLOAT,
    norm_min FLOAT,
    norm_max FLOAT,
    norm_range FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nifti_file_id, seg_id)
);

-- Surface curvature statistics (from curv.stats files)
CREATE TABLE IF NOT EXISTS freesurfer_curvature_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nifti_file_id UUID NOT NULL REFERENCES nifti_files(id),
    hemisphere TEXT NOT NULL CHECK (hemisphere IN ('lh', 'rh')),
    curv_mean FLOAT,
    curv_std FLOAT,
    curv_min FLOAT,
    curv_min_vertex INTEGER,
    curv_max FLOAT,
    curv_max_vertex INTEGER,
    surface_area FLOAT,
    num_vertices INTEGER,
    vertex_area FLOAT,
    vertex_separation_mean FLOAT,
    vertex_separation_std FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nifti_file_id, hemisphere)
);

-- Summary statistics for quick access
CREATE TABLE IF NOT EXISTS freesurfer_summary_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nifti_file_id UUID NOT NULL REFERENCES nifti_files(id),
    total_brain_volume FLOAT,
    total_cortex_volume FLOAT,
    total_white_matter FLOAT,
    estimated_total_intracranial_volume FLOAT,
    lh_cortex_volume FLOAT,
    lh_surface_area FLOAT,
    lh_mean_thickness FLOAT,
    rh_cortex_volume FLOAT,
    rh_surface_area FLOAT,
    rh_mean_thickness FLOAT,
    lh_mean_curvature FLOAT,
    lh_surface_area_from_curv FLOAT,
    rh_mean_curvature FLOAT,
    rh_surface_area_from_curv FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nifti_file_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_freesurfer_global_measures_nifti_file_id ON freesurfer_global_measures(nifti_file_id);
CREATE INDEX IF NOT EXISTS idx_freesurfer_global_measures_measure_name ON freesurfer_global_measures(measure_name);

CREATE INDEX IF NOT EXISTS idx_freesurfer_cortical_regions_nifti_file_id ON freesurfer_cortical_regions(nifti_file_id);
CREATE INDEX IF NOT EXISTS idx_freesurfer_cortical_regions_hemisphere ON freesurfer_cortical_regions(hemisphere);
CREATE INDEX IF NOT EXISTS idx_freesurfer_cortical_regions_structure ON freesurfer_cortical_regions(structure_name);
CREATE INDEX IF NOT EXISTS idx_freesurfer_cortical_regions_atlas ON freesurfer_cortical_regions(atlas);

CREATE INDEX IF NOT EXISTS idx_freesurfer_subcortical_segmentations_nifti_file_id ON freesurfer_subcortical_segmentations(nifti_file_id);
CREATE INDEX IF NOT EXISTS idx_freesurfer_subcortical_segmentations_structure ON freesurfer_subcortical_segmentations(structure_name);

CREATE INDEX IF NOT EXISTS idx_freesurfer_curvature_stats_nifti_file_id ON freesurfer_curvature_stats(nifti_file_id);
CREATE INDEX IF NOT EXISTS idx_freesurfer_curvature_stats_hemisphere ON freesurfer_curvature_stats(hemisphere);

CREATE INDEX IF NOT EXISTS idx_freesurfer_summary_stats_nifti_file_id ON freesurfer_summary_stats(nifti_file_id);

-- Row Level Security (RLS) - users can only see their own data
ALTER TABLE freesurfer_global_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE freesurfer_cortical_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE freesurfer_subcortical_segmentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE freesurfer_curvature_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE freesurfer_summary_stats ENABLE ROW LEVEL SECURITY;

-- Policies for freesurfer_global_measures
CREATE POLICY "Users can view their own FreeSurfer global measures" ON freesurfer_global_measures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_global_measures.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own FreeSurfer global measures" ON freesurfer_global_measures
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_global_measures.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own FreeSurfer global measures" ON freesurfer_global_measures
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_global_measures.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

-- Policies for freesurfer_cortical_regions
CREATE POLICY "Users can view their own FreeSurfer cortical regions" ON freesurfer_cortical_regions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_cortical_regions.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own FreeSurfer cortical regions" ON freesurfer_cortical_regions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_cortical_regions.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own FreeSurfer cortical regions" ON freesurfer_cortical_regions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_cortical_regions.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

-- Policies for freesurfer_subcortical_segmentations
CREATE POLICY "Users can view their own FreeSurfer subcortical segmentations" ON freesurfer_subcortical_segmentations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_subcortical_segmentations.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own FreeSurfer subcortical segmentations" ON freesurfer_subcortical_segmentations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_subcortical_segmentations.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own FreeSurfer subcortical segmentations" ON freesurfer_subcortical_segmentations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_subcortical_segmentations.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

-- Policies for freesurfer_curvature_stats
CREATE POLICY "Users can view their own FreeSurfer curvature stats" ON freesurfer_curvature_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_curvature_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own FreeSurfer curvature stats" ON freesurfer_curvature_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_curvature_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own FreeSurfer curvature stats" ON freesurfer_curvature_stats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_curvature_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

-- Policies for freesurfer_summary_stats
CREATE POLICY "Users can view their own FreeSurfer summary stats" ON freesurfer_summary_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_summary_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own FreeSurfer summary stats" ON freesurfer_summary_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_summary_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own FreeSurfer summary stats" ON freesurfer_summary_stats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM nifti_files 
            WHERE nifti_files.id = freesurfer_summary_stats.nifti_file_id 
            AND nifti_files.user_id = auth.uid()
        )
    );