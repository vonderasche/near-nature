-- Explorer Board: ranked by distinct native species discovered (non-sensitive saves).

-- Paginated via p_limit / p_offset. Global rank is preserved across pages.

-- Also returns total points, latest public identification image URL, and species counts.

-- Includes motto from public.users.

-- SECURITY DEFINER so authenticated users can see aggregate rankings without

-- reading other users' individual detection rows under RLS.

-- Safe to re-run.



drop function if exists public.get_detection_count_leaderboard();

drop function if exists public.get_detection_count_leaderboard(int, int);

drop function if exists public.get_detection_count_leaderboard(int, int, text);



create or replace function public.get_detection_count_leaderboard(

  p_limit int default 20,

  p_offset int default 0,

  p_search text default null

)

returns table (

  leaderboard_rank              bigint,

  user_id                       uuid,

  username                      text,

  avatar_url                    text,

  motto                         text,

  total_points                  bigint,

  recent_detection_image_urls   text[],

  native_species_count          bigint,

  non_native_species_count      bigint

)

language sql

security definer

set search_path = public

stable

as $$

  with ranked as (

    select

      u.id                                            as user_id,

      u.username                                      as username,

      coalesce(u.avatar_url, '')                      as avatar_url,

      nullif(trim(u.motto), '')                       as motto,

      (
        coalesce(sum(d.points), 0)
        + coalesce((
          select sum(pa.points)
          from public.point_awards pa
          where pa.user_id = u.id
        ), 0)
      )::bigint                                       as total_points,

      (

        select coalesce(array_agg(latest.image_url order by latest.detected_at desc), array[]::text[])

        from (

          select d2.image_url, d2.detected_at

          from public.detections d2

          where d2.user_id = u.id

            and d2.is_sensitive = false

          order by d2.detected_at desc

          limit 1

        ) latest

      )                                               as recent_detection_image_urls,

      count(distinct d.latin_name) filter (

        where d.native_status = 'native'

      )::bigint                                       as native_species_count,

      count(distinct d.latin_name) filter (

        where d.native_status <> 'native'

      )::bigint                                       as non_native_species_count

    from public.users u

    inner join public.detections d

      on d.user_id = u.id

     and d.is_sensitive = false

    group by u.id, u.username, u.avatar_url, u.motto

  ),

  ordered as (

    select

      row_number() over (

        order by native_species_count desc, non_native_species_count desc, username asc

      ) as leaderboard_rank,

      user_id,

      username,

      avatar_url,

      motto,

      total_points,

      recent_detection_image_urls,

      native_species_count,

      non_native_species_count

    from ranked

  )

  select

    leaderboard_rank,

    user_id,

    username,

    avatar_url,

    motto,

    total_points,

    recent_detection_image_urls,

    native_species_count,

    non_native_species_count

  from ordered

  where coalesce(nullif(trim(p_search), ''), null) is null

     or username ilike '%' || trim(p_search) || '%'

     or coalesce(motto, '') ilike '%' || trim(p_search) || '%'

  order by leaderboard_rank asc

  limit greatest(coalesce(p_limit, 20), 0)

  offset greatest(coalesce(p_offset, 0), 0);

$$;



revoke all on function public.get_detection_count_leaderboard(int, int, text) from public;

grant execute on function public.get_detection_count_leaderboard(int, int, text) to authenticated;
grant execute on function public.get_detection_count_leaderboard(int, int, text) to anon;

