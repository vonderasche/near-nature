-- Public read bucket for regional TFLite model packs (upload via service role in training CI).
insert into storage.buckets (id, name, public)
values ('region-models', 'region-models', true)
on conflict (id) do nothing;

drop policy if exists "Anon can read region model objects" on storage.objects;
drop policy if exists "Authenticated can read region model objects" on storage.objects;

create policy "Anon can read region model objects"
  on storage.objects for select
  to anon
  using (bucket_id = 'region-models');

create policy "Authenticated can read region model objects"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'region-models');

-- No client insert/update/delete — uploads use service role in scripts/CI only.
