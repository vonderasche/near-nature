import { splitPipeList } from '@/lib/parks/parseFloridaStateParksCsv';
import { zipSpeciesHighlights } from '@/lib/parks/parkSpeciesHighlights';
import type { FloridaStatePark } from '@/types/florida-state-park';

export type FloridaStateParkSnakeFields = {
  park_id: string;
  unit_id: string;
  park_name: string;
  web_alias: string;
  county: string;
  district: string;
  acreage: string;
  address: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  gps_source: string;
  has_gps: string;
  park_page_url: string;
  image_url: string;
  image_source: string;
  image_license: string;
  image_attribution: string;
  description: string;
  top_plants: string;
  top_plant_images: string;
  top_animals: string;
  top_animal_images: string;
  public_access: string;
  data_source: string;
  updated_at: string;
};

function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseBoolean(raw: string | boolean): boolean {
  if (typeof raw === 'boolean') return raw;
  return raw.trim().toLowerCase() === 'true';
}

function asString(value: string | number | null | undefined): string {
  if (value == null) return '';
  return String(value).trim();
}

/** Map CSV columns or Supabase snake_case row fields to `FloridaStatePark`. */
export function floridaStateParkFromSnakeFields(
  record: Partial<FloridaStateParkSnakeFields> & Pick<FloridaStateParkSnakeFields, 'park_id' | 'park_name'>,
): FloridaStatePark {
  return {
    parkId: record.park_id,
    unitId: asString(record.unit_id),
    parkName: record.park_name,
    webAlias: asString(record.web_alias),
    county: asString(record.county),
    district: parseOptionalNumber(asString(record.district)),
    acreage: parseOptionalNumber(asString(record.acreage)),
    address: asString(record.address),
    city: asString(record.city),
    state: asString(record.state) || 'FL',
    latitude: parseOptionalNumber(asString(record.latitude)),
    longitude: parseOptionalNumber(asString(record.longitude)),
    gpsSource: asString(record.gps_source),
    hasGps: parseBoolean(record.has_gps ?? false),
    parkPageUrl: asString(record.park_page_url),
    imageUrl: asString(record.image_url),
    imageSource: asString(record.image_source),
    imageLicense: asString(record.image_license),
    imageAttribution: asString(record.image_attribution),
    description: asString(record.description),
    topPlants: zipSpeciesHighlights(
      splitPipeList(asString(record.top_plants)),
      splitPipeList(asString(record.top_plant_images)),
    ),
    topAnimals: zipSpeciesHighlights(
      splitPipeList(asString(record.top_animals)),
      splitPipeList(asString(record.top_animal_images)),
    ),
    publicAccess: asString(record.public_access),
    dataSource: asString(record.data_source),
    updatedAt: asString(record.updated_at),
  };
}
