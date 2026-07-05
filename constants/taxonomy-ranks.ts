export type TaxonomyRankId =
  | 'domain'
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species';

export type TaxonomyRankDefinition = {
  id: TaxonomyRankId;
  /** Display name for the rank (singular). */
  rank: string;
  /** Plain-language explanation for naturalists. */
  description: string;
  /** Example value for the walkthrough species. */
  example: string;
};

/** Example used across the Discover taxonomy chart (Monarch butterfly). */
export const TAXONOMY_CHART_EXAMPLE = {
  commonName: 'Monarch butterfly',
  scientificName: 'Danaus plexippus',
} as const;

/**
 * Broad → narrow (domain is most inclusive; species is most specific).
 * Same ladder applies to plants — only the example values change.
 */
export const TAXONOMY_RANKS: readonly TaxonomyRankDefinition[] = [
  {
    id: 'domain',
    rank: 'Domain',
    description:
      'The broadest grouping of living things. Near Nature focuses on Eukarya — organisms whose cells have a nucleus.',
    example: 'Eukarya',
  },
  {
    id: 'kingdom',
    rank: 'Kingdom',
    description:
      'Major branch of life. Plants, animals, and fungi each belong to different kingdoms.',
    example: 'Animalia',
  },
  {
    id: 'phylum',
    rank: 'Phylum',
    description:
      'A large group within a kingdom that shares body plan and ancestry — for example, insects vs. vertebrates.',
    example: 'Arthropoda',
  },
  {
    id: 'class',
    rank: 'Class',
    description:
      'A subdivision of a phylum. Insects, birds, and mammals are each different classes.',
    example: 'Insecta',
  },
  {
    id: 'order',
    rank: 'Order',
    description:
      'Related families grouped together — butterflies and moths share the order Lepidoptera.',
    example: 'Lepidoptera',
  },
  {
    id: 'family',
    rank: 'Family',
    description:
      'Closely related genera. Family names often end in -idae (animals) or -aceae (plants).',
    example: 'Nymphalidae',
  },
  {
    id: 'genus',
    rank: 'Genus',
    description:
      'A group of closely related species. The genus is the first word of a scientific name.',
    example: 'Danaus',
  },
  {
    id: 'species',
    rank: 'Species',
    description:
      'The most specific rank — usually one kind of organism that can interbreed. Written as genus + species (binomial name).',
    example: 'Danaus plexippus',
  },
];

export function taxonomyRankSummary(): string {
  return TAXONOMY_RANKS.map((row) => row.rank).join(' → ');
}
