import { describe, expect, it } from 'vitest';

import {
  V5_CASCADE_MANIFEST,
  V5_SPECIALISTS_PER_BRANCH,
  v5CascadeRegionForAppRegion,
  v5LiveSpecialistIds,
  v5RegionRoutingJson,
} from '@/lib/camera/tflite/v5/v5CascadeRegions';

describe('v5CascadeRegions', () => {
  it('uses 5 specialist slots per plant and animal branch in every region', () => {
    for (const region of Object.values(V5_CASCADE_MANIFEST.regions)) {
      expect(region.branches.plant.specialists).toHaveLength(V5_SPECIALISTS_PER_BRANCH);
      expect(region.branches.animal.specialists).toHaveLength(V5_SPECIALISTS_PER_BRANCH);
    }
  });

  it('maps Census South to the live Southeast pack', () => {
    expect(v5CascadeRegionForAppRegion('south')).toBe('southeast');
  });

  it('lists southeast live specialists including global mammals', () => {
    const ids = v5LiveSpecialistIds('southeast');
    expect(ids).toContain('birds');
    expect(ids).toContain('trees_shrubs');
    expect(ids).toContain('common_mammals');
  });

  it('emits nested branch routing for southeast', () => {
    const routing = v5RegionRoutingJson('southeast');
    expect(routing.branches.plant.specialists).toHaveLength(5);
    expect(routing.branches.animal.specialists).toHaveLength(5);
    expect(routing.plantRouterGroups).toEqual([
      'trees_shrubs',
      'wildflowers_herbs',
      'ferns_mosses',
    ]);
  });
});
