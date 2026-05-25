import {
  getMainCategory,
  type MainCategoryId,
} from '@/constants/naturalist-categories';
import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';
import type { BadgeProgress } from '@/lib/profile/categoryProgressTypes';
import { parseBadgeProgressRow } from '@/lib/profile/parseBadgeProgress';
import type {
  PointAwardSnapshotRow,
  UserScoringSnapshot,
} from '@/services/scoringSnapshotService';
import type {
  ScoreBucketId,
  UserScoreBreakdown,
  UserScoreByCategoryRow,
} from '@/services/scoreBreakdownService';

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

export function parseUserScoringSnapshotPayload(raw: unknown): UserScoringSnapshot {
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

  const badgeProgress: BadgeProgress[] = ((payload.badge_progress as unknown[]) ?? []).map((row) =>
    parseBadgeProgressRow(row as Record<string, unknown>),
  );

  const mains = buildMainCategoryProgress(subSpeciesCounts, mainSpeciesCounts);
  const awardKeys = new Set(awards.map((a) => a.awardKey).filter(Boolean));

  return { mains, awards, awardKeys, badgeProgress, breakdown };
}
