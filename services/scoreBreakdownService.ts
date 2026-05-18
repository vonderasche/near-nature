import { getMainCategory, type MainCategoryId } from '@/constants/naturalist-categories';
import { supabase } from '@/lib/supabase';

export type ScoreBucketId = MainCategoryId | '_global' | '_unknown';

export type UserScoreByCategoryRow = {
  mainCategory: ScoreBucketId;
  label: string;
  detectionPoints: number;
  awardPoints: number;
  totalPoints: number;
  speciesCount: number;
};

export type UserScoreBreakdown = {
  rows: UserScoreByCategoryRow[];
  totalDetectionPoints: number;
  totalAwardPoints: number;
  totalPoints: number;
  totalSpecies: number;
};

function bucketLabel(id: ScoreBucketId): string {
  if (id === '_global') return 'Global badges';
  if (id === '_unknown') return 'Uncategorized';
  return getMainCategory(id).label;
}

function mapRow(row: Record<string, unknown>): UserScoreByCategoryRow {
  const mainCategory = String(row.main_category ?? '_unknown') as ScoreBucketId;
  const detectionPoints = Number(row.detection_points ?? 0);
  const awardPoints = Number(row.award_points ?? 0);
  const totalPoints = Number(row.total_points ?? detectionPoints + awardPoints);
  const speciesCount = Number(row.species_count ?? 0);
  return {
    mainCategory,
    label: bucketLabel(mainCategory),
    detectionPoints,
    awardPoints,
    totalPoints,
    speciesCount,
  };
}

/** Owner-only RPC: points and species counts grouped by main naturalist discipline. */
export async function fetchUserScoreByCategory(userId: string): Promise<UserScoreBreakdown> {
  const { data, error } = await supabase.rpc('get_user_score_by_category', {
    p_user_id: userId,
  });
  if (error) throw error;

  const rows = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  const totalDetectionPoints = rows.reduce((s, r) => s + r.detectionPoints, 0);
  const totalAwardPoints = rows.reduce((s, r) => s + r.awardPoints, 0);
  const totalPoints = rows.reduce((s, r) => s + r.totalPoints, 0);
  const totalSpecies = rows
    .filter((r) => r.mainCategory !== '_global' && r.mainCategory !== '_unknown')
    .reduce((s, r) => s + r.speciesCount, 0);

  return {
    rows: rows.filter((r) => r.totalPoints > 0 || r.speciesCount > 0),
    totalDetectionPoints,
    totalAwardPoints,
    totalPoints,
    totalSpecies,
  };
}
