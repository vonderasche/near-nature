import { describe, expect, it } from 'vitest';

import { FIRST_SPECIES_DISCOVERY_BONUS_POINTS } from '@/lib/discoveries/discoveryBonus';
import type { NewSpeciesDiscovery } from '@/types/species-discovery';

function mapNewSpeciesDiscovery(
  discoveryRow: { id: string } | null,
  commonName: string,
  latinName: string,
): NewSpeciesDiscovery | null {
  if (!discoveryRow) return null;
  return {
    commonName,
    latinName,
    bonusPoints: FIRST_SPECIES_DISCOVERY_BONUS_POINTS,
  };
}

describe('mapNewSpeciesDiscovery', () => {
  it('returns null when no discovery row', () => {
    expect(mapNewSpeciesDiscovery(null, 'Blue Jay', 'Cyanocitta cristata')).toBeNull();
  });

  it('returns discovery payload with bonus points', () => {
    expect(mapNewSpeciesDiscovery({ id: 'x' }, 'Blue Jay', 'Cyanocitta cristata')).toEqual({
      commonName: 'Blue Jay',
      latinName: 'Cyanocitta cristata',
      bonusPoints: 5,
    });
  });
});
