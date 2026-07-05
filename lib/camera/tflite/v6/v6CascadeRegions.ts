/**
 * v6 capture cascade layout: region → branch (plant | animal) → specialists.
 * National specialists (herps, lepidoptera, insects) always load from global/.
 */

import type { RegionPackId } from '@/constants/regions';

export const V6_CASCADE_REGION_IDS = ['southeast', 'northeast', 'midwest', 'southwest'] as const;

export type V6CascadeRegionId = (typeof V6_CASCADE_REGION_IDS)[number];

export type V6CascadeManifest = {
  version: 'v6';
  cascadeRegionIds: readonly V6CascadeRegionId[];
  appRegionToCascade: Record<RegionPackId, V6CascadeRegionId>;
  nationalSpecialists: readonly string[];
  regionalSpecialists: readonly string[];
};

export const V6_CASCADE_MANIFEST: V6CascadeManifest = {
  version: 'v6',
  cascadeRegionIds: V6_CASCADE_REGION_IDS,
  appRegionToCascade: {
    south: 'southeast',
    northeast: 'northeast',
    midwest: 'midwest',
    west: 'southwest',
  },
  nationalSpecialists: ['herps', 'lepidoptera', 'insects', 'common_mammals'],
  regionalSpecialists: ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses', 'birds', 'arachnids'],
};

export function v6CascadeRegionForAppRegion(appRegionId: string): V6CascadeRegionId {
  const mapped = V6_CASCADE_MANIFEST.appRegionToCascade[appRegionId as RegionPackId];
  if (mapped) {
    return mapped;
  }
  if (appRegionId === 'southeast') {
    return 'southeast';
  }
  if (appRegionId === 'southwest' || appRegionId === 'northwest') {
    return 'southwest';
  }
  return 'southeast';
}

export function v6RegionRoutingJson(cascadeRegionId: V6CascadeRegionId) {
  return {
    version: 'v6',
    cascadeRegionId,
    nationalSpecialists: V6_CASCADE_MANIFEST.nationalSpecialists,
    regionalSpecialists: V6_CASCADE_MANIFEST.regionalSpecialists,
    plantRouterGroups: ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses'],
    animalRouterGroups: ['birds', 'insects', 'arachnids', 'common_mammals'],
  };
}
