import type { VisionTaxonGroup } from '@/types';

/** Maps preview group label to vision taxon for scoring / enrichment. */
export function previewLabelToTaxonGroup(previewLabel: string): VisionTaxonGroup {
  if (previewLabel === 'Fungi / Mushroom') return 'fungi';
  if (previewLabel === 'Bird') return 'birds';
  const plantLabels = new Set([
    'Tree',
    'Shrub / Bush',
    'Wildflower',
    'Grass / Sedge',
    'Fern',
    'Cactus / Succulent',
  ]);
  if (plantLabels.has(previewLabel)) return 'plants';
  return 'animals';
}
