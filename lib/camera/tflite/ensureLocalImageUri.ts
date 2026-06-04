import * as FileSystem from 'expo-file-system/legacy';

/**
 * Normalizes picker/camera URIs for ImageManipulator and TFLite.
 * Copies `content://` and other non-file URIs into the app cache as JPEG.
 */
export async function ensureLocalImageUri(uri: string): Promise<string> {
  if (uri.startsWith('file://')) {
    return uri;
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache directory is unavailable.');
  }

  const dest = `${cacheDir}still_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
