export function discoverGuestSubtitle(stateName: string): string {
  return `Previewing ${stateName} sample data. Sign in and set your home state for your area.`;
}

export function discoverHubSubtitle(stateName: string): string {
  return `Featured species, regions, and parks in ${stateName}.`;
}

export function discoverGuestBannerText(stateName: string): string {
  return `Browsing ${stateName} sample data. Sign in to save detections and set your home state.`;
}

export function discoverNeedsHomeStateSubtitle(): string {
  return 'Set your home state on Profile to explore species and parks in your area.';
}

export function discoverNeedsHomeStateMessage(): string {
  return 'Set your home state on Profile to explore native species and parks in your area.';
}
