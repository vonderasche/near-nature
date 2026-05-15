import { describe, expect, it } from 'vitest';

import { mapDetectionLeaderboardRpcRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

describe('mapDetectionLeaderboardRpcRow', () => {
  it('maps snake_case RPC row including species counts', () => {
    const row = mapDetectionLeaderboardRpcRow({
      leaderboard_rank: 1,
      user_id: '11111111-1111-1111-1111-111111111111',
      username: 'birder42',
      avatar_url: 'https://example.com/a.jpg',
      motto: '  Leave no trace. ',
      native_species_count: 12,
      non_native_species_count: 4,
    });
    expect(row).toEqual({
      rank: 1,
      userId: '11111111-1111-1111-1111-111111111111',
      username: 'birder42',
      avatarUrl: 'https://example.com/a.jpg',
      motto: 'Leave no trace.',
      nativeSpeciesCount: 12,
      nonNativeSpeciesCount: 4,
    });
  });

  it('falls back to legacy detection_count for native only', () => {
    const row = mapDetectionLeaderboardRpcRow({
      leaderboard_rank: 2,
      user_id: '22222222-2222-2222-2222-222222222222',
      username: 'mossfan',
      avatar_url: '',
      Motto: 'Fungi first.',
      detection_count: '3',
    });
    expect(row.motto).toBe('Fungi first.');
    expect(row.nativeSpeciesCount).toBe(3);
    expect(row.nonNativeSpeciesCount).toBe(0);
    expect(row.avatarUrl).toBe(null);
  });
});
