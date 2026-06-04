import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { resolveSupabaseUrl } from '@/lib/supabase/resolveSupabaseUrl';

/** Trim so stray spaces/newlines from .env or CI never break fetch URLs or headers. */
const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseUrl = configuredUrl ? resolveSupabaseUrl(configuredUrl) : undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (__DEV__ && configuredUrl && supabaseUrl && configuredUrl !== supabaseUrl) {
  console.info(`[supabase] Using ${supabaseUrl} (from ${configuredUrl} on device/emulator)`);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to .env and restart Expo.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});