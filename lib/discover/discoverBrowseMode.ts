export const DISCOVER_BROWSE_OPTIONS = ['parks', 'plants', 'animals'] as const;

export type DiscoverBrowseMode = (typeof DISCOVER_BROWSE_OPTIONS)[number];

export const DEFAULT_DISCOVER_BROWSE: DiscoverBrowseMode = 'parks';

export const DISCOVER_BROWSE_STORAGE_KEY = '@near_nature/discover_browse_mode';

export function parseDiscoverBrowseMode(raw: string | null | undefined): DiscoverBrowseMode {
  if (raw === 'plants' || raw === 'animals') return raw;
  return DEFAULT_DISCOVER_BROWSE;
}

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
