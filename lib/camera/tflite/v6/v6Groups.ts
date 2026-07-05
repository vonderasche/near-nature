/** Mirrors python/v6/groups.py — national vs regional specialist resolution. */

export const V6_NATIONAL_SPECIALIST_GROUPS = ['herps', 'lepidoptera', 'insects'] as const;

export type V6NationalSpecialistGroup = (typeof V6_NATIONAL_SPECIALIST_GROUPS)[number];

export const V6_PLANT_GROUPS = ['trees_shrubs', 'wildflowers_herbs', 'ferns_mosses'] as const;

export const V6_ANIMAL_GROUPS = [
  'birds',
  'herps',
  'lepidoptera',
  'insects',
  'arachnids',
  'common_mammals',
] as const;

export const V6_REGIONAL_SPECIALIST_GROUPS = [
  'trees_shrubs',
  'wildflowers_herbs',
  'ferns_mosses',
  'birds',
  'arachnids',
] as const;

export type V6SpecialistGroup =
  | (typeof V6_PLANT_GROUPS)[number]
  | (typeof V6_ANIMAL_GROUPS)[number];

export type V6RouterKey = 'plant_router' | 'animal_router';

export type V6StageKey = 'kingdom' | V6RouterKey | V6SpecialistGroup;

export function isV6NationalSpecialist(group: string): group is V6NationalSpecialistGroup {
  return (V6_NATIONAL_SPECIALIST_GROUPS as readonly string[]).includes(group);
}

export function isV6SpecialistGroup(value: string): value is V6SpecialistGroup {
  return (
    (V6_PLANT_GROUPS as readonly string[]).includes(value) ||
    (V6_ANIMAL_GROUPS as readonly string[]).includes(value)
  );
}

export function v6SpecialistUsesGlobalBundle(
  group: V6SpecialistGroup,
  captureMode: 'global' | 'regional',
): boolean {
  if (captureMode === 'global') {
    return true;
  }
  return group === 'common_mammals' || isV6NationalSpecialist(group);
}

export function v6StageUsesGlobalBundle(
  key: V6StageKey,
  captureMode: 'global' | 'regional',
): boolean {
  if (captureMode === 'global') {
    return true;
  }
  if (key === 'kingdom' || key === 'common_mammals') {
    return true;
  }
  if (key === 'plant_router' || key === 'animal_router') {
    return false;
  }
  return v6SpecialistUsesGlobalBundle(key, captureMode);
}
