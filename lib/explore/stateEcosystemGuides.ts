export type StateEcosystemGuide = {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl?: string;
};

/**
 * Curated regional guides (static TS content — not DB-backed).
 * Parks and species come from Supabase seeds; ecosystems stay in code until a `state_ecosystems` table exists.
 */
export const FLORIDA_ECOSYSTEMS: StateEcosystemGuide[] = [
  {
    id: 'everglades',
    code: 'NAT-01',
    title: 'The Everglades',
    description:
      "America's largest subtropical wilderness. Home to alligators, panthers, and wading birds.",
  },
  {
    id: 'springs',
    code: 'NAT-02',
    title: 'Florida Springs',
    description: 'Over 700 springs statewide. Manatees shelter here in winter.',
  },
  {
    id: 'coastal',
    code: 'NAT-03',
    title: 'Coastal & Mangroves',
    description: 'Nursery habitat for fish and nesting ground for shorebirds.',
  },
  {
    id: 'scrub',
    code: 'NAT-04',
    title: 'Scrub & Flatwoods',
    description: 'Home to the endangered Florida Scrub Jay and Gopher Tortoise.',
  },
];

const BY_STATE: Record<string, StateEcosystemGuide[]> = {
  Florida: FLORIDA_ECOSYSTEMS,
  FL: FLORIDA_ECOSYSTEMS,
};

export function ecosystemsForState(stateName: string): StateEcosystemGuide[] {
  const key = stateName.trim();
  return BY_STATE[key] ?? BY_STATE.Florida ?? [];
}
