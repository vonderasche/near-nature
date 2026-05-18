-- Dev / reset: delete one Supabase Auth user so you can sign up again with the same email.
-- public.users is removed automatically when present (FK on auth.users.id).
--
-- 1. Replace the email below.
-- 2. Run in Supabase SQL Editor.
-- 3. Reload app and sign up again.

-- delete from auth.users where email = 'you@example.com';
