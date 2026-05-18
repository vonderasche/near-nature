import { mapDbNativeToSpeciesStatus } from '@/lib/detections/mapDbNativeToSpeciesStatus';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import { supabase } from '@/lib/supabase';
import type { SpeciesStatus } from '@/types';

export type SavedSpeciesEnrichment = {
  latinName: string;
  commonName: string;
  status: SpeciesStatus;
  description: string | null;
  inaturalistId: string | null;
};

type DetectionEnrichmentRow = {
  latin_name: string;
  common_name: string;
  native_status: string;
  description: string | null;
  inaturalist_id: string | null;
  detected_at: string;
};

function latinNameQueryVariants(latinNames: readonly string[]): string[] {
  const variants = new Set<string>();
  for (const raw of latinNames) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    variants.add(trimmed);
    variants.add(trimmed.toLowerCase());
  }
  return [...variants];
}

/**
 * Latest saved detection per latin name for this user (for skipping iNat/wiki on re-identify).
 */
export async function fetchSavedSpeciesEnrichmentByLatinNames(
  userId: string,
  latinNames: readonly string[],
): Promise<Map<string, SavedSpeciesEnrichment>> {
  const wanted = new Set(
    latinNames.map(normalizeLatinName).filter((name) => name.length > 0),
  );
  if (wanted.size === 0) return new Map();

  const variants = latinNameQueryVariants(latinNames);
  if (variants.length === 0) return new Map();

  const { data, error } = await supabase
    .from('detections')
    .select('latin_name, common_name, native_status, description, inaturalist_id, detected_at')
    .eq('user_id', userId)
    .in('latin_name', variants)
    .order('detected_at', { ascending: false });

  if (error) throw error;

  const out = new Map<string, SavedSpeciesEnrichment>();
  for (const row of (data ?? []) as DetectionEnrichmentRow[]) {
    const key = normalizeLatinName(row.latin_name);
    if (!wanted.has(key) || out.has(key)) continue;

    out.set(key, {
      latinName: row.latin_name.trim(),
      commonName: String(row.common_name ?? '').trim(),
      status: mapDbNativeToSpeciesStatus(String(row.native_status ?? 'unknown')),
      description:
        typeof row.description === 'string' && row.description.trim().length > 0
          ? row.description.trim()
          : null,
      inaturalistId:
        typeof row.inaturalist_id === 'string' && row.inaturalist_id.trim().length > 0
          ? row.inaturalist_id.trim()
          : null,
    });
  }

  return out;
}
