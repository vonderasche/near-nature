import familyTaxonomyJson from '@/assets/tflite/v18/tflite/family_taxonomy.json';

import type { VisionTaxonGroup } from '@/types';

const FAMILY_TAXON = familyTaxonomyJson as Readonly<Record<string, VisionTaxonGroup>>;

export function v18FamilyToTaxonGroup(familyLabel: string): VisionTaxonGroup {
  return FAMILY_TAXON[familyLabel.trim()] ?? 'animals';
}
