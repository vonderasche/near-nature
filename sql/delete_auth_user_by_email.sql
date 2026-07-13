-- Delete one Supabase Auth user and all associated app data.

--

-- DB cascade (via public.users FK): detections, discoveries, streaks, point_awards,

-- user_badge_progress, ml_telemetry_events.

-- species_catalog.proposed_by → set null.

--

-- Storage CANNOT be deleted here — Supabase blocks direct DELETE on storage.objects.

-- Run first (from repo root, with SUPABASE_SERVICE_ROLE_KEY in .env):

--   node scripts/delete-user-by-email.mjs you@example.com --dry-run

--   node scripts/delete-user-by-email.mjs you@example.com

--

-- Or delete only DB/auth (orphans storage under {user_id}/ in detections + ml-telemetry):

--   run the DELETE block below in SQL Editor.





-- ── PREVIEW (safe to run first) ───────────────────────────────────────────────



with target as (

  select id, email, created_at

  from auth.users

  where lower(email) = lower('blazefiddes@gmail.com')

)

select

  t.id as user_id,

  t.email,

  t.created_at as auth_created_at,

  (select count(*) from public.detections d where d.user_id = t.id) as detections,

  (select count(*) from public.discoveries disc where disc.user_id = t.id) as discoveries,

  (select count(*) from public.point_awards pa where pa.user_id = t.id) as point_awards,

  (select count(*) from public.user_badge_progress ubp where ubp.user_id = t.id) as badge_rows,

  (select count(*) from public.streaks s where s.user_id = t.id) as streaks,

  (select count(*) from public.ml_telemetry_events e where e.user_id = t.id) as telemetry_events,

  (select count(*) from storage.objects o

     where o.bucket_id in ('detections', 'ml-telemetry')

       and (storage.foldername(o.name))[1] = t.id::text) as storage_objects

from target t;



-- Orphan public.users row (no auth.users row):

select id, email, username, created_at

from public.users

where lower(email) = lower('blazefiddes@gmail.com')

  and id not in (select id from auth.users);





-- ── DELETE auth + DB only (irreversible) ──────────────────────────────────────

-- Prefer: node scripts/delete-user-by-email.mjs blazefiddes@gmail.com



do $$

declare

  target_email constant text := 'blazefiddes@gmail.com';

  uid uuid;

begin

  select u.id into uid

  from auth.users u

  where lower(u.email) = lower(target_email);



  if uid is null then

    delete from public.users

    where lower(email) = lower(target_email);



    if found then

      raise notice 'No auth.users row; deleted orphan public.users for %', target_email;

    else

      raise notice 'No user found for %', target_email;

    end if;

    return;

  end if;



  delete from auth.users where id = uid;



  raise notice 'Deleted auth user % (%). Storage under %/ must be removed via Storage API (see scripts/delete-user-by-email.mjs).', target_email, uid, uid;

end $$;



-- Verify gone:

select id, email from auth.users where lower(email) = lower('blazefiddes@gmail.com');

select id, email from public.users where lower(email) = lower('blazefiddes@gmail.com');

