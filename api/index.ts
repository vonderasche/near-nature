// src/api/index.ts
export { identifySpeciesInImage }  from './gemini';       // switched from claude.ts
export { lookupNativeStatus }      from './inaturalist';
export type { NativeLookupResult } from './inaturalist';
export { fetchSpeciesWikiData }    from './wikipedia';
export type { SpeciesWikiData }    from './wikipedia';
