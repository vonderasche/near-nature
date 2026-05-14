import { manipulateAsync, SaveFormat, type ImageResult } from 'expo-image-manipulator';

/**
 * Crops a rectangular image to a centered square (min(width, height) edge).
 * If already square, returns the source URI without re-encoding.
 */
export async function cropImageToSquareCenter(
  sourceUri: string,
  width: number,
  height: number,
  compress = 0.92
): Promise<ImageResult> {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  const edge = Math.min(w, h);

  if (w === h) {
    return { uri: sourceUri, width: w, height: h };
  }

  const originX = Math.floor((w - edge) / 2);
  const originY = Math.floor((h - edge) / 2);

  return manipulateAsync(
    sourceUri,
    [{ crop: { originX, originY, width: edge, height: edge } }],
    { compress, format: SaveFormat.JPEG }
  );
}
