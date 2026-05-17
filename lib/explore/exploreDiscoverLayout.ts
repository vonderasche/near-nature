export const EXPLORE_DISCOVER_LAYOUT_OPTIONS = ['list', 'grid'] as const;

export type ExploreDiscoverLayoutMode = (typeof EXPLORE_DISCOVER_LAYOUT_OPTIONS)[number];

export const DEFAULT_EXPLORE_DISCOVER_LAYOUT: ExploreDiscoverLayoutMode = 'list';

export const EXPLORE_DISCOVER_LAYOUT_STORAGE_KEY = '@near_nature/explore_discover_layout';

export function parseExploreDiscoverLayoutMode(raw: string | null | undefined): ExploreDiscoverLayoutMode {
  return raw === 'grid' ? 'grid' : DEFAULT_EXPLORE_DISCOVER_LAYOUT;
}

export function exploreDiscoverLayoutLabel(mode: ExploreDiscoverLayoutMode): string {
  return mode === 'grid' ? 'Image grid' : 'List';
}
