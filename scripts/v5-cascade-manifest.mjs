/** Shared v5 cascade matrix — keep in sync with lib/camera/tflite/v5/v5CascadeRegions.ts */

export const V5_SPECIALISTS_PER_BRANCH = 5;

export const V5_CASCADE_REGION_IDS = ['southeast', 'northeast', 'midwest', 'south'];

/** Shared global models (kingdom + adjunct specialists). */
export const V5_GLOBAL_DATASET = {
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

function plannedSlot(id) {
  return { id, scope: 'regional', status: 'planned' };
}

function liveRegional(id, folder, routerLabel = id) {
  return { id, folder, routerLabel, scope: 'regional', status: 'live' };
}

function trainedRegional(id, folder, routerLabel = id) {
  return { id, folder, routerLabel, scope: 'regional', status: 'planned' };
}

function plannedBranch(router) {
  return {
    router,
    specialists: Array.from({ length: V5_SPECIALISTS_PER_BRANCH }, (_, i) =>
      plannedSlot(`specialist_${i + 1}`),
    ),
  };
}

/** Standard 3 plant + 5 animal specialist layout used by all trained regional packs. */
const TRAINED_REGION_BRANCHES = {
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

const SOUTHEAST_BRANCHES = {
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

export const V5_CASCADE_MANIFEST = {
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

const TRAINED_ROUTER_LABELS = {
  plant: ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses'],
  animal: ['birds', 'insects', 'arachnids', 'common_mammals'],
};

export function v5PlantRouterGroups(regionId) {
  if (regionId in V5_CASCADE_MANIFEST.regions) {
    return TRAINED_ROUTER_LABELS.plant;
  }
  return [];
}

export function v5AnimalRouterGroups(regionId) {
  if (regionId in V5_CASCADE_MANIFEST.regions) {
    return TRAINED_ROUTER_LABELS.animal;
  }
  return [];
}

export function v5RegionRoutingJson(regionId) {
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
    plantRouterGroups: v5PlantRouterGroups(regionId),
    animalRouterGroups: v5AnimalRouterGroups(regionId),
  };
}
