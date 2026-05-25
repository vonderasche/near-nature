-- Backfill badge progress and newly eligible point awards after deploying badge progress tables.
-- Safe to re-run: point_awards uses (user_id, award_key) conflict protection.

select public.check_category_milestones(d.user_id)
from (
  select distinct user_id
  from public.discoveries
  where user_id is not null
) d;
