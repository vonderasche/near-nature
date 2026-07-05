/**
 * v5 capture cascade layout: region → branch (plant | animal) → 5 specialist slots.
 * Matches the product matrix (Southeast, Northeast, Midwest, South × animal/plant × 5).
 */

export const V5_SPECIALISTS_PER_BRANCH = 5 as const;

export const V5_CASCADE_BRANCHES = ['plant', 'animal'] as const;
export type V5CascadeBranch = (typeof V5_CASCADE_BRANCHES)[number];

/** Model-pack region ids (may differ from Census {@link RegionPackId}). */
export const V5_CASCADE_REGION_IDS = ['southeast', 'northeast', 'midwest', 'south'] as const;
export type V5CascadeRegionId = (typeof V5_CASCADE_REGION_IDS)[number];

export type V5GlobalModel = {
  id: string;
  folder: string;
  tflite: string;
  scope: 'global';
  status: 'live' | 'planned';
};

export type V5GlobalDataset = {
  label: string;
  status: 'live' | 'planned';
  models: readonly V5GlobalModel[];
};

export type V5CascadeSpecialistSlot = {
  id: string;
  /** Router output label when this specialist is routable today. */
  routerLabel?: string;
  folder?: string;
  scope: 'regional' | 'global';
  status: 'live' | 'planned';
};

export type V5CascadeBranchConfig = {
  router: string;
  specialists: readonly V5CascadeSpecialistSlot[];
};

export type V5CascadeRegionConfig = {
  label: string;
  /** Census region that downloads this pack (when live). */
  appRegionId: 'south' | 'northeast' | 'midwest' | 'west' | null;
  status: 'live' | 'planned';
  kingdomModel: string;
  branches: Record<V5CascadeBranch, V5CascadeBranchConfig>;
  /** Global specialists referenced from animal router (not counted in the 5 regional slots). */
  globalSpecialists?: Record<string, { folder: string; scope: 'global' }>;
};

export type V5CascadeManifest = {
  version: 'v5';
  specialistsPerBranch: typeof V5_SPECIALISTS_PER_BRANCH;
  globalDataset: V5GlobalDataset;
  regions: Record<V5CascadeRegionId, V5CascadeRegionConfig>;
};

function plannedSlot(id: string): V5CascadeSpecialistSlot {
  return { id, scope: 'regional', status: 'planned' };
}

function liveRegional(
  id: string,
  folder: string,
  routerLabel?: string,
): V5CascadeSpecialistSlot {
  return {
    id,
    folder,
    routerLabel: routerLabel ?? id,
    scope: 'regional',
    status: 'live',
  };
}

function trainedRegional(
  id: string,
  folder: string,
  routerLabel?: string,
): V5CascadeSpecialistSlot {
  return {
    id,
    folder,
    routerLabel: routerLabel ?? id,
    scope: 'regional',
    status: 'planned',
  };
}

/** Standard 3 plant + 5 animal specialist layout for trained regional packs. */
const TRAINED_REGION_BRANCHES: Record<V5CascadeBranch, V5CascadeBranchConfig> = {
  plant: {
    router: 'step02_plant_router/tflite/plant_router.tflite',
    specialists: [
      trainedRegional('trees_shrubs', 'trees_shrubs'),
      trainedRegional('wildflowers_herbs', 'wildflowers_herbs'),
      trainedRegional('ferns_mosses', 'ferns_mosses'),
    ],
  },
  animal: {
    router: 'step03_animal_router/tflite/animal_router.tflite',
    specialists: [
      trainedRegional('birds', 'birds'),
      trainedRegional('herps', 'herps'),
      trainedRegional('insects', 'insects'),
      trainedRegional('lepidoptera', 'lepidoptera'),
      trainedRegional('arachnids', 'arachnids'),
    ],
  },
};

/** Southeast — only live pack today (serves Census South in the app). */
const SOUTHEAST_BRANCHES: Record<V5CascadeBranch, V5CascadeBranchConfig> = {
  plant: {
    router: 'step02_plant_router/tflite/plant_router.tflite',
    specialists: [
      liveRegional('trees_shrubs', 'trees_shrubs'),
      liveRegional('wildflowers_herbs', 'wildflowers_herbs'),
      liveRegional('ferns_mosses', 'ferns_mosses'),
    ],
  },
  animal: {
    router: 'step03_animal_router/tflite/animal_router.tflite',
    specialists: [
      liveRegional('birds', 'birds'),
      liveRegional('herps', 'herps'),
      liveRegional('insects', 'insects'),
      liveRegional('lepidoptera', 'lepidoptera'),
      liveRegional('arachnids', 'arachnids'),
    ],
  },
};

