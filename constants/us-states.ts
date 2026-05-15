/** US states and DC for profile + native-species lookups (two-letter codes). */
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

export type UsStateCode = (typeof US_STATES)[number]['code'];

const NAME_TO_CODE = new Map(
  US_STATES.map((s) => [s.name.toLowerCase(), s.code] as const),
);

/** Normalize to uppercase two-letter code, or null if unknown. */
export function normalizeUsStateCode(input: string | null | undefined): UsStateCode | null {
  if (!input?.trim()) return null;
  const t = input.trim();
  if (t.length === 2) {
    const code = t.toUpperCase();
    return US_STATES.some((s) => s.code === code) ? (code as UsStateCode) : null;
  }
  return NAME_TO_CODE.get(t.toLowerCase()) ?? null;
}

export function usStateLabel(code: string | null | undefined): string {
  const normalized = normalizeUsStateCode(code);
  if (!normalized) return 'Select your state';
  const row = US_STATES.find((s) => s.code === normalized);
  return row ? `${row.name} (${row.code})` : normalized;
}

/** Map reverse-geocode region string to a US state code. */
export function usStateCodeFromRegion(region: string | null | undefined): UsStateCode | null {
  if (!region?.trim()) return null;
  const r = region.trim();
  const byName = normalizeUsStateCode(r);
  if (byName) return byName;
  // "California, United States" or "CA"
  const first = r.split(',')[0]?.trim() ?? r;
  return normalizeUsStateCode(first);
}
