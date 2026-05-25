import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';

type ParseBadgeProgressOptions = {
  defaultEarned?: boolean;
};

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

export function parseBadgeProgressRow(
  row: Record<string, unknown>,
  options: ParseBadgeProgressOptions = {},
): BadgeProgress {
  return {
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
    earned: row.earned == null ? options.defaultEarned ?? false : Boolean(row.earned),
  };
}
