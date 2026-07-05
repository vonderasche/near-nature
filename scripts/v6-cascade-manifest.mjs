/** Shared v6 cascade manifest for sync scripts — keep aligned with v6CascadeRegions.ts */
export const V6_CASCADE_MANIFEST = {
  version: 'v6',
  cascadeRegionIds: ['southeast', 'northeast', 'midwest', 'southwest'],
  appRegionToCascade: {
    south: 'southeast',
    northeast: 'northeast',
    midwest: 'midwest',
    west: 'southwest',
  },
  nationalSpecialists: ['herps', 'lepidoptera', 'insects', 'common_mammals'],
  regionalSpecialists: [
    'trees_shrubs',
    'wildflowers_herbs',
    'ferns_mosses',
    'birds',
    'arachnids',
  ],
};

export const V6_GLOBAL_FOLDERS = [
  'step01_kingdom',
  'step02_plant_router',
  'step03_animal_router',
  'trees_shrubs',
  'wildflowers_herbs',
  'ferns_mosses',
  'birds',
  'herps',
  'insects',
  'lepidoptera',
  'arachnids',
  'common_mammals',
];

export const V6_REGIONAL_FOLDERS = [
  'step02_plant_router',
  'step03_animal_router',
  'trees_shrubs',
  'wildflowers_herbs',
  'ferns_mosses',
  'birds',
  'arachnids',
];

export function v6TfliteBase(folder) {
  if (folder === 'step01_kingdom') return 'kingdom';
  if (folder === 'step02_plant_router') return 'plant_router';
  if (folder === 'step03_animal_router') return 'animal_router';
  return folder;
}

export function v6RegionRoutingJson(cascadeRegionId) {
  return {
    version: 'v6',
    cascadeRegionId,
    nationalSpecialists: V6_CASCADE_MANIFEST.nationalSpecialists,
    regionalSpecialists: V6_CASCADE_MANIFEST.regionalSpecialists,
    plantRouterGroups: ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses'],
    animalRouterGroups: ['birds', 'insects', 'arachnids', 'common_mammals'],
  };
}
