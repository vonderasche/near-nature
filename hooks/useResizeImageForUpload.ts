import { useCallback } from 'react';

import {
  resizeImageForUpload,
  type ResizeImageForUploadOptions,
} from '@/lib/image/resizeImageForUpload';
import type { ImageResult } from 'expo-image-manipulator';

export type UseResizeImageForUploadOptions = ResizeImageForUploadOptions;

export type UseResizeImageForUploadResult = {
  /** Resize/recompress a local `file://` image for vision API upload (returns new `uri` + dimensions). */
  resizeForUpload: (sourceUri: string) => Promise<ImageResult>;
};

/**
 * Prepares camera/library photos for vision API upload with strict size limits (web Gemini fallback).
 * Uses stable options via deps — memoize options in the caller if you pass an inline object.
 */
export function useResizeImageForUpload(
  opts?: UseResizeImageForUploadOptions
): UseResizeImageForUploadResult {
  const { maxEdge, maxBytes, compress } = opts ?? {};

  const resizeForUpload = useCallback(
    (sourceUri: string) =>
      resizeImageForUpload(sourceUri, {
        ...(maxEdge !== undefined ? { maxEdge } : {}),
        ...(maxBytes !== undefined ? { maxBytes } : {}),
        ...(compress !== undefined ? { compress } : {}),
      }),
    [maxEdge, maxBytes, compress]
  );

  return { resizeForUpload };
}
