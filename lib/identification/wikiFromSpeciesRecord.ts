import type { SpeciesWikiData } from '@/api/wikipedia';
import type { SpeciesRecord } from '@/types/speciesRecord';

/** Builds identification wiki UI data from the on-device species catalog. */
export function wikiFromSpeciesRecord(record: SpeciesRecord): SpeciesWikiData | null {
  const description = record.description.trim();
  if (!description) return null;

  const title = record.scientificName.trim().replace(/ /g, '_');
  const wikipediaUrl = record.sourceUrls.wikipedia?.trim();
  const funFacts =
    record.interestingFacts.length > 0 ? record.interestingFacts : record.identificationTraits;
  const imageUrl =
    record.sourceUrls.thumbnail?.trim() ||
    record.sourceUrls.defaultPhotoUrl?.trim() ||
    null;

  return {
    description,
    fullDescription: description,
    imageUrl,
    funFacts,
    pageUrl:
      wikipediaUrl ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}
