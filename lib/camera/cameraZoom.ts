import type { CameraDevice } from 'react-native-vision-camera';

export type ZoomChip = {
  id: string;
  label: string;
  /** Vision Camera zoom factor. */
  zoom: number;
};

export function clampZoom(zoom: number, device: CameraDevice): number {
  return Math.min(device.maxZoom, Math.max(device.minZoom, zoom));
}

/** Preset zoom steps shown as 1× / 2× / 5× relative to the device's neutral zoom. */
export function buildZoomChips(device: CameraDevice): ZoomChip[] {
  const neutral = device.neutralZoom;
  const multipliers = [1, 2, 5] as const;
  const chips: ZoomChip[] = [];

  for (const multiplier of multipliers) {
    const zoom = clampZoom(neutral * multiplier, device);
    const duplicate = chips.some((c) => Math.abs(c.zoom - zoom) < 0.08);
    if (duplicate) continue;
    chips.push({
      id: `x${multiplier}`,
      label: `${multiplier}×`,
      zoom,
    });
  }

  return chips.sort((a, b) => a.zoom - b.zoom);
}

/** User-facing magnification (1× = neutral zoom). */
export function displayZoomFactor(zoom: number, device: CameraDevice): number {
  const neutral = device.neutralZoom || 1;
  return zoom / neutral;
}

export function findActiveZoomChipId(chips: ZoomChip[], zoom: number): string | null {
  if (chips.length === 0) return null;
  let best = chips[0];
  let bestDelta = Math.abs(chips[0].zoom - zoom);
  for (const chip of chips) {
    const delta = Math.abs(chip.zoom - zoom);
    if (delta < bestDelta) {
      best = chip;
      bestDelta = delta;
    }
  }
  return bestDelta < 0.15 ? best.id : null;
}
