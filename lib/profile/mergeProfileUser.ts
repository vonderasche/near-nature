import type { PublicUserProfile, User } from '@/services/userService';

function optionalTrimmed(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Merge a PostgREST / RPC users row onto the profile we already have loaded. */
export function mergeProfileUser(existing: User, row: Partial<User> & Pick<User, 'id'>): User {
  return {
    id: existing.id,
    email: typeof row.email === 'string' && row.email.trim().length > 0 ? row.email.trim() : existing.email,
    username:
      typeof row.username === 'string' && row.username.trim().length > 0
        ? row.username.trim()
        : existing.username,
    first_name:
      typeof row.first_name === 'string' && row.first_name.trim().length > 0
        ? row.first_name.trim()
        : existing.first_name,
    last_name:
      typeof row.last_name === 'string' && row.last_name.trim().length > 0
        ? row.last_name.trim()
        : existing.last_name,
    motto: 'motto' in row ? optionalTrimmed(row.motto) : existing.motto,
    avatar_url: 'avatar_url' in row ? optionalTrimmed(row.avatar_url) : existing.avatar_url,
    state: 'state' in row ? optionalTrimmed(row.state) : existing.state,
    created_at: typeof row.created_at === 'string' ? row.created_at : existing.created_at,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : existing.updated_at,
  };
}

export function mergeProfileStats(
  existing: PublicUserProfile | null,
  user: User,
): PublicUserProfile | null {
  if (!existing || existing.id !== user.id) return existing;
  const state =
    user.state?.trim().length === 2 ? user.state.trim().toUpperCase() : null;
  return {
    ...existing,
    username: user.username,
    motto: user.motto,
    state,
    avatar_url: user.avatar_url,
  };
}
