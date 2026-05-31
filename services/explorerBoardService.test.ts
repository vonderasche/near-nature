import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import {
  clearLegacyExplorerBoardCache,
  EXPLORER_BOARD_PAGE_SIZE,
  fetchExplorerBoardPage,
  isPaginatedExplorerBoardRpcMissing,
} from '@/services/explorerBoardService';

afterEach(() => {
  clearLegacyExplorerBoardCache();
  vi.mocked(supabase.rpc).mockReset();
});

describe('isPaginatedExplorerBoardRpcMissing', () => {
  it('detects schema cache errors for the paginated RPC', () => {
    expect(
      isPaginatedExplorerBoardRpcMissing({
        message:
          'Could not find the function public.get_detection_count_leaderboard(p_limit, p_offset) in the schema cache',
      }),
    ).toBe(true);
  });
});

describe('fetchExplorerBoardPage', () => {
  it('passes p_search when searchQuery is set', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: [], error: null } as never);

    await fetchExplorerBoardPage({
      offset: 0,
      pageSize: 20,
      searchQuery: 'plant',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_detection_count_leaderboard', {
      p_limit: 21,
      p_offset: 0,
      p_search: 'plant',
    });
  });

  it('requests pageSize + 1 and trims the extra row when hasMore', async () => {
    const extraRank = EXPLORER_BOARD_PAGE_SIZE + 1;
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [
        {
          leaderboard_rank: 1,
          user_id: '11111111-1111-1111-1111-111111111111',
          username: 'a',
          avatar_url: '',
          total_points: 10,
          recent_detection_image_urls: [],
          native_species_count: 1,
          non_native_species_count: 0,
        },
        {
          leaderboard_rank: extraRank,
          user_id: '22222222-2222-2222-2222-222222222222',
          username: 'b',
          avatar_url: '',
          total_points: 5,
          recent_detection_image_urls: [],
          native_species_count: 1,
          non_native_species_count: 0,
        },
      ],
      error: null,
    } as never);

    const { rows, hasMore } = await fetchExplorerBoardPage({
      offset: 0,
      pageSize: 1,
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_detection_count_leaderboard', {
      p_limit: 2,
      p_offset: 0,
    });
    expect(hasMore).toBe(true);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.username).toBe('a');
  });

  it('falls back to legacy no-arg RPC and slices client-side', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({
        data: null,
        error: {
          message:
            'Could not find the function public.get_detection_count_leaderboard(p_limit, p_offset) in the schema cache',
        },
      } as never)
      .mockResolvedValueOnce({
        data: [
          {
            leaderboard_rank: 1,
            user_id: '11111111-1111-1111-1111-111111111111',
            username: 'first',
            avatar_url: '',
            total_points: 10,
            recent_detection_image_urls: [],
            native_species_count: 1,
            non_native_species_count: 0,
          },
          {
            leaderboard_rank: 2,
            user_id: '22222222-2222-2222-2222-222222222222',
            username: 'second',
            avatar_url: '',
            total_points: 5,
            recent_detection_image_urls: [],
            native_species_count: 1,
            non_native_species_count: 0,
          },
        ],
        error: null,
      } as never);

    const page0 = await fetchExplorerBoardPage({ offset: 0, pageSize: 1 });
    expect(page0.rows).toHaveLength(1);
    expect(page0.rows[0]?.username).toBe('first');
    expect(page0.hasMore).toBe(true);

    const page1 = await fetchExplorerBoardPage({ offset: 1, pageSize: 1 });
    expect(page1.rows[0]?.username).toBe('second');
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
    expect(supabase.rpc).toHaveBeenNthCalledWith(1, 'get_detection_count_leaderboard', {
      p_limit: 2,
      p_offset: 0,
    });
    expect(supabase.rpc).toHaveBeenNthCalledWith(2, 'get_detection_count_leaderboard', {});
  });
});
