import {
  ENDS_OF_THE_EARTH_BADGE_KEY,
  getSubcategory,
  type MainCategoryId,
} from '@/constants/naturalist-categories';
import { mapDbCategoryToSubcategory } from '@/lib/points/mapDbCategoryToSubcategory';

export type ScoreBucketId = MainCategoryId | '_global' | '_unknown';

/** Mirrors SQL `award_key_to_main_category`. */
export function parseAwardKeyMainCategory(awardKey: string): ScoreBucketId | null {
  const key = awardKey.trim();
  if (!key) return null;

  if (key === ENDS_OF_THE_EARTH_BADGE_KEY) return '_global';

  if (key.startsWith('main:')) {
    const main = key.split(':')[1];
    return main ? (main as MainCategoryId) : null;
  }

  if (key.startsWith('sub:')) {
    const sub = key.split(':')[1];
    if (!sub) return null;
    const mapped = mapDbCategoryToSubcategory(sub);
    return mapped ? getSubcategory(mapped).mainId : null;
  }

  if (key.startsWith('badge:true_voyager:')) {
    const main = key.split(':')[2];
    return main ? (main as MainCategoryId) : null;
  }

  return null;
}
