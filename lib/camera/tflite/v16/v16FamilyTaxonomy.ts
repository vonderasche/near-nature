import familyTaxonomyJson from '@/assets/tflite/v16/tflite/family_taxonomy.json';

import type { VisionTaxonGroup } from '@/types';

const FAMILY_TAXON = familyTaxonomyJson as Readonly<Record<string, VisionTaxonGroup>>;

export function v16FamilyToTaxonGroup(familyLabel: string): VisionTaxonGroup {
  return FAMILY_TAXON[familyLabel.trim()] ?? 'animals';
}
