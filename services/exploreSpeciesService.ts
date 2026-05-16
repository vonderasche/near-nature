import { mapExploreSpeciesRow } from '@/lib/explore/mapExploreSpeciesRow';
import type { ExploreSpecies, ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';
import { supabase } from '@/lib/supabase';

export type { ExploreSpecies, ExploreSpeciesType };

/**
 * Loads curated explore species for a US state and category (`animals` | `plants`).
 * Table: `public.explore_species` (see `sql/explore_species_public_read.sql` for RLS).
 */
export async function fetchExploreSpecies(
  stateName: string,
  type: ExploreSpeciesType,
  limit = 100,
): Promise<ExploreSpecies[]> {
  const state = stateName.trim();
  if (!state) return [];

  const { data, error } = await supabase
    .from('explore_species')
    .select(
      'id, inaturalist_id, latin_name, common_name, type, iconic_taxon_name, observations_count, rank, state, wikipedia_url, image_url, wiki_summary, wiki_image_url, is_featured, bonus_points',
    )
    .eq('state', state)
    .eq('type', type)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapExploreSpeciesRow);
}
