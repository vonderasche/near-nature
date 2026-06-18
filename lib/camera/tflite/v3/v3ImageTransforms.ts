export function resizeShortEdgeDimensions(
  width: number,
  height: number,
  shortEdge: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: shortEdge, height: shortEdge };
  }

  if (width < height) {
    return {
      width: shortEdge,
      height: Math.max(1, Math.round((height * shortEdge) / width)),
    };
  }

  return {
    width: Math.max(1, Math.round((width * shortEdge) / height)),
    height: shortEdge,
  };
}

export function centerCropRgba(
  rgba: Uint8Array,
  srcWidth: number,
  srcHeight: number,
  cropSize: number,
): Uint8Array {
  const left = Math.max(0, Math.floor((srcWidth - cropSize) / 2));
  const top = Math.max(0, Math.floor((srcHeight - cropSize) / 2));
  const out = new Uint8Array(cropSize * cropSize * 4);

  for (let y = 0; y < cropSize; y += 1) {
    for (let x = 0; x < cropSize; x += 1) {
      const srcX = Math.min(srcWidth - 1, left + x);
      const srcY = Math.min(srcHeight - 1, top + y);
      const srcIdx = (srcY * srcWidth + srcX) * 4;
      const dstIdx = (y * cropSize + x) * 4;
      out[dstIdx] = rgba[srcIdx] ?? 0;
      out[dstIdx + 1] = rgba[srcIdx + 1] ?? 0;
      out[dstIdx + 2] = rgba[srcIdx + 2] ?? 0;
      out[dstIdx + 3] = rgba[srcIdx + 3] ?? 255;
    }
  }

  return out;
}

export function rgbaToNormalizedFloat32Nhwc(
  rgba: Uint8Array,
  width: number,
  height: number,
  normalization: { mean: [number, number, number]; std: [number, number, number] },
): ArrayBuffer {
  const pixelCount = width * height;
  const out = new Float32Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i += 1) {
    const rgbaOffset = i * 4;
    const rgbOffset = i * 3;
    const r = (rgba[rgbaOffset] ?? 0) / 255;
    const g = (rgba[rgbaOffset + 1] ?? 0) / 255;
    const b = (rgba[rgbaOffset + 2] ?? 0) / 255;

    out[rgbOffset] = (r - normalization.mean[0]) / normalization.std[0];
    out[rgbOffset + 1] = (g - normalization.mean[1]) / normalization.std[1];
    out[rgbOffset + 2] = (b - normalization.mean[2]) / normalization.std[2];
  }

  return out.buffer;
}
