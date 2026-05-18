import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

function isLocalSupabaseUrl(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function replaceLocalHost(url: string, host: string): string {
  const parsed = new URL(url);
  parsed.hostname = host;
  return parsed.toString().replace(/\/$/, '');
}

/** LAN IP override for physical devices (optional in .env). */
function devHostOverride(): string | null {
  const raw = process.env.EXPO_PUBLIC_SUPABASE_DEV_HOST?.trim();
  return raw || null;
}

/** Host machine IP from Expo dev server (e.g. `192.168.1.5:8081` → `192.168.1.5`). */
function hostFromExpoDebugger(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (
      Constants.manifest2 as
        | { extra?: { expoClient?: { debuggerHost?: string } } }
        | undefined
    )?.extra?.expoClient?.debuggerHost;
  if (!debuggerHost) return null;
  return debuggerHost.split(':')[0] ?? null;
}

/**
 * React Native cannot reach the dev machine via `127.0.0.1` on a physical device or
 * Android emulator. Rewrites local Supabase URLs only; cloud URLs are unchanged.
 */
export function resolveSupabaseUrl(configuredUrl: string): string {
  if (!isLocalSupabaseUrl(configuredUrl)) {
    return configuredUrl;
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return replaceLocalHost(configuredUrl, '10.0.2.2');
  }

  if (Constants.isDevice) {
    const host = devHostOverride() ?? hostFromExpoDebugger();
    if (host) {
      return replaceLocalHost(configuredUrl, host);
    }
  }

  return configuredUrl;
}
