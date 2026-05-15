import {
  mapDetectionLeaderboardRpcRow,
  type DetectionLeaderboardRow,
} from '@/lib/leaderboard/detectionCountLeaderboardMap';
import { supabase } from '@/lib/supabase';

export type { DetectionLeaderboardRow };
export { mapDetectionLeaderboardRpcRow };

/**
 * Leaderboard by distinct native species (non-sensitive saves), with non-native species count.
 * Requires `get_detection_count_leaderboard` in Supabase (`sql/get_detection_count_leaderboard.sql`).
 */
export async function getDetectionCountLeaderboard(): Promise<DetectionLeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_detection_count_leaderboard', {});
  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  return rows.map(mapDetectionLeaderboardRpcRow);
}
