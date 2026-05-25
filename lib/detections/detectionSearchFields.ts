import { getMainCategory, getSubcategoryLabel, type MainCategoryId } from '@/constants/naturalist-categories';
import { latinGenusForSearch, normalizeLatinNameForSearch } from '@/lib/search/normalizeLatinName';
import type { DetectionGalleryItem } from '@/types';

function taxonomyTokens(category: string, subcategory: string | null, mainCategory: string | null): string[] {
  const tokens: string[] = [];
  const push = (value: string | null | undefined) => {
    const t = value?.trim();
    if (!t) return;
    tokens.push(t.replace(/_/g, ' '));
  };
  push(mainCategory);
  push(subcategory);
  push(category);
  if (mainCategory) {
    try {
      tokens.push(getMainCategory(mainCategory as MainCategoryId).label);
    } catch {
      /* unknown main id */
    }
  }
  if (subcategory) {
    tokens.push(getSubcategoryLabel(subcategory));
  }
  return tokens;
}

/** All text fields used for client-side gallery search (names, taxonomy labels, description, aliases). */
export function detectionSearchFields(
  item: Pick<
    DetectionGalleryItem,
    'commonName' | 'latinName' | 'description' | 'category' | 'subcategory' | 'mainCategory'
  >,
  aliases: readonly string[] = [],
): string[] {
  const normalized = normalizeLatinNameForSearch(item.latinName);
  const genus = latinGenusForSearch(item.latinName);
  return [
    item.commonName,
    item.latinName,
    normalized,
    genus,
    item.description,
    ...taxonomyTokens(item.category, item.subcategory, item.mainCategory),
    ...aliases,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}
