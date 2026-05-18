import { describe, expect, it } from 'vitest';

import {
  dbNativeStatusToGalleryCategory,
  formatGalleryNativeBadgeLabel,
  formatGalleryNativeDetailHint,
  mapRowNativeStatus,
  splitGalleryByNativeCategory,
} from '@/lib/detections/galleryNativeCategory';
import type { DetectionGalleryItem } from '@/types';

function item(id: string, category: 'native' | 'non-native'): DetectionGalleryItem {
  return {
    id,
    imageUrl: 'x',
    displayUrl: 'x',
    detectedAt: '2026-01-01T00:00:00Z',
    commonName: 'A',
    latinName: 'a',
    category: 'other',
    subcategory: null,
    mainCategory: null,
    description: null,
    nativeStatus: category === 'native' ? 'native' : 'unknown',
    nativeCategory: category,
  };
}

describe('galleryNativeCategory', () => {
  it('maps DB enum to gallery categories', () => {
    expect(dbNativeStatusToGalleryCategory('native')).toBe('native');
    expect(dbNativeStatusToGalleryCategory('invasive')).toBe('non-native');
    expect(dbNativeStatusToGalleryCategory('unknown')).toBe('non-native');
  });

  it('maps row native_status to status + category', () => {
    expect(mapRowNativeStatus('native')).toEqual({
      nativeStatus: 'native',
      nativeCategory: 'native',
    });
    expect(mapRowNativeStatus('invasive')).toEqual({
      nativeStatus: 'invasive',
      nativeCategory: 'non-native',
    });
  });

  it('splits gallery items', () => {
    const { native, nonNative } = splitGalleryByNativeCategory([
      item('1', 'native'),
      item('2', 'non-native'),
      item('3', 'native'),
    ]);
    expect(native.map((i) => i.id)).toEqual(['1', '3']);
    expect(nonNative.map((i) => i.id)).toEqual(['2']);
  });

  it('formats badge and hints', () => {
    expect(formatGalleryNativeBadgeLabel('native')).toBe('Native');
    expect(formatGalleryNativeBadgeLabel('non-native')).toBe('Non-native');
    expect(formatGalleryNativeDetailHint('invasive')).toContain('invasive');
    expect(formatGalleryNativeDetailHint('native')).toBeNull();
  });
});
