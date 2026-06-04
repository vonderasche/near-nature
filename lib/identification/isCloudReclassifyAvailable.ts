import { supabase } from '@/lib/supabase';

const DEV_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() ?? '';

export function hasGeminiDevApiKey(): boolean {
  return DEV_GEMINI_KEY.length > 0;
}

/** True when reclassify can call identify-species (session) or the dev direct Gemini key. */
export async function isCloudReclassifyAvailable(): Promise<boolean> {
  if (hasGeminiDevApiKey()) {
    return true;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token != null;
}
