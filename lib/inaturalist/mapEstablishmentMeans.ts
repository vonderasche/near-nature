import type { SpeciesStatus } from '@/types';

/**
 * Maps iNaturalist establishment_means strings to app status.
 *
 * iNaturalist values: native, endemic, introduced, naturalised,
 * invasive, widespread invasive, managed, vagrant
 */
export function mapEstablishmentMeansToSpeciesStatus(means: string | null | undefined): SpeciesStatus {
  if (means == null || means.trim() === '') return 'unknown';

  const lower = means.trim().toLowerCase();

  if (lower === 'native' || lower === 'endemic') {
    return 'native';
  }

  if (lower === 'invasive' || lower === 'widespread invasive') {
    return 'invasive';
  }

  if (
    lower === 'introduced' ||
    lower === 'naturalised' ||
    lower === 'naturalized' ||
    lower === 'managed' ||
    lower === 'vagrant'
  ) {
    return 'non-native';
  }

  return 'unknown';
}

/** Pick the US state place from iNaturalist autocomplete results. */
export function pickUsStatePlaceId(
  results: Array<{ id: number; name: string; display_name?: string }> | undefined,
  stateName: string,
): number | null {
  if (!results?.length) return null;

  const target = stateName.trim().toLowerCase();
  const usStates = results.filter((r) => (r.display_name ?? '').trim().endsWith(', US'));

  const exact = usStates.find((r) => r.name.trim().toLowerCase() === target);
  if (exact) return exact.id;

  return usStates[0]?.id ?? null;
}
