# Google sign-in (Supabase + Expo)

The app uses Supabase OAuth with `expo-web-browser` (`Continue with Google` on login/signup).

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Create an **OAuth client ID** of type **Web application** (not Android/iOS for this flow).
3. **Authorized redirect URIs** — add your Supabase Auth callback (hosted):

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   Example: `https://axvubbqcdbxsetqwvjof.supabase.co/auth/v1/callback`

4. Copy **Client ID** and **Client secret**.

## 2. Supabase Dashboard (hosted project)

1. **Authentication** → **Providers** → **Google** → Enable.
2. Paste **Client ID** and **Client secret** from Google.
3. **Authentication** → **URL configuration**:
   - **Site URL**: your app site or `https://YOUR_PROJECT_REF.supabase.co` for testing.
   - **Redirect URLs** — add every URL the app uses (one per line):

   ```text
   nearnature://auth/callback
   nearnature://reset-password
   ```

   When developing with Expo dev client, also add the `exp://…` URLs printed in Metro when you tap **Continue with Google** (see `devLog('[auth] Google OAuth redirectTo', …)`), for example:

   ```text
   exp://192.168.1.10:8081/--/auth/callback
   ```

   To list URLs from code in a debug build, import `listAuthRedirectUrlsForSupabase` from `@/services/authService`.

4. Ensure database profile SQL is applied: `sql/create_user.sql` or at least `sql/ensure_public_user_profile.sql` (creates `public.users` on first Google sign-in).

5. Reload schema cache if needed: `NOTIFY pgrst, 'reload schema';`

## 3. Local Supabase (optional)

In project `.env` (not committed):

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

`supabase/config.toml` already references these for `[auth.external.google]`.

Redirect URI for local Google client: `http://127.0.0.1:54321/auth/v1/callback`

## 4. App

- Scheme: `nearnature` (`app.json` → `expo.scheme`).
- OAuth callback path: `/auth/callback` → `nearnature://auth/callback`.
- No Google keys in the mobile `.env`; only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Rebuild or restart Expo after changing `.env`.

## 5. Troubleshooting

| Symptom | Fix |
|--------|-----|
| Browser opens then “cancelled” | Add exact `redirectTo` URL to Supabase **Redirect URLs** |
| `redirect_uri_mismatch` in browser | Google client must list `https://PROJECT.supabase.co/auth/v1/callback` |
| Signed in but “Account setup” | Run `sql/ensure_public_user_profile.sql`, tap **Try again** |
| `Provider misconfigured` | Enable Google in Supabase and verify client ID/secret |
| Works on emulator, not phone | Add dev `exp://…/--/auth/callback` redirect URL; use same Wi‑Fi / LAN |
