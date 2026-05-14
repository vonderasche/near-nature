/**
 * Boundary for Expo SDK 54 `expo-file-system/legacy` usage. App code imports from here so a future
 * migration to the new FileSystem API can be done in one place.
 */
import {
  deleteAsync,
  EncodingType,
  getInfoAsync,
  readAsStringAsync,
} from 'expo-file-system/legacy';

export { deleteAsync, EncodingType, getInfoAsync, readAsStringAsync };

export async function readLocalFileAsBase64(uri: string): Promise<string> {
  return readAsStringAsync(uri, { encoding: EncodingType.Base64 });
}
