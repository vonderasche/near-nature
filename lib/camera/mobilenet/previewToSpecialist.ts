import type { SpecialistAssetFolder } from '@/lib/camera/mobilenet/tfliteRouting';
import {
  resolveSpecialistForPreviewLabel as resolveRouting,
  TFLITE_ROUTING,
} from '@/lib/camera/mobilenet/tfliteRouting';

/** Resolves preview label → specialist asset folder (`null` when unrouted). */
export function resolveSpecialistForPreviewLabel(previewLabel: string): SpecialistAssetFolder | null {
  return resolveRouting(previewLabel).assetFolder;
}

export function getSpecialistDisplayNameForPreviewLabel(previewLabel: string): string | null {
  return resolveRouting(previewLabel).displayName;
}

export const SPECIALIST_DISPLAY_NAMES: Record<SpecialistAssetFolder, string> = (() => {
  const names = {} as Record<SpecialistAssetFolder, string>;
  for (const specialist of TFLITE_ROUTING.specialists) {
    const folder = specialist.id as SpecialistAssetFolder;
    names[folder] = specialist.title;
  }
  return names;
})();
