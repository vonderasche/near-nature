import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

import {
  addPendingGalleryDetection,
  clearPendingGalleryDetectionsForUser,
  createPendingGalleryDetectionId,
  getPendingGalleryItems,
  mergePendingAndServerGalleryItems,
  removePendingGalleryDetection,
} from '@/lib/detections/pendingGalleryDetection';
import type { DetectionGalleryItem } from '@/types';

function serverItem(id: string): DetectionGalleryItem {
  return {
    id,
    imageUrl: `https://example.com/${id}.jpg`,
    displayUrl: `https://example.com/${id}.jpg`,
    detectedAt: '2024-01-01T00:00:00Z',
    commonName: 'Oak',
    latinName: 'Quercus',
    category: 'trees_shrubs',
    subcategory: 'trees_shrubs',
    mainCategory: 'botanist',
    description: null,
    nativeStatus: 'native',
    nativeCategory: 'native',
  };
}

describe('pendingGalleryDetection', () => {
  beforeEach(() => {
    clearPendingGalleryDetectionsForUser('user-1');
  });

  it('adds a pending tile with local display url', () => {
    const pendingId = createPendingGalleryDetectionId();
    addPendingGalleryDetection(pendingId, {
      userId: 'user-1',
      localImageUri: 'file:///photo.jpg',
      commonName: 'Blue Jay',
      latinName: 'Cyanocitta cristata',
      category: 'songbirds',
      subcategory: 'songbirds',
      mainCategory: 'ornithologist',
      description: null,
      nativeStatus: 'native',
    });

    const items = getPendingGalleryItems('user-1');
    expect(items).toHaveLength(1);
    expect(items[0]?.uploadStatus).toBe('pending');
    expect(items[0]?.displayUrl).toBe('file:///photo.jpg');
  });

  it('mergePendingAndServerGalleryItems puts pending first and drops duplicate ids', () => {
    const pendingId = createPendingGalleryDetectionId();
    addPendingGalleryDetection(pendingId, {
      userId: 'user-1',
      localImageUri: 'file:///p.jpg',
      commonName: 'Jay',
      latinName: 'Cyanocitta cristata',
      category: 'songbirds',
      subcategory: 'songbirds',
      mainCategory: 'ornithologist',
      description: null,
      nativeStatus: 'native',
    });
    const pending = getPendingGalleryItems('user-1');
    const merged = mergePendingAndServerGalleryItems(pending, [serverItem('real-1')]);
    expect(merged[0]?.uploadStatus).toBe('pending');
    expect(merged[1]?.id).toBe('real-1');
  });

  it('removePendingGalleryDetection clears entry', () => {
    const pendingId = createPendingGalleryDetectionId();
    addPendingGalleryDetection(pendingId, {
      userId: 'user-1',
      localImageUri: 'file:///p.jpg',
      commonName: 'Jay',
      latinName: 'Cyanocitta cristata',
      category: 'songbirds',
      subcategory: 'songbirds',
      mainCategory: 'ornithologist',
      description: null,
      nativeStatus: 'native',
    });
    removePendingGalleryDetection(pendingId, 'user-1');
    expect(getPendingGalleryItems('user-1')).toHaveLength(0);
  });
});
