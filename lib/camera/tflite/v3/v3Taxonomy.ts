import type { SubcategoryId } from '@/constants/naturalist-categories';
import type { ClassificationResult } from '@/types';
import type { VisionTaxonGroup } from '@/types';

/** Router group ids used for kingdom-preview subcategory mapping. */
export const V3_SPECIALIST_GROUPS = [
  'birds',
  'dryland_plants',
  'ferns_mosses',
  'fish',
  'fungi',
  'herbaceous',
  'herps',
  'insects_arachnids',
  'lepidoptera',
  'mammals',
  'trees_shrubs',
] as const;

export type V3SpecialistGroup = (typeof V3_SPECIALIST_GROUPS)[number];

export function v3KingdomToTaxonGroup(kingdom: string): VisionTaxonGroup {
  if (kingdom === 'plantae') return 'plants';
  if (kingdom === 'fungi') return 'fungi';
  return 'animals';
}

const KINGDOM_PREVIEW_DISPLAY: Readonly<Record<string, string>> = {
  plantae: 'Plant',
  animalia: 'Animal',
  fungi: 'Fungi',
  uncertain: 'Uncertain',
};

export function formatV3KingdomPreviewLabel(kingdom: string): string {
  return KINGDOM_PREVIEW_DISPLAY[kingdom] ?? kingdom;
}

const PLANT_GROUP_TO_SUBCATEGORY: Readonly<Record<string, SubcategoryId>> = {
  trees_shrubs: 'trees_shrubs',
  ferns_mosses: 'ferns_mosses',
  dryland_plants: 'cacti_succulents',
  herbaceous: 'wildflowers',
};

const ANIMAL_GROUP_TO_SUBCATEGORY: Readonly<Partial<Record<V3SpecialistGroup, SubcategoryId>>> =
  {
    birds: 'songbirds',
    herps: 'lizards',
    mammals: 'small_mammals',
  };

export function v3PlantGroupToSubcategory(group: string): SubcategoryId | undefined {
  return PLANT_GROUP_TO_SUBCATEGORY[group];
}

export function v3AnimalGroupToSubcategory(group: V3SpecialistGroup): SubcategoryId | undefined {
  return ANIMAL_GROUP_TO_SUBCATEGORY[group];
}

export function v3SpecialistGroupToSubcategory(group: V3SpecialistGroup): SubcategoryId | undefined {
  if (group === 'fungi') return 'other_fungi';
  if ((PLANT_GROUP_TO_SUBCATEGORY as Record<string, SubcategoryId>)[group]) {
    return PLANT_GROUP_TO_SUBCATEGORY[group];
  }
  return v3AnimalGroupToSubcategory(group);
}

export function genusToV3Classification(
  genus: string,
  confidence: number,
  taxonGroup: VisionTaxonGroup,
  subcategory?: string,
): ClassificationResult {
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup,
    ...(subcategory ? { subcategory } : {}),
  };
}

export function formatV3RouteLabel(kingdom: string, routerGroup?: string | null): string {
  if (routerGroup) {
    return `${kingdom} / ${routerGroup}`;
  }
  return kingdom;
}
