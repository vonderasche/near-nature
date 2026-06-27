import { floridaStateParkFromSnakeFields } from '@/lib/parks/floridaStateParkFromSnakeFields';
import { supabase } from '@/lib/supabase';
import type { FloridaStatePark } from '@/types/florida-state-park';

export type FloridaStateParksDbRow = {
  park_id: string;
  unit_id: string | null;
  park_name: string;
  web_alias: string | null;
  county: string | null;
  district: string | null;
  acreage: number | string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_source: string | null;
  has_gps: boolean | null;
  park_page_url: string | null;
  image_url: string | null;
  image_source: string | null;
  image_license: string | null;
  image_attribution: string | null;
  description: string | null;
  top_plants: string | null;
  top_plant_images: string | null;
  top_animals: string | null;
  top_animal_images: string | null;
  public_access: string | null;
  data_source: string | null;
  updated_at: string | null;
};

function dbRowToSnakeFields(row: FloridaStateParksDbRow) {
  return {
    park_id: row.park_id,
    unit_id: row.unit_id ?? '',
    park_name: row.park_name,
    web_alias: row.web_alias ?? '',
    county: row.county ?? '',
    district: row.district != null ? String(row.district) : '',
    acreage: row.acreage != null ? String(row.acreage) : '',
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? 'FL',
    latitude: row.latitude != null ? String(row.latitude) : '',
    longitude: row.longitude != null ? String(row.longitude) : '',
    gps_source: row.gps_source ?? '',
    has_gps: row.has_gps != null ? String(row.has_gps) : 'false',
    park_page_url: row.park_page_url ?? '',
    image_url: row.image_url ?? '',
    image_source: row.image_source ?? '',
    image_license: row.image_license ?? '',
    image_attribution: row.image_attribution ?? '',
    description: row.description ?? '',
    top_plants: row.top_plants ?? '',
    top_plant_images: row.top_plant_images ?? '',
    top_animals: row.top_animals ?? '',
    top_animal_images: row.top_animal_images ?? '',
    public_access: row.public_access ?? '',
    data_source: row.data_source ?? '',
    updated_at: row.updated_at ?? '',
  };
}

export function floridaStateParksDbRowToPark(row: FloridaStateParksDbRow): FloridaStatePark {
  return floridaStateParkFromSnakeFields(dbRowToSnakeFields(row));
}

/** Full catalog pull — ~180 rows; public read via RLS. */
export async function fetchFloridaStateParksFromSupabase(): Promise<FloridaStatePark[]> {
  const { data, error } = await supabase
    .from('florida_state_parks')
    .select(
      'park_id,unit_id,park_name,web_alias,county,district,acreage,address,city,state,latitude,longitude,gps_source,has_gps,park_page_url,image_url,image_source,image_license,image_attribution,description,top_plants,top_plant_images,top_animals,top_animal_images,public_access,data_source,updated_at',
    )
    .order('park_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => floridaStateParksDbRowToPark(row as FloridaStateParksDbRow))
    .filter((park) => park.parkId.length > 0 && park.parkName.length > 0);
}
