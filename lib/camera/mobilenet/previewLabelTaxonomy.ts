import type { SubcategoryId } from '@/constants/naturalist-categories';
import type { VisionTaxonGroup } from '@/types';

const PLANT_PREVIEW_LABELS = new Set([
  'Tree',
  'Shrub / Bush',
  'Wildflower',
  'Grass / Sedge',
  'Fern',
  'Cactus / Succulent',
]);

/** Maps MobileViT routing preview label → canonical `species_category` / badge subcategory. */
const PREVIEW_LABEL_TO_SUBCATEGORY: Readonly<Record<string, SubcategoryId>> = {
  Tree: 'trees_shrubs',
  'Shrub / Bush': 'trees_shrubs',
  Wildflower: 'wildflowers',
  'Grass / Sedge': 'wildflowers',
  Fern: 'ferns_mosses',
  'Cactus / Succulent': 'cacti_succulents',
  Bird: 'songbirds',
  'Reptile / Lizard': 'lizards',
  Snake: 'snakes',
  Turtle: 'turtles_tortoises',
  'Frog / Amphibian': 'frogs_toads',
  'Wild mammal': 'small_mammals',
  Dog: 'small_mammals',
  Cat: 'small_mammals',
  'Horse / Livestock': 'deer_hoofed',
  'Fungi / Mushroom': 'other_fungi',
};

/** Maps preview group label to vision taxon for Gemini / enrichment APIs. */
export function previewLabelToTaxonGroup(previewLabel: string): VisionTaxonGroup {
  if (previewLabel === 'Fungi / Mushroom') return 'fungi';
  if (previewLabel === 'Bird') return 'birds';
  if (PLANT_PREVIEW_LABELS.has(previewLabel)) return 'plants';
  return 'animals';
}

/** Subcategory for on-device routing (herps, birds, plants, mammals). */
export function previewLabelToSubcategory(previewLabel: string): string | undefined {
  return PREVIEW_LABEL_TO_SUBCATEGORY[previewLabel];
}
