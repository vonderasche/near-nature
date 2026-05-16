import type { ExploreSpecies, ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';

function readString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key];
    if (typeof v === 'string') {
      const t = v.trim();
      if (t.length > 0) return t;
    }
  }
  return null;
}

function readNumber(record: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const n = Number(record[key]);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function readType(raw: unknown): ExploreSpeciesType {
  const t = String(raw ?? '').trim().toLowerCase();
  return t === 'plants' ? 'plants' : 'animals';
}

/** Maps a Supabase `explore_species` row (snake_case). */
export function mapExploreSpeciesRow(raw: unknown): ExploreSpecies {
  const r =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  return {
    id: String(r.id ?? ''),
    inaturalistId: readNumber(r, ['inaturalist_id', 'inaturalistId']),
    latinName: readString(r, ['latin_name', 'latinName']) ?? '',
    commonName: readString(r, ['common_name', 'commonName']) ?? 'Unknown',
    type: readType(r.type),
    iconicTaxonName: readString(r, ['iconic_taxon_name', 'iconicTaxonName']),
    observationsCount: readNumber(r, ['observations_count', 'observationsCount']),
    rank: readNumber(r, ['rank']),
    state: readString(r, ['state']) ?? '',
    wikipediaUrl: readString(r, ['wikipedia_url', 'wikipediaUrl']),
    imageUrl: readString(r, ['image_url', 'imageUrl']),
    wikiSummary: readString(r, ['wiki_summary', 'wikiSummary']),
    wikiImageUrl: readString(r, ['wiki_image_url', 'wikiImageUrl']),
    isFeatured: Boolean(r.is_featured ?? r.isFeatured),
    bonusPoints: readNumber(r, ['bonus_points', 'bonusPoints']),
  };
}
