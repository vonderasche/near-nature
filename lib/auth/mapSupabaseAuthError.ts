/**
 * Turns low-level Supabase / fetch failures into actionable copy.
 * "JSON parse" / "Unexpected token" usually means the response body was not JSON
 * (HTML error page, captive portal, proxy, or TLS interception)—common on real devices
 * on different networks vs emulators.
 */
export function mapSupabaseAuthErrorMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (
    m.includes('unexpected token') ||
    m.includes('unexpected character') ||
    m.includes('json parse') ||
    m.includes('failed to parse') ||
    (m.includes('syntaxerror') && m.includes('json')) ||
    (m.includes('parse') && (m.includes('json') || m.includes('position')))
  ) {
    return (
      'Sign-in could not read the server response. This often happens on a phone network ' +
      '(captive portal, VPN, firewall, or weak signal returning an HTML page instead of JSON). ' +
      'Try another network (e.g. Wi‑Fi vs mobile data), turn off VPN, or open the browser on ' +
      'that network first. If you use a release APK, rebuild after saving EXPO_PUBLIC_SUPABASE_URL ' +
      'and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.'
    );
  }

  if (m.includes('network request failed') || m.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  return raw;
}
