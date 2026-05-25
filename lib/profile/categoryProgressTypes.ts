import type { CategoryTierId, MainCategoryId, SubcategoryId } from '@/constants/naturalist-categories';

export type BadgeProgress = {
  awardKey: string;
  badgeKind: 'main' | 'sub' | 'bonus' | string;
  mainCategory: MainCategoryId | null;
  subcategory: SubcategoryId | null;
  tier: CategoryTierId | null;
  label: string;
  points: number;
  uniqueSpeciesCount: number;
  requiredUniqueSpecies: number | null;
  earned: boolean;
};

export type SubcategoryProgress = {
  id: SubcategoryId;
  label: string;
  speciesCount: number;
  tier: CategoryTierId | null;
  progressPct: number;
};

export type MainCategoryProgress = {
  id: MainCategoryId;
  label: string;
  speciesCount: number;
  tier: CategoryTierId | null;
  progressPct: number;
  subcategories: SubcategoryProgress[];
};
