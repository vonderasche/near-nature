import type { GenusProfileJsonEntry, GenusProfilesJson, SpeciesRecord } from '@/types/speciesRecord';

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildSourceUrls(raw: GenusProfileJsonEntry): SpeciesRecord['sourceUrls'] {
  const urls = { ...(raw.sourceUrls ?? {}) };
  const thumbnail = nonEmptyString(raw.wikipediaThumbnail);
  const defaultPhotoUrl = nonEmptyString(raw.defaultPhoto?.url);
  if (thumbnail) urls.thumbnail = thumbnail;
  if (defaultPhotoUrl) urls.defaultPhotoUrl = defaultPhotoUrl;
  return urls;
}

function parseEntry(_id: string, raw: GenusProfileJsonEntry): SpeciesRecord | null {
  const genus = nonEmptyString(raw.genus);
  if (!genus) return null;

  const funFact = nonEmptyString(raw.funFact);
  const nativeRegion = nonEmptyString(raw.nativeRegion);

  return {
    id: genus,
    scientificName: genus,
    commonName: nonEmptyString(raw.commonName) ?? genus,
    group: nonEmptyString(raw.previewGroup) ?? '',
    floridaStatus: nativeRegion ?? 'unknown',
    taxonomy: {
      family: nonEmptyString(raw.familia),
      genus,
      phylum: nonEmptyString(raw.phylum),
      class: nonEmptyString(raw.classis),
      order: nonEmptyString(raw.ordo),
    },
    description: nonEmptyString(raw.description) ?? '',
    identificationTraits: [],
    interestingFacts: funFact ? [funFact] : [],
    sourceUrls: buildSourceUrls(raw),
    updatedAt: nonEmptyString(raw.updatedAt) ?? '',
    specialistId: nonEmptyString(raw.specialistId),
    inatTaxonId: raw.inatTaxonId ?? null,
  };
}

/** Parses bundled genus profiles (`{ "Asclepias": { genus, familia, ... } }`). */
export function parseGenusProfiles(catalog: GenusProfilesJson): SpeciesRecord[] {
  const records: SpeciesRecord[] = [];
  for (const [id, entry] of Object.entries(catalog)) {
    const record = parseEntry(id, entry);
    if (record) records.push(record);
  }
  return records;
}
