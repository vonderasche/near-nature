import type { TaxonGroup } from '@/types';

const PLANT = new Set(['plant_tree', 'plant_flower', 'plant_other']);
const ANIMAL = new Set(['mammal', 'reptile', 'fish', 'insect', 'bird', 'amphibian']);

/** Best-effort filter: DB `species_category` vs UI taxon filter. */
export function detectionCategoryMatchesTaxonGroup(category: string, taxonGroup: TaxonGroup): boolean {
  if (taxonGroup === 'all') return true;
  if (taxonGroup === 'plant') return PLANT.has(category);
  if (taxonGroup === 'animal') return ANIMAL.has(category);
  if (taxonGroup === 'fungus') return category === 'other';
  if (taxonGroup === 'other') return category === 'other' || (!PLANT.has(category) && !ANIMAL.has(category));
  return true;
}
