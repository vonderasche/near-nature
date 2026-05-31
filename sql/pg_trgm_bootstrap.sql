-- pg_trgm bootstrap: Supabase may install the extension in `extensions` or `public`.
-- Safe to re-run. Call before GIN trigram indexes in add_detection_search / harden scripts.

create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
    create extension pg_trgm with schema extensions;
  end if;
end $$;

-- Returns qualified opclass, e.g. extensions.gin_trgm_ops or public.gin_trgm_ops
create or replace function public._gin_trgm_opclass_for_index()
returns text
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, extensions
as $$
declare
  v_ops text;
begin
  select n.nspname || '.' || oc.opcname
  into v_ops
  from pg_opclass oc
  join pg_namespace n on n.oid = oc.opcnamespace
  join pg_am am on am.oid = oc.opcmethod
  where oc.opcname = 'gin_trgm_ops'
    and am.amname = 'gin'
  order by case n.nspname when 'extensions' then 0 when 'public' then 1 else 2 end
  limit 1;

  if v_ops is null then
    raise exception
      'pg_trgm is not installed. In Supabase: Database → Extensions → enable pg_trgm, then re-run this script.';
  end if;

  return v_ops;
end;
$$;

-- Creates (or skips) one GIN trigram index using the resolved opclass.
create or replace function public._create_gin_trgm_index(
  p_index name,
  p_table regclass,
  p_column name
)
returns void
language plpgsql
security invoker
set search_path = pg_catalog, public, extensions
as $$
declare
  v_ops text := public._gin_trgm_opclass_for_index();
begin
  execute format(
    'create index if not exists %I on %s using gin (%I %s)',
    p_index,
    p_table,
    p_column,
    v_ops
  );
end;
$$;

grant execute on function public._gin_trgm_opclass_for_index() to postgres, anon, authenticated, service_role;
grant execute on function public._create_gin_trgm_index(name, regclass, name) to postgres, anon, authenticated, service_role;
