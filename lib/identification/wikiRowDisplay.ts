import type { SpeciesWikiData } from '@/api/wikipedia';

/** How to render Wikipedia content for one species row on the identification screen. */
export type WikiRowDisplayState =
  | { kind: 'pending' }
  | { kind: 'empty' }
  | { kind: 'ready'; data: SpeciesWikiData };

/**
 * Maps stored fetch results to a display state. Keys missing from the record mean the client has
 * not finished loading that species yet; `null` means no article was found.
 */
export function getWikiRowDisplayState(
  latinName: string,
  wikiByLatinName: Record<string, SpeciesWikiData | null>,
): WikiRowDisplayState {
  if (!Object.prototype.hasOwnProperty.call(wikiByLatinName, latinName)) {
    return { kind: 'pending' };
  }
  const data = wikiByLatinName[latinName];
  if (data) return { kind: 'ready', data };
  return { kind: 'empty' };
}
