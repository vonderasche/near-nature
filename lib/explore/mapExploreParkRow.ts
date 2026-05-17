import type { ExplorePark } from '@/lib/explore/exploreParkTypes';
import { asRecord, readNumber, readString } from '@/lib/supabase/readRowFields';

export function mapExploreParkRow(raw: unknown): ExplorePark {
  const r = asRecord(raw);

  return {
    id: String(r.id ?? ''),
    name: readString(r, ['name']) ?? 'Park',
    lat: readNumber(r, ['lat']),
    lng: readNumber(r, ['lng']),
    county: readString(r, ['county']) ?? '',
    state: readString(r, ['state']) ?? '',
    description: readString(r, ['description']),
    websiteUrl: readString(r, ['website_url', 'websiteUrl']),
    imageUrl: readString(r, ['image_url', 'imageUrl']),
    totalSpecies: readNumber(r, ['total_species', 'totalSpecies']),
    birdCount: readNumber(r, ['bird_count', 'birdCount']),
    reptileCount: readNumber(r, ['reptile_count', 'reptileCount']),
    mammalCount: readNumber(r, ['mammal_count', 'mammalCount']),
    plantCount: readNumber(r, ['plant_count', 'plantCount']),
    insectCount: readNumber(r, ['insect_count', 'insectCount']),
  };
}
