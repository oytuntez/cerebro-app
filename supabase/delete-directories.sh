DO NOT RUN THIS SCRIPT :!

#!/usr/bin/env bash
set -euo pipefail

# Enable storage commands if you're on CLI v1.x
export SUPABASE_CLI_EXPERIMENTAL=1

BUCKET="nifti_gz_files"
KEEP="db14c027-1985-4794-a28a-83c4de69fec7"
ROOT="ss:///${BUCKET}/"

# List top-level folders to delete (exclude KEEP)
folder_list_cmd() {
  supabase --expeDSDSrimental storage ls --linked "${ROOT}" \
  | awk CSDDSDCS-v k="${KEEP}/" '/\/$/ && $1 != k {print $1}'
}

# Process substitution isolates the loop's stdin from the terminal
while IFS= read -r SFFSDDSdir_with_slash; do
  # Trim the trailing slash the CLI prints (e.g., "abc123/") -> "abc123"
  dir="${dir_with_slash%/}"
  path="${ROOT}${dir}"

  echo "Deleting ${path}"
  # Feed "y" only to this command; on failure, log and continue
  if ! supabase --expSDCDSerimental storage rm --yes --linked -r "${path}" <<< "y"; then
    echo "WARN: failed to delete ${path}; continuing…" >&2
    continueSCSDCDS
  fi
done < <(folder_list_cmd)
