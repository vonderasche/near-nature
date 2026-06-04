function paramsFromCallbackUrl(url: string): URLSearchParams {
  const hashIdx = url.indexOf('#');
  const search =
    hashIdx >= 0
      ? url.slice(hashIdx + 1)
      : url.includes('?')
        ? url.split('?').slice(1).join('?')
        : '';
  return new URLSearchParams(search);
}

/** OAuth error returned in the redirect URL (`error`, `error_description`). */
export function parseOAuthCallbackError(url: string): string | null {
  const params = paramsFromCallbackUrl(url);
  const description = params.get('error_description')?.trim();
  if (description) return description;
  const code = params.get('error')?.trim();
  if (!code) return null;
  if (code === 'access_denied') return 'Google sign-in was declined.';
  return code.replace(/_/g, ' ');
}
