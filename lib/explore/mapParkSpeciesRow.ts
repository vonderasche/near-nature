import type { ParkSpeciesRow } from '@/lib/explore/exploreParkTypes';
import { asRecord, readNumber, readString } from '@/lib/supabase/readRowFields';

/** Maps a `get_park_species` RPC row (snake_case). */
export function mapParkSpeciesRow(raw: unknown): ParkSpeciesRow {
  const r = asRecord(raw);
  const inaturalistRaw = readNumber(r, ['inaturalist_id', 'inaturalistId'], 0);
  return {
    latinName: readString(r, ['latin_name', 'latinName']) ?? '',
    commonName: readString(r, ['common_name', 'commonName']) ?? '',
    category: readString(r, ['category']) ?? '',
    iconicTaxonName: readString(r, ['iconic_taxon_name', 'iconicTaxonName']),
    observationsCount: readNumber(r, ['observations_count', 'observationsCount']),
    imageUrl: readString(r, ['image_url', 'imageUrl']),
    inaturalistId: inaturalistRaw > 0 ? inaturalistRaw : null,
    isInExplore: Boolean(r.is_in_explore ?? r.isInExplore),
  };
}
