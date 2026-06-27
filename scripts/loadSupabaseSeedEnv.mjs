import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadProjectEnv() {
  const root = resolve(__dirname, '..');
  const text = readFileSync(resolve(root, '.env'), 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

/** Seed/verify scripts need the service role secret — not the app's anon/publishable key. */
export function requireSupabaseSeedEnv(env) {
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnon = Boolean(env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

  if (!url) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
    process.exit(1);
  }

  if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    console.error('');
    console.error('  The app uses EXPO_PUBLIC_SUPABASE_ANON_KEY (publishable key).');
    console.error('  Seed scripts need the separate service_role secret (server-only).');
    console.error('');
    console.error('  Supabase Dashboard → Project Settings → API → service_role → Reveal');
    console.error('  Add to .env (do not commit, do not ship in the mobile app):');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret');
    if (hasAnon) {
      console.error('');
      console.error('  (EXPO_PUBLIC_SUPABASE_ANON_KEY is set — that is correct for the app, but not enough to seed.)');
    }
    process.exit(1);
  }

  return { url, serviceKey };
}
