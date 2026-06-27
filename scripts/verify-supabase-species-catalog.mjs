/**
 * Probes species catalog + Florida parks cloud paths used by Gemini sharing and Discover.
 * Usage: node scripts/verify-supabase-species-catalog.mjs
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
  return (
    msg.includes('not authenticated') ||
    msg.includes('authentication required') ||
    msg.includes('jwt') ||
    msg.includes('permission denied')
  );
}

function isMissingDependency(error) {
  const msg = (error?.message ?? '').toLowerCase();
  return (
    msg.includes('normalize_latin_name_for_search') ||
    msg.includes('upsert_species_metadata')
  );
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
let failed = false;

console.log('\nSpecies catalog + parks verify\n');
console.log(`  Project: ${url}\n`);

// ── RPC existence (unauthenticated probe) ────────────────────────────────────

const { error: syncAnonErr } = await anon.rpc('sync_species_catalog', {
  p_updated_after: null,
  p_limit: 5,
  p_offset: 0,
  p_catalog_sources: ['community', 'enrichment'],
});

if (syncAnonErr) {
  if (isRpcMissing(syncAnonErr)) {
    console.error('  FAIL sync_species_catalog — run sql/create_species_catalog.sql');
    failed = true;
  } else if (isAuthRequired(syncAnonErr)) {
    console.log('  OK   sync_species_catalog (exists; requires auth)');
  } else {
    console.error('  ERR  sync_species_catalog (anon):', syncAnonErr.message);
    failed = true;
  }
} else {
  console.log('  WARN sync_species_catalog returned without auth (unexpected)');
}

const { error: proposeAnonErr } = await anon.rpc('propose_species_catalog_entry', {
  p_latin_name: 'Probegenus',
  p_common_name: 'Probe',
});

if (proposeAnonErr) {
  if (isRpcMissing(proposeAnonErr)) {
    console.error('  FAIL propose_species_catalog_entry — run sql/create_species_catalog.sql');
    failed = true;
  } else if (isAuthRequired(proposeAnonErr)) {
    console.log('  OK   propose_species_catalog_entry (exists; requires auth)');
  } else if (isMissingDependency(proposeAnonErr)) {
    console.error(
      '  FAIL propose_species_catalog_entry dependency — run sql/add_detection_search.sql first',
    );
    failed = true;
  } else {
    console.error('  ERR  propose_species_catalog_entry (anon):', proposeAnonErr.message);
    failed = true;
  }
} else {
  console.log('  WARN propose_species_catalog_entry returned without auth (unexpected)');
}

// ── Florida parks (public read) ──────────────────────────────────────────────

const { count: parkCount, error: parksErr } = await anon
  .from('florida_state_parks')
  .select('park_id', { count: 'exact', head: true });

if (parksErr) {
  if (parksErr.message?.toLowerCase().includes('does not exist') || parksErr.code === '42P01') {
    console.error('  FAIL florida_state_parks — run sql/create_florida_state_parks.sql');
    failed = true;
  } else {
    console.error('  ERR  florida_state_parks:', parksErr.message);
    failed = true;
  }
} else if ((parkCount ?? 0) < 1) {
  console.error('  WARN florida_state_parks empty — run npm run seed:florida-parks');
} else {
  console.log(`  OK   florida_state_parks rows=${parkCount}`);
}

// ── Authenticated catalog round-trip (service role probe user) ───────────────

if (!serviceKey) {
  console.log('  SKIP authenticated catalog tests — set SUPABASE_SERVICE_ROLE_KEY in .env');
} else {
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { count: catalogCount, error: catalogCountErr } = await admin
    .from('species_catalog')
    .select('id', { count: 'exact', head: true });

  if (catalogCountErr) {
    if (catalogCountErr.message?.toLowerCase().includes('does not exist') || catalogCountErr.code === '42P01') {
      console.error('  FAIL species_catalog table — run sql/create_species_catalog.sql');
      failed = true;
    } else {
      console.error('  ERR  species_catalog (service):', catalogCountErr.message);
      failed = true;
    }
  } else {
    console.log(`  OK   species_catalog rows=${catalogCount ?? 0}`);
    if ((catalogCount ?? 0) < 1) {
      console.log('  WARN species_catalog empty — optional: npm run seed:species-catalog');
    }
  }

  const probeEmail = `probe-catalog-${Date.now()}@example.invalid`;
  const probePassword = `VerifyProbe_${Date.now()}_Aa1!`;
  const probeGenus = `probegenus${Date.now()}`;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: probeEmail,
    password: probePassword,
    email_confirm: true,
  });

  if (createErr) {
    console.log('  SKIP authenticated catalog tests — could not create probe user:', createErr.message);
  } else {
    const probeId = created.user.id;

    try {
      await admin.from('users').upsert({
        id: probeId,
        email: probeEmail,
        username: `probe_catalog_${Date.now()}`,
        first_name: 'Probe',
        last_name: 'Catalog',
      });

      const probeClient = createClient(url, anonKey, { auth: { persistSession: false } });
      const { error: signInErr } = await probeClient.auth.signInWithPassword({
        email: probeEmail,
        password: probePassword,
      });

      if (signInErr) {
        console.error('  ERR  probe sign-in:', signInErr.message);
        failed = true;
      } else {
        const { data: syncRows, error: syncErr } = await probeClient.rpc('sync_species_catalog', {
          p_updated_after: null,
          p_limit: 10,
          p_offset: 0,
          p_catalog_sources: ['community', 'enrichment'],
        });

        if (syncErr) {
          if (isMissingDependency(syncErr)) {
            console.error('  FAIL sync_species_catalog — run sql/add_detection_search.sql first');
          } else {
            console.error('  FAIL sync_species_catalog (auth):', syncErr.message);
          }
          failed = true;
        } else {
          console.log(`  OK   sync_species_catalog (auth) rows=${(syncRows ?? []).length}`);
        }

        const { data: proposedId, error: proposeErr } = await probeClient.rpc(
          'propose_species_catalog_entry',
          {
            p_latin_name: probeGenus,
            p_common_name: 'Probe species',
            p_taxon_group: 'plants',
            p_description: 'Near Nature catalog verify probe entry.',
            p_florida_status: 'unknown',
            p_source_urls: { verifyProbe: true },
          },
        );

        if (proposeErr) {
          if (isMissingDependency(proposeErr)) {
            console.error(
              '  FAIL propose_species_catalog_entry — run sql/add_detection_search.sql first',
            );
          } else {
            console.error('  FAIL propose_species_catalog_entry (auth):', proposeErr.message);
          }
          failed = true;
        } else if (!proposedId) {
          console.error('  FAIL propose_species_catalog_entry — returned null id');
          failed = true;
        } else {
          console.log(`  OK   propose_species_catalog_entry id=${proposedId}`);

          const { data: afterPropose, error: syncAfterErr } = await probeClient.rpc(
            'sync_species_catalog',
            {
              p_updated_after: new Date(Date.now() - 60_000).toISOString(),
              p_limit: 50,
              p_offset: 0,
              p_catalog_sources: ['community', 'enrichment'],
            },
          );

          if (syncAfterErr) {
            console.error('  FAIL sync after propose:', syncAfterErr.message);
            failed = true;
          } else {
            const found = (afterPropose ?? []).some(
              (row) => row.id === proposedId || row.scientific_name?.toLowerCase() === probeGenus,
            );
            if (!found) {
              console.error('  FAIL sync after propose — community row not returned');
              failed = true;
            } else {
              console.log('  OK   Gemini-style propose + sync round-trip');
            }
          }
        }
      }
    } finally {
      const { error: deleteCatalogErr } = await admin
        .from('species_catalog')
        .delete()
        .eq('id', probeGenus);
      if (deleteCatalogErr) {
        console.log('  NOTE cleanup species_catalog:', deleteCatalogErr.message);
      }
      const { error: deleteUserErr } = await admin.auth.admin.deleteUser(probeId);
      if (deleteUserErr) {
        console.log('  NOTE cleanup probe user:', deleteUserErr.message);
      }
    }
  }
}

if (failed) {
  console.log('\nSpecies catalog verify FAILED — apply missing SQL in Supabase SQL Editor.\n');
  process.exit(1);
}

console.log('\nSpecies catalog + parks paths OK.\n');
