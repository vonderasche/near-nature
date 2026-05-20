import { supabase } from '@/lib/supabase';

export type UpsertSpeciesMetadataInput = {
  latinName: string;
  commonName?: string | null;
  aliases?: readonly string[];
};

/** Merges alternate common names / synonyms for a species (shared across detections). */
export async function upsertSpeciesMetadata(input: UpsertSpeciesMetadataInput): Promise<void> {
  const latinName = input.latinName.trim();
  if (!latinName) return;

  const aliases = (input.aliases ?? [])
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  const { error } = await supabase.rpc('upsert_species_metadata', {
    p_latin_name: latinName,
    p_common_name: input.commonName?.trim() || null,
    p_aliases: aliases,
  });

  if (error) throw error;
}
