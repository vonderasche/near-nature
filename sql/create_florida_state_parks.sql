-- Florida state parks reference table (import from florida_state_parks.csv)
-- Safe to re-run

drop table if exists public.florida_state_parks cascade;

create table public.florida_state_parks (
  park_id             text primary key,
  unit_id             text,
  park_name           text not null,
  web_alias           text,
  county              text,
  district            text,
  acreage             numeric(10, 2),
  address             text,
  city                text,
  state               text not null default 'FL',
  latitude            double precision,
  longitude           double precision,
  gps_source          text,
  has_gps             boolean not null default false,
  park_page_url       text,
  image_url           text,
  image_source        text,
  image_license       text,
  image_attribution   text,
  description         text,
  top_plants          text,
  top_animals         text,
  public_access       text,
  data_source         text,
  updated_at          date,
  created_at          timestamptz not null default now()
);

create index florida_state_parks_county_idx on public.florida_state_parks(county);
create index florida_state_parks_has_gps_idx on public.florida_state_parks(has_gps);
create index florida_state_parks_location_idx on public.florida_state_parks(latitude, longitude);

alter table public.florida_state_parks enable row level security;

create policy "Anyone can read Florida state parks"
  on public.florida_state_parks for select
  using (true);

comment on table public.florida_state_parks is
  'Reference catalog of Florida state parks for the Near Nature explore/discovery UI.';

comment on column public.florida_state_parks.image_url is
  'Optional hero image URL. Leave NULL unless you own the image or have a reusable license (CC/PD). Do not hotlink floridastateparks.org photos.';

comment on column public.florida_state_parks.image_source is
  'Where the image came from: user_upload, wikimedia_commons, in_app_detection, etc.';

comment on column public.florida_state_parks.image_license is
  'License string when image_url is set (e.g. CC-BY-4.0, CC0, public-domain, owned).';

comment on column public.florida_state_parks.image_attribution is
  'Credit line required by the license (photographer, Wikimedia file page, etc.).';
