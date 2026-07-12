/** Mirrors python/v13/inference/cascade.py taxonomy */

export const V13_PLANT_GROUPS = ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses', 'coontie'] as const;

export const V13_ANIMAL_GROUPS = [
  'birds',
  'herps',
  'lepidoptera',
  'insects',
  'arachnids',
  'wild_mammals',
  'domestic_mammals',
] as const;

export type V13PlantGroup = (typeof V13_PLANT_GROUPS)[number];
export type V13AnimalGroup = (typeof V13_ANIMAL_GROUPS)[number];

export type V13SpecialistGroup = V13PlantGroup | V13AnimalGroup;

export type V13RouterKey = 'plant_router' | 'animal_router';

export type V13StageKey = 'kingdom' | V13RouterKey | V13SpecialistGroup;

export function isV13SpecialistGroup(value: string): value is V13SpecialistGroup {
  return (
    (V13_PLANT_GROUPS as readonly string[]).includes(value) ||
    (V13_ANIMAL_GROUPS as readonly string[]).includes(value)
  );
}

export function v13StageFolder(key: V13StageKey): string {
  if (key === 'kingdom') return 'step01_kingdom';
  if (key === 'plant_router') return 'step02_plant_router';
  if (key === 'animal_router') return 'step03_animal_router';
  return key;
}

export function v13TfliteBase(key: V13StageKey): string {
  if (key === 'kingdom') return 'kingdom';
  if (key === 'plant_router') return 'plant_router';
  if (key === 'animal_router') return 'animal_router';
  return key;
}
