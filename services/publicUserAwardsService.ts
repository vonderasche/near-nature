import { supabase } from '@/lib/supabase';
import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';

export type PublicUserAwardRow = {
  awardKey: string;
  points: number;
  label: string;
  awardedAt: string;
  progress: BadgeProgress | null;
};

type RpcRow = {
  award_key: string;
  points: number;
  label: string;
  awarded_at: string;
  badge_kind?: string | null;
  main_category?: string | null;
  subcategory?: string | null;
  tier?: string | null;
  unique_species_count?: number | null;
  required_unique_species?: number | null;
  earned?: boolean | null;
};

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

/** Any authenticated member can read another user's earned awards. */
export async function fetchPublicUserAwards(userId: string): Promise<PublicUserAwardRow[]> {
  const { data, error } = await supabase.rpc('get_public_user_awards', { p_user_id: userId });
  if (error) throw error;

  return ((data ?? []) as RpcRow[]).map((row) => ({
    awardKey: String(row.award_key ?? ''),
    points: Number(row.points ?? 0),
    label: String(row.label ?? ''),
    awardedAt: String(row.awarded_at ?? ''),
    progress: row.badge_kind
      ? {
          awardKey: String(row.award_key ?? ''),
          badgeKind: String(row.badge_kind ?? ''),
          mainCategory: nullableString(row.main_category) as BadgeProgress['mainCategory'],
          subcategory: nullableString(row.subcategory) as BadgeProgress['subcategory'],
          tier: nullableString(row.tier) as BadgeProgress['tier'],
          label: String(row.label ?? ''),
          points: Number(row.points ?? 0),
          uniqueSpeciesCount: Number(row.unique_species_count ?? 0),
          requiredUniqueSpecies:
            row.required_unique_species == null ? null : Number(row.required_unique_species),
          earned: row.earned ?? true,
        }
      : null,
  }));
}
