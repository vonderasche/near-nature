import type { SpeciesWikiData } from '@/api/wikipedia';

/** Reuses text stored on a prior `detections.description` (Wikipedia lead at save time). */
export function wikiFromSavedDescription(
  description: string | null | undefined,
  latinName: string,
): SpeciesWikiData | null {
  const text = description?.trim();
  if (!text) return null;

  const title = latinName.trim().replace(/ /g, '_');
  return {
    description: text,
    fullDescription: text,
    imageUrl: null,
    funFacts: [],
    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}
