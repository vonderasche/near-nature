/** Normalizes Vision Camera `PhotoFile.path` to a `file://` URI for expo-image / FileSystem. */
export function photoFileToUri(path: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith('file://')) return trimmed;
  return `file://${trimmed}`;
}
