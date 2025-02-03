create table
    nifti_files (
                           id uuid not null,
                           file_type text not null default '''nii.gz''::text'::text,
                           user_id uuid null,
                           parent_nifti_file_id uuid null,
                           created_at timestamp with time zone not null default now(),
                           updated_at timestamp with time zone null default now(),
                           constraint nifti_files_pkey primary key (id),
                           constraint nifti_files_id_fkey foreign key (id) references storage.objects (id) on update cascade on delete cascade,
                           constraint nifti_files_parent_nitfi_file_id_fkey foreign key (parent_nifti_file_id) references nifti_files (id) on update cascade on delete cascade,
                           constraint nifti_files_user_id_fkey foreign key (user_id) references users (id) on update cascade on delete cascade
);

-- FUNCTION: get_file_type_among_children
CREATE
OR REPLACE FUNCTION get_file_type_among_children (p_nifti_file_id UUID, p_file_type text)
returns setof nifti_files
security definer set search_path = public
    as $$
DECLARE
    current_file nifti_files%ROWTYPE;
BEGIN
-- First, select the current file by ID
SELECT *
INTO current_file
FROM public.nifti_files
WHERE id = p_nifti_file_id;

-- Check if the current file exists and has the desired file_type
IF current_file IS NOT NULL AND current_file.file_type = p_file_type THEN
        RETURN QUERY
SELECT current_file.id, current_file.file_type, current_file.user_id, current_file.parent_nifti_file_id, current_file.created_at, current_file.created_at;
END IF;

    -- If not, check for children of the parent
IF current_file IS NOT NULL THEN
        RETURN QUERY
SELECT *
FROM public.nifti_files
WHERE (id = current_file.parent_nifti_file_id OR parent_nifti_file_id = current_file.parent_nifti_file_id)
  AND file_type = p_file_type
LIMIT 1;  -- Return only one matching row
ELSE
        -- If the current file does not exist, return NULL
        RETURN QUERY
SELECT NULL::uuid, NULL::text, NULL::uuid, NULL::uuid, NULL::timestamptz, NULL::timestamptz
WHERE FALSE;  -- This will return no rows
END IF;

    -- If the current file is a parent, check its children
RETURN QUERY
SELECT *
FROM public.nifti_files
WHERE file_type = p_file_type AND (id = p_nifti_file_id OR parent_nifti_file_id = p_nifti_file_id)
LIMIT 1;  -- Return only one matching row
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------
