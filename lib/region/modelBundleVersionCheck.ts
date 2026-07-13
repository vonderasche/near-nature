import type { RegionModelManifest } from '@/services/regionModelDownloadService';

function manifestFileKey(file: RegionModelManifest['files'][number]): string {
  return `${file.path}:${file.sha256 ?? ''}:${file.sizeBytes ?? ''}`;
}

/** True when the remote manifest differs from what is installed locally. */
export function modelBundleNeedsUpdate(
  local: RegionModelManifest | null,
  remote: RegionModelManifest | null,
): boolean {
  if (!remote?.version || !remote.files?.length) {
    return false;
  }
  if (!local?.version || !local.files?.length) {
    return true;
  }
  if (local.version !== remote.version) {
    return true;
  }
  if (local.bundle && remote.bundle && local.bundle !== remote.bundle) {
    return true;
  }

  const localFiles = new Map(local.files.map((file) => [file.path, manifestFileKey(file)]));
  for (const remoteFile of remote.files) {
    if (localFiles.get(remoteFile.path) !== manifestFileKey(remoteFile)) {
      return true;
    }
  }
  if (local.files.length !== remote.files.length) {
    return true;
  }
  return false;
}
