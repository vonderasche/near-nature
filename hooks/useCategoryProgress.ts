import { useCallback, useEffect, useState } from 'react';

import {
  MAIN_CATEGORIES,
  type CategoryTierId,
  type MainCategoryId,
  type SubcategoryId,
  tierDisplayName,
  tierForSpeciesCount,
  TIER_SPECIES_THRESHOLDS,
  getSubcategoryLabel,
} from '@/constants/naturalist-categories';
import {
  buildSpeciesCounts,
  getMainTier,
  getSubTier,
  progressPercent,
} from '@/lib/points/categoryMilestones';
import { supabase } from '@/lib/supabase';

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

export function useCategoryProgress(userId: string | undefined) {
  const [mains, setMains] = useState<MainCategoryProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setMains([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('discoveries')
        .select('latin_name, category')
        .eq('user_id', userId);
      if (qErr) throw qErr;

      const counts = buildSpeciesCounts(
        (data ?? []).map((row) => ({
          latin_name: String(row.latin_name),
          category: String(row.category),
        })),
      );

      const progress: MainCategoryProgress[] = MAIN_CATEGORIES.map((main) => {
        const speciesCount = counts.byMain.get(main.id) ?? 0;
        const tier = getMainTier(main.id, counts);
        return {
          id: main.id,
          label: main.label,
          speciesCount,
          tier,
          progressPct: progressPercent(speciesCount),
          subcategories: main.subcategoryIds.map((subId) => {
            const subCount = counts.bySub.get(subId) ?? 0;
            const subTier = getSubTier(subId, counts);
            return {
              id: subId,
              label: getSubcategoryLabel(subId),
              speciesCount: subCount,
              tier: subTier,
              progressPct: progressPercent(subCount),
            };
          }),
        };
      });

      setMains(progress);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load category progress.');
      setMains([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  return {
    mains,
    loading,
    error,
    refetch: fetchProgress,
    tierThresholds: TIER_SPECIES_THRESHOLDS,
    tierDisplayName,
    tierForSpeciesCount,
  };
}
