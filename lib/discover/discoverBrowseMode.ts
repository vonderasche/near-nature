export const DISCOVER_BROWSE_OPTIONS = ['parks', 'plants', 'animals'] as const;

export type DiscoverBrowseMode = (typeof DISCOVER_BROWSE_OPTIONS)[number];

export const DEFAULT_DISCOVER_BROWSE: DiscoverBrowseMode = 'parks';

export function discoverBrowseLabel(mode: DiscoverBrowseMode): string {
  switch (mode) {
    case 'parks':
      return 'Parks';
    case 'plants':
      return 'Plants';
    case 'animals':
      return 'Animals';
  }
}