export const V5_GLOBAL_DATASET: V5GlobalDataset = {
  label: 'Global',
  status: 'live',
  models: [
    {
      id: 'kingdom',
      folder: 'step01_kingdom',
      tflite: 'kingdom.tflite',
      scope: 'global',
      status: 'live',
    },
    {
      id: 'common_mammals',
      folder: 'common_mammals',
      tflite: 'common_mammals.tflite',
      scope: 'global',
      status: 'live',
    },
  ],
};

export const V5_CASCADE_MANIFEST: V5CascadeManifest = {
  version: 'v5',
  specialistsPerBranch: V5_SPECIALISTS_PER_BRANCH,
  globalDataset: V5_GLOBAL_DATASET,
  regions: {
    southeast: {
      label: 'Southeast',
      appRegionId: 'south',
      status: 'live',
      kingdomModel: 'global/step01_kingdom/tflite/kingdom.tflite',
      branches: SOUTHEAST_BRANCHES,
      globalSpecialists: {
        common_mammals: { folder: 'common_mammals', scope: 'global' },
      },
    },
    northeast: {
      label: 'Northeast',
      appRegionId: 'northeast',
      status: 'planned',
      kingdomModel: 'global/step01_kingdom/tflite/kingdom.tflite',
      branches: TRAINED_REGION_BRANCHES,
      globalSpecialists: {
        common_mammals: { folder: 'common_mammals', scope: 'global' },
      },
    },
    midwest: {
      label: 'Midwest',
      appRegionId: 'midwest',
      status: 'planned',
      kingdomModel: 'global/step01_kingdom/tflite/kingdom.tflite',
      branches: TRAINED_REGION_BRANCHES,
      globalSpecialists: {
        common_mammals: { folder: 'common_mammals', scope: 'global' },
      },
    },
    south: {
      label: 'South',
      appRegionId: 'south',
      status: 'planned',
      kingdomModel: 'global/step01_kingdom/tflite/kingdom.tflite',
      branches: TRAINED_REGION_BRANCHES,
      globalSpecialists: {
        common_mammals: { folder: 'common_mammals', scope: 'global' },
      },
    },
  },
};

const TRAINED_PLANT_ROUTER_LABELS = ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses'] as const;
const TRAINED_ANIMAL_ROUTER_LABELS = ['birds', 'insects', 'arachnids', 'common_mammals'] as const;

/** Router labels the trained animal router can emit (excludes not_animal). */
export function v5AnimalRouterLabelsForRegion(_regionId: V5CascadeRegionId): string[] {
  return [...TRAINED_ANIMAL_ROUTER_LABELS];
}

/** Router labels the trained plant router can emit (excludes not_plant). */
export function v5PlantRouterLabelsForRegion(_regionId: V5CascadeRegionId): string[] {
  return [...TRAINED_PLANT_ROUTER_LABELS];
}

export function v5CascadeRegionForAppRegion(
  appRegionId: string,
): V5CascadeRegionId | null {
  for (const [cascadeId, config] of Object.entries(V5_CASCADE_MANIFEST.regions)) {
    if (config.appRegionId === appRegionId && config.status === 'live') {
      return cascadeId as V5CascadeRegionId;
    }
  }
  if (appRegionId === 'south') return 'southeast';
  return null;
}

export function v5LiveSpecialistIds(regionId: V5CascadeRegionId): string[] {
  const region = V5_CASCADE_MANIFEST.regions[regionId];
  const ids: string[] = [];
  for (const branch of V5_CASCADE_BRANCHES) {
    for (const slot of region.branches[branch].specialists) {
      if (slot.status === 'live' && slot.id) ids.push(slot.id);
    }
  }
  if (region.globalSpecialists) {
    ids.push(...Object.keys(region.globalSpecialists));
  }
  return ids;
}

/** Per-region routing.json shape (nested branches). */
export function v5RegionRoutingJson(regionId: V5CascadeRegionId) {
  const region = V5_CASCADE_MANIFEST.regions[regionId];
  return {
    version: 'v5',
    regionId,
    label: region.label,
    appRegionId: region.appRegionId,
    status: region.status,
    kingdomModel: region.kingdomModel,
    specialistsPerBranch: V5_SPECIALISTS_PER_BRANCH,
    branches: region.branches,
    globalSpecialists: region.globalSpecialists ?? {},
    plantRouterGroups: v5PlantRouterLabelsForRegion(regionId),
    animalRouterGroups: v5AnimalRouterLabelsForRegion(regionId),
  };
}
