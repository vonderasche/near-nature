/**
 * Delete a Supabase Auth user, cascaded app data, and Storage objects under {user_id}/.
 *
 * Supabase blocks direct DELETE on storage.objects — use this script (Storage API + Admin API).
 *
 * Usage:
 *   node scripts/delete-user-by-email.mjs blazefiddes@gmail.com
 *   node scripts/delete-user-by-email.mjs blazefiddes@gmail.com --dry-run
 *
 * Requires in .env:
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';

import { loadProjectEnv, requireSupabaseSeedEnv } from './loadSupabaseSeedEnv.mjs';

const STORAGE_BUCKETS = ['detections', 'ml-telemetry'];

const emailArg = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!emailArg || emailArg.startsWith('-')) {
  console.error('Usage: node scripts/delete-user-by-email.mjs <email> [--dry-run]');
  process.exit(1);
}

const targetEmail = emailArg.trim().toLowerCase();
const env = loadProjectEnv();
const { url, serviceKey } = requireSupabaseSeedEnv(env);
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resolveUserId() {
  const { data: profile, error: profileErr } = await admin
    .from('users')
    .select('id, email, username')
    .ilike('email', targetEmail)
    .maybeSingle();

  if (profileErr) throw profileErr;
  if (profile?.id) return profile;

  let page = 1;
  const perPage = 200;
  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => (u.email ?? '').toLowerCase() === targetEmail);
    if (match) {
      return { id: match.id, email: match.email ?? targetEmail, username: null };
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function listStoragePaths(bucket, folder) {
  const paths = [];
  const { data, error } = await admin.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;

  for (const entry of data ?? []) {
    const path = folder ? `${folder}/${entry.name}` : entry.name;
    if (entry.metadata) {
      paths.push(path);
      continue;
    }
    paths.push(...(await listStoragePaths(bucket, path)));
  }

  return paths;
}

async function removeStorageForUser(userId) {
  let removed = 0;
  for (const bucket of STORAGE_BUCKETS) {
    const paths = await listStoragePaths(bucket, userId);
    if (paths.length === 0) continue;

    if (dryRun) {
      console.log(`  [dry-run] would remove ${paths.length} object(s) from ${bucket}/${userId}/`);
      removed += paths.length;
      continue;
    }

    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const { error } = await admin.storage.from(bucket).remove(batch);
      if (error) throw error;
      removed += batch.length;
    }
    console.log(`  removed ${paths.length} object(s) from ${bucket}/${userId}/`);
  }
  return removed;
}

async function countDbRows(userId) {
  const tables = [
    ['detections', 'user_id'],
    ['discoveries', 'user_id'],
    ['point_awards', 'user_id'],
    ['user_badge_progress', 'user_id'],
    ['streaks', 'user_id'],
    ['ml_telemetry_events', 'user_id'],
  ];

  const counts = {};
  for (const [table, col] of tables) {
    const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true }).eq(col, userId);
    if (error) throw error;
    counts[table] = count ?? 0;
  }
  return counts;
}

console.log(`\nDelete user ${targetEmail}${dryRun ? ' (dry-run)' : ''}\n`);

const user = await resolveUserId();
if (!user) {
  console.error('No user found for that email.');
  process.exit(1);
}

console.log(`  user_id:  ${user.id}`);
console.log(`  username: ${user.username ?? '(auth only)'}`);

const dbCounts = await countDbRows(user.id);
console.log('  db rows:', dbCounts);

const storageCount = await removeStorageForUser(user.id);
if (dryRun && storageCount === 0) {
  console.log('  [dry-run] no storage objects under user prefix');
}

if (dryRun) {
  console.log('\nDry-run complete — re-run without --dry-run to delete.\n');
  process.exit(0);
}

const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
if (deleteErr) throw deleteErr;

console.log('\nDeleted auth user (public.users + cascaded rows removed).\n');

const { data: stillThere } = await admin.from('users').select('id').eq('id', user.id).maybeSingle();
if (stillThere) {
  console.warn('Warning: public.users row still present — delete manually if needed.');
}
