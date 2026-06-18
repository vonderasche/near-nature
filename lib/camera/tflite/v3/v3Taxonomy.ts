import type { SubcategoryId } from '@/constants/naturalist-categories';
import type { ClassificationResult } from '@/types';
import type { VisionTaxonGroup } from '@/types';
import type { V3PlantSpecialistGroup } from '@/lib/camera/tflite/v3/v3CascadeConfig';

export function v3KingdomToTaxonGroup(kingdom: string): VisionTaxonGroup {
  if (kingdom === 'plantae') return 'plants';
  if (kingdom === 'fungi') return 'fungi';
  return 'animals';
}

const PLANT_GROUP_TO_SUBCATEGORY: Readonly<Record<string, SubcategoryId>> = {
  trees_shrubs: 'trees_shrubs',
  ferns_mosses: 'ferns_mosses',
  dryland_plants: 'cacti_succulents',
  herbaceous: 'wildflowers',
};

export function v3PlantGroupToSubcategory(group: string): SubcategoryId | undefined {
  return PLANT_GROUP_TO_SUBCATEGORY[group];
}

export function v3SpecialistGroupToSubcategory(
  group: V3PlantSpecialistGroup | 'fungi',
): SubcategoryId {
  if (group === 'fungi') return 'other_fungi';
  return PLANT_GROUP_TO_SUBCATEGORY[group] ?? 'wildflowers';
}

export function genusToV3Classification(
  genus: string,
  confidence: number,
  taxonGroup: VisionTaxonGroup,
  subcategory?: SubcategoryId,
): ClassificationResult {
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup,
    ...(subcategory ? { subcategory } : {}),
  };
}

export function formatV3RouteLabel(kingdom: string, plantGroup?: string | null): string {
  if (plantGroup) {
    return `${kingdom} / ${plantGroup}`;
  }
  return kingdom;
}
