import { mapDbNativeToSpeciesStatus } from '@/lib/detections/mapDbNativeToSpeciesStatus';
import type { DetectionGalleryItem, GalleryNativeCategory, SpeciesStatus } from '@/types';

export type { GalleryNativeCategory };

export function dbNativeStatusToGalleryCategory(dbValue: string): GalleryNativeCategory {
  return dbValue === 'native' ? 'native' : 'non-native';
}

export function speciesStatusToGalleryCategory(status: SpeciesStatus): GalleryNativeCategory {
  return status === 'native' ? 'native' : 'non-native';
}

export function formatGalleryNativeCategoryLabel(category: GalleryNativeCategory): string {
  return category === 'native' ? 'Native' : 'Non-native';
}

/** Short label for the detail sheet badge (native vs non-native). */
export function formatGalleryNativeBadgeLabel(category: GalleryNativeCategory): string {
  return formatGalleryNativeCategoryLabel(category);
}

/** Optional detail line when status is more specific than the badge. */
export function formatGalleryNativeDetailHint(status: SpeciesStatus): string | null {
  if (status === 'invasive') return 'Listed as invasive in your home state';
  if (status === 'unknown') return 'Native status could not be confirmed';
  return null;
}

export function splitGalleryByNativeCategory(items: readonly DetectionGalleryItem[]): {
  native: DetectionGalleryItem[];
  nonNative: DetectionGalleryItem[];
} {
  const native: DetectionGalleryItem[] = [];
  const nonNative: DetectionGalleryItem[] = [];
  for (const item of items) {
    if (item.nativeCategory === 'native') native.push(item);
    else nonNative.push(item);
  }
  return { native, nonNative };
}

export function mapRowNativeStatus(dbValue: string | null | undefined): {
  nativeStatus: SpeciesStatus;
  nativeCategory: GalleryNativeCategory;
} {
  const nativeStatus = mapDbNativeToSpeciesStatus(String(dbValue ?? 'unknown'));
  return {
    nativeStatus,
    nativeCategory: speciesStatusToGalleryCategory(nativeStatus),
  };
}
