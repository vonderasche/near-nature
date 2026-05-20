import { supabase } from '@/lib/supabase';

export type PublicUserAwardRow = {
  awardKey: string;
  points: number;
  label: string;
  awardedAt: string;
};

type RpcRow = {
  award_key: string;
  points: number;
  label: string;
  awarded_at: string;
};

/** Any authenticated member can read another user's earned awards. */
export async function fetchPublicUserAwards(userId: string): Promise<PublicUserAwardRow[]> {
  const { data, error } = await supabase.rpc('get_public_user_awards', { p_user_id: userId });
  if (error) throw error;

  return ((data ?? []) as RpcRow[]).map((row) => ({
    awardKey: String(row.award_key ?? ''),
    points: Number(row.points ?? 0),
    label: String(row.label ?? ''),
    awardedAt: String(row.awarded_at ?? ''),
  }));
}
