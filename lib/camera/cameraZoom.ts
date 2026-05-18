import type { CameraDevice } from 'react-native-vision-camera';

/** UI zoom presets (always three chips; hardware may clamp the actual factor). */
export const ZOOM_PRESET_MULTIPLIERS = [1, 2, 5] as const;

export type ZoomChip = {
  id: string;
  label: string;
  /** Vision Camera zoom factor (may equal maxZoom when the device cannot optically zoom further). */
  zoom: number;
  /** Label multiplier (1, 2, or 5) for matching active chip when hardware zoom is limited. */
  multiplier: number;
};

export function clampZoom(zoom: number, device: CameraDevice): number {
  return Math.min(device.maxZoom, Math.max(device.minZoom, zoom));
}

/** Always returns 1× / 2× / 5× chips; zoom values are clamped to the device range. */
export function buildZoomChips(device: CameraDevice): ZoomChip[] {
  const neutral = device.neutralZoom || 1;

  return ZOOM_PRESET_MULTIPLIERS.map((multiplier) => ({
    id: `x${multiplier}`,
    label: `${multiplier}×`,
    zoom: clampZoom(neutral * multiplier, device),
    multiplier,
  }));
}

/** User-facing magnification (1× = neutral zoom). */
export function displayZoomFactor(zoom: number, device: CameraDevice): number {
  const neutral = device.neutralZoom || 1;
  return zoom / neutral;
}

export function findActiveZoomChipId(
  chips: ZoomChip[],
  zoom: number,
  device: CameraDevice,
): string | null {
  if (chips.length === 0) return null;

  const factor = displayZoomFactor(zoom, device);
  let best = chips[0];
  let bestDelta = Math.abs(best.multiplier - factor);

  for (const chip of chips) {
    const delta = Math.abs(chip.multiplier - factor);
    if (delta < bestDelta) {
      best = chip;
      bestDelta = delta;
    }
  }

  return best.id;
}
