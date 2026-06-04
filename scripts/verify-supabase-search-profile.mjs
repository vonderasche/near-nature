/**
 * Probes search RPCs and profile update paths on linked Supabase project.
 * Usage: node scripts/verify-supabase-search-profile.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const text = readFileSync(resolve(root, '.env'), 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

function isRpcMissing(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return (
    error?.code === 'PGRST202' ||
    error?.code === '42883' ||
    msg.includes('could not find the function') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

function isAuthRequired(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return msg.includes('not authenticated') || msg.includes('jwt');
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const anon = createClient(url, anonKey);
let failed = false;

console.log('\nSearch + profile verify\n');
console.log(`  Project: ${url}\n`);

// ── RPC existence (anon) ─────────────────────────────────────────────────────

const { error: pubSearchErr } = await anon.rpc('search_public_detections', {
  p_query: 'bird',
  p_offset: 0,
  p_limit: 5,
});
if (pubSearchErr) {
  if (isRpcMissing(pubSearchErr)) {
    console.error('  FAIL search_public_detections — run sql/search_public_detections.sql');
    failed = true;
  } else if ((pubSearchErr.message ?? '').toLowerCase().includes('permission denied for table users')) {
    console.error(
      '  FAIL search_public_detections — run sql/fix_search_public_detections_rls.sql (SECURITY DEFINER fix after harden_security_linter.sql)',
    );
    failed = true;
  } else {
    console.error('  ERR  search_public_detections:', pubSearchErr.message);
    failed = true;
  }
} else {
  console.log('  OK   search_public_detections (anon callable)');
}

const { error: userSearchErr } = await anon.rpc('search_user_detections', {
  p_user_id: '00000000-0000-0000-0000-000000000001',
  p_query: '',
  p_public_only: false,
  p_offset: 0,
  p_limit: 5,
});
if (userSearchErr) {
  if (isRpcMissing(userSearchErr)) {
    console.error('  FAIL search_user_detections — run sql/add_detection_search.sql or optimize_detection_gallery.sql');
    failed = true;
  } else if (isAuthRequired(userSearchErr)) {
    console.log('  OK   search_user_detections (exists; requires auth)');
  } else {
    console.error('  ERR  search_user_detections:', userSearchErr.message);
    failed = true;
  }
} else {
  console.log('  WARN search_user_detections returned without auth (unexpected)');
}

// ── Helper functions used by search RPCs ─────────────────────────────────────

const { error: helperErr } = await anon.rpc('detection_matches_gallery_category_filter', {
  p_category: 'plants',
  p_subcategory: null,
  p_main_category: null,
  p_filter_group: null,
  p_filter_subcategory: null,
});
if (helperErr) {
  if (isRpcMissing(helperErr)) {
    console.error('  FAIL detection_matches_gallery_category_filter — run sql/optimize_detection_gallery.sql');
    failed = true;
  } else {
    console.error('  ERR  detection_matches_gallery_category_filter:', helperErr.message);
    failed = true;
  }
} else {
  console.log('  OK   detection_matches_gallery_category_filter helper');
}

const { error: rowMatchErr } = await anon.rpc('detection_row_matches_search_query', {
  p_common_name: 'Robin',
  p_latin_name: 'Turdus migratorius',
  p_description: null,
  p_category: 'birds',
  p_subcategory: null,
  p_main_category: null,
  p_query: 'robin',
});
if (rowMatchErr) {
  if (isRpcMissing(rowMatchErr)) {
    console.error('  FAIL detection_row_matches_search_query — run sql/add_detection_search.sql');
    failed = true;
  } else {
    console.error('  ERR  detection_row_matches_search_query:', rowMatchErr.message);
    failed = true;
  }
} else {
  console.log('  OK   detection_row_matches_search_query helper');
}

const { error: profilePatchErr } = await anon.rpc('update_own_user_profile', { p_patch: { motto: 'probe' } });
if (profilePatchErr) {
  if (isRpcMissing(profilePatchErr)) {
    console.error('  FAIL update_own_user_profile — run sql/update_own_user_profile.sql');
    failed = true;
  } else if (isAuthRequired(profilePatchErr)) {
    console.log('  OK   update_own_user_profile (exists; requires auth)');
  } else {
    console.error('  ERR  update_own_user_profile:', profilePatchErr.message);
    failed = true;
  }
} else {
  console.log('  WARN update_own_user_profile returned without auth (unexpected)');
}

// ── Authenticated paths (optional service role test user) ────────────────────

if (serviceKey) {
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: sampleUsers, error: usersErr } = await admin
    .from('users')
    .select('id, email, username')
    .limit(1);
  if (usersErr) {
    console.error('  ERR  list users (service):', usersErr.message);
    failed = true;
  } else if (!sampleUsers?.length) {
    console.log('  SKIP authenticated tests — no users in DB');
  } else {
    const user = sampleUsers[0];
    const testEmail = user.email;
    const testPassword = `VerifyProbe_${Date.now()}_Aa1!`;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: `probe-search-${Date.now()}@example.invalid`,
      password: testPassword,
      email_confirm: true,
    });
    if (createErr) {
      console.log('  SKIP authenticated tests — could not create probe user:', createErr.message);
    } else {
      const probeId = created.user.id;
      await admin.rpc('ensure_public_user_profile', {}, { count: 'exact' }).catch(() => {});
      await admin.from('users').upsert({
        id: probeId,
        email: created.user.email,
        username: `probe_${Date.now()}`,
        first_name: 'Probe',
        last_name: 'User',
      });

      const probeClient = createClient(url, anonKey, { auth: { persistSession: false } });
      const { error: signInErr } = await probeClient.auth.signInWithPassword({
        email: created.user.email,
        password: testPassword,
      });

      if (signInErr) {
        console.error('  ERR  probe sign-in:', signInErr.message);
        failed = true;
      } else {
        const { data: galleryRows, error: galleryErr } = await probeClient.rpc('search_user_detections', {
          p_user_id: probeId,
          p_query: '',
          p_public_only: false,
          p_offset: 0,
          p_limit: 5,
        });
        if (galleryErr) {
          console.error('  ERR  search_user_detections (auth):', galleryErr.message);
          failed = true;
        } else {
          console.log(`  OK   search_user_detections (auth) rows=${(galleryRows ?? []).length}`);
        }

        const motto = `probe motto ${Date.now()}`;
        const { data: patched, error: mottoErr } = await probeClient.rpc('update_own_user_profile', {
          p_patch: { motto },
        });
        const patchedRow = Array.isArray(patched) ? patched[0] : patched;
        if (mottoErr) {
          console.error('  FAIL update_own_user_profile (auth):', mottoErr.message);
          failed = true;
        } else if (patchedRow?.motto !== motto) {
          console.error('  FAIL update_own_user_profile — value not persisted');
          failed = true;
        } else {
          console.log('  OK   update_own_user_profile (auth)');
        }
      }

      await admin.auth.admin.deleteUser(probeId);
    }
  }
} else {
  console.log('  SKIP authenticated tests — set SUPABASE_SERVICE_ROLE_KEY in .env for full probe');
}

if (failed) {
  console.log('\nSearch/profile verify FAILED — apply missing SQL in Supabase SQL Editor.\n');
  process.exit(1);
}

console.log('\nSearch/profile paths OK.\n');
