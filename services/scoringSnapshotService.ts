import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';
import type { MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import {
  getMainCategory,
  MAIN_CATEGORIES,
  type MainCategoryId,
} from '@/constants/naturalist-categories';
import { supabase } from '@/lib/supabase';
import {
  fetchUserScoreByCategory,
  type ScoreBucketId,
  type UserScoreBreakdown,
  type UserScoreByCategoryRow,
} from '@/services/scoreBreakdownService';

export type PointAwardSnapshotRow = {
  awardKey: string;
  points: number;
  label: string;
  awardedAt: string;
};

export type UserScoringSnapshot = {
  mains: MainCategoryProgress[];
  awards: PointAwardSnapshotRow[];
  awardKeys: Set<string>;
  breakdown: UserScoreBreakdown;
};

function bucketLabel(id: ScoreBucketId): string {
  if (id === '_global') return 'Global badges';
  if (id === '_unknown') return 'Uncategorized';
  return getMainCategory(id as MainCategoryId).label;
}

function mapScoreRow(row: Record<string, unknown>): UserScoreByCategoryRow {
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

function buildBreakdown(rows: UserScoreByCategoryRow[]): UserScoreBreakdown {
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

function parseSnapshotPayload(raw: unknown): UserScoringSnapshot {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid scoring snapshot response.');
  }
  const payload = raw as Record<string, unknown>;

  const scoreRows = ((payload.score_rows as unknown[]) ?? []).map((row) =>
    mapScoreRow(row as Record<string, unknown>),
  );
  const breakdown = buildBreakdown(scoreRows);

  const awards: PointAwardSnapshotRow[] = ((payload.awards as unknown[]) ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      awardKey: String(r.award_key ?? ''),
      points: Number(r.points ?? 0),
      label: String(r.label ?? ''),
      awardedAt: String(r.awarded_at ?? ''),
    };
  });

  const subSpeciesCounts = ((payload.sub_species_counts as unknown[]) ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.subcategory ?? ''),
      speciesCount: Number(r.species_count ?? 0),
    };
  });

  const mainSpeciesCounts = ((payload.main_species_counts as unknown[]) ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.main_category ?? ''),
      speciesCount: Number(r.species_count ?? 0),
    };
  });

  const mains = buildMainCategoryProgress(subSpeciesCounts, mainSpeciesCounts);
  const awardKeys = new Set(awards.map((a) => a.awardKey).filter(Boolean));

  return { mains, awards, awardKeys, breakdown };
}

function isSnapshotRpcUnavailable(error: { code?: string; message?: string }): boolean {
  const message = (error.message ?? '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    message.includes('get_user_scoring_snapshot') ||
    message.includes('does not exist')
  );
}

/** Uses score-by-category + point_awards when the combined snapshot RPC is not deployed. */
async function fetchUserScoringSnapshotFallback(userId: string): Promise<UserScoringSnapshot> {
  const [breakdown, awardsResult] = await Promise.all([
    fetchUserScoreByCategory(userId),
    supabase
      .from('point_awards')
      .select('award_key, points, label, awarded_at')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false }),
  ]);

  if (awardsResult.error) throw awardsResult.error;

  const awards: PointAwardSnapshotRow[] = (awardsResult.data ?? []).map((row) => ({
    awardKey: String(row.award_key ?? ''),
    points: Number(row.points ?? 0),
    label: String(row.label ?? ''),
    awardedAt: String(row.awarded_at ?? ''),
  }));

  const mainIds = new Set<MainCategoryId>(MAIN_CATEGORIES.map((m) => m.id));
  const mainSpeciesCounts = breakdown.rows
    .filter((row) => mainIds.has(row.mainCategory as MainCategoryId))
    .map((row) => ({
      id: row.mainCategory,
      speciesCount: row.speciesCount,
    }));

  const mains = buildMainCategoryProgress([], mainSpeciesCounts);
  const awardKeys = new Set(awards.map((a) => a.awardKey).filter(Boolean));

  return { mains, awards, awardKeys, breakdown };
}

/** Owner-only RPC: score breakdown, awards, and discipline species counts. */
export async function fetchUserScoringSnapshot(userId: string): Promise<UserScoringSnapshot> {
  const { data, error } = await supabase.rpc('get_user_scoring_snapshot', {
    p_user_id: userId,
  });

  if (error) {
    if (isSnapshotRpcUnavailable(error)) {
      return fetchUserScoringSnapshotFallback(userId);
    }
    throw error;
  }

  if (data == null) {
    return fetchUserScoringSnapshotFallback(userId);
  }

  return parseSnapshotPayload(data);
}
