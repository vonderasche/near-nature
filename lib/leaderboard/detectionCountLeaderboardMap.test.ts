import { describe, expect, it } from 'vitest';

import { mapDetectionLeaderboardRpcRow } from '@/lib/leaderboard/detectionCountLeaderboardMap';

describe('mapDetectionLeaderboardRpcRow', () => {
  it('maps snake_case RPC row including motto', () => {
    const row = mapDetectionLeaderboardRpcRow({
      leaderboard_rank: 1,
      user_id: '11111111-1111-1111-1111-111111111111',
      username: 'birder42',
      avatar_url: 'https://example.com/a.jpg',
      motto: '  Leave no trace. ',
      detection_count: 12,
    });
    expect(row).toEqual({
      rank: 1,
      userId: '11111111-1111-1111-1111-111111111111',
      username: 'birder42',
      avatarUrl: 'https://example.com/a.jpg',
      motto: 'Leave no trace.',
      detectionCount: 12,
    });
  });

  it('reads Motto key when API returns PascalCase', () => {
    const row = mapDetectionLeaderboardRpcRow({
      leaderboard_rank: 2,
      user_id: '22222222-2222-2222-2222-222222222222',
      username: 'mossfan',
      avatar_url: '',
      Motto: 'Fungi first.',
      detection_count: '3',
    });
    expect(row.motto).toBe('Fungi first.');
    expect(row.detectionCount).toBe(3);
    expect(row.avatarUrl).toBe(null);
  });
});
