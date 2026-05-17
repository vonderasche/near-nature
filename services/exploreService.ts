import { mapExploreParkRow } from '@/lib/explore/mapExploreParkRow';
import { mapExploreSpeciesRow } from '@/lib/explore/mapExploreSpeciesRow';
import { mapParkSpeciesRow } from '@/lib/explore/mapParkSpeciesRow';
import type { ExplorePark, ExploreParkSummary, ParkSpeciesRow } from '@/lib/explore/exploreParkTypes';
import type { ExploreSpecies, ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';
import { partitionExploreSpeciesByType } from '@/lib/explore/partitionExploreSpeciesByType';
import { supabase } from '@/lib/supabase';

export type { ExploreSpecies, ExploreSpeciesType };
export type { ExplorePark, ExploreParkSummary, ParkSpeciesRow };

const EXPLORE_SPECIES_SELECT =
  'id, inaturalist_id, latin_name, common_name, type, iconic_taxon_name, observations_count, rank, state, wikipedia_url, image_url, wiki_summary, wiki_image_url, is_featured, bonus_points';

/** All curated explore species for a state (single query; partition client-side). */
export async function fetchExploreSpeciesForState(
  stateName: string,
  limit = 500,
): Promise<ExploreSpecies[]> {
  const state = stateName.trim();
  if (!state) return [];

  const { data, error } = await supabase
    .from('explore_species')
    .select(EXPLORE_SPECIES_SELECT)
    .eq('state', state)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapExploreSpeciesRow);
}

/** @deprecated Prefer fetchExploreSpeciesForState + partitionExploreSpeciesByType */
export async function fetchExploreSpecies(
  stateName: string,
  type: ExploreSpeciesType,
  limit = 250,
): Promise<ExploreSpecies[]> {
  const all = await fetchExploreSpeciesForState(stateName, limit * 2);
  return partitionExploreSpeciesByType(all)[type];
}

export { partitionExploreSpeciesByType };

/** Current featured animal + plant via `get_featured_species()` RPC. */
export async function fetchFeaturedSpecies(): Promise<ExploreSpecies[]> {
  const { data, error } = await supabase.rpc('get_featured_species');
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(mapExploreSpeciesRow);
}

export async function fetchParksForState(stateName: string): Promise<ExplorePark[]> {
  const state = stateName.trim();
  if (!state) return [];

  const { data, error } = await supabase
    .from('parks_with_counts')
    .select('*')
    .eq('state', state)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapExploreParkRow);
}

type ParkSummaryRpcRow = {
  park_count: number | string;
  species_sightings: number | string;
};

export async function fetchExploreParkSummary(
  stateName: string,
  nearby?: { lat: number; lng: number; radiusKm?: number },
): Promise<ExploreParkSummary> {
  const state = stateName.trim();
  if (!state) {
    return { parkCount: 0, speciesSightings: 0, nearbyCount: null };
  }

  const { data, error } = await supabase.rpc('get_park_summary_for_state', { p_state: state });
  if (error) {
    const parks = await fetchParksForState(state);
    const speciesSightings = parks.reduce((sum, p) => sum + p.totalSpecies, 0);
    return { parkCount: parks.length, speciesSightings, nearbyCount: null };
  }

  const row = (Array.isArray(data) ? data[0] : null) as ParkSummaryRpcRow | null;
  const parkCount = Number(row?.park_count ?? 0);
  const speciesSightings = Number(row?.species_sightings ?? 0);

  let nearbyCount: number | null = null;
  if (nearby && Number.isFinite(nearby.lat) && Number.isFinite(nearby.lng)) {
    const { data: nearbyData, error: nearbyError } = await supabase.rpc('get_nearby_parks', {
      p_lat: nearby.lat,
      p_lng: nearby.lng,
      p_radius: nearby.radiusKm ?? 50,
    });
    if (!nearbyError && Array.isArray(nearbyData)) {
      nearbyCount = nearbyData.length;
    }
  }

  return {
    parkCount: Number.isFinite(parkCount) ? parkCount : 0,
    speciesSightings: Number.isFinite(speciesSightings) ? speciesSightings : 0,
    nearbyCount,
  };
}

export async function fetchParkSpecies(
  parkId: string,
  category?: string | null,
): Promise<ParkSpeciesRow[]> {
  const { data, error } = await supabase.rpc('get_park_species', {
    p_park_id: parkId,
    p_category: category ?? null,
  });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(mapParkSpeciesRow);
}

export async function fetchParkById(parkId: string): Promise<ExplorePark | null> {
  const { data, error } = await supabase.from('parks_with_counts').select('*').eq('id', parkId).maybeSingle();
  if (error) throw error;
  return data ? mapExploreParkRow(data) : null;
}
