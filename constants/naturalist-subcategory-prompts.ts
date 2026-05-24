/**
 * Subcategory id lists for the vision identification prompt.
 * Keep in sync with supabase/functions/identify-species/index.ts
 */
import { MAIN_CATEGORIES } from '@/constants/naturalist-categories';

function joinIds(mainId: string): string {
  const main = MAIN_CATEGORIES.find((m) => m.id === mainId);
  return main?.subcategoryIds.join(' | ') ?? '';
}

export const PLANT_SUBCATEGORIES_PROMPT = joinIds('botanist');

export const BIRD_SUBCATEGORIES_PROMPT = joinIds('ornithologist');

export const ANIMAL_SUBCATEGORIES_PROMPT = [
  joinIds('herpetologist'),
  joinIds('mammalogist'),
].join(' | ');
