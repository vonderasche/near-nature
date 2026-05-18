import type { CategoryTierId, MainCategoryId, SubcategoryId } from '@/constants/naturalist-categories';

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
