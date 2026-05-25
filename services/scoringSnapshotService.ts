import { isLocalDetectionsMode } from '@/lib/config/isLocalDetectionsMode';
import { loadLocalDetectionRows } from '@/lib/detections/localDetectionStore';
import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';
import { buildLocalScoringSnapshot } from '@/lib/profile/buildLocalScoringSnapshot';
import type { BadgeProgress, MainCategoryProgress } from '@/lib/profile/categoryProgressTypes';
import { parseUserScoringSnapshotPayload } from '@/lib/profile/parseScoringSnapshotPayload';
import {
  MAIN_CATEGORIES,
  type MainCategoryId,
} from '@/constants/naturalist-categories';
import { supabase } from '@/lib/supabase';
import {
  fetchUserScoreByCategory,
  type UserScoreBreakdown,
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
  badgeProgress: BadgeProgress[];
  breakdown: UserScoreBreakdown;
};

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

  return { mains, awards, awardKeys, badgeProgress: [], breakdown };
}

/** Owner-only RPC: score breakdown, awards, and discipline species counts. */
export async function fetchUserScoringSnapshot(userId: string): Promise<UserScoringSnapshot> {
  if (isLocalDetectionsMode()) {
    const rows = await loadLocalDetectionRows(userId);
    return buildLocalScoringSnapshot(rows);
  }

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

  return parseUserScoringSnapshotPayload(data);
}
