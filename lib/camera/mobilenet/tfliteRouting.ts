import bundleRoutingRoot from '@/assets/tflite/near_nature_app_bundle/inat2021_specialists_v2/routing.json';

import type { RegionPackId } from '@/constants/regions';

export type SpecialistAssetFolder =
  | 'birds'
  | 'trees'
  | 'woody_plants'
  | 'herbaceous_plants'
  | 'forbs_ferns'
  | 'dryland_plants'
  | 'herps'
  | 'insects_arachnids'
  | 'insects'
  | 'arachnids'
  | 'fish'
  | 'fungi'
  | 'mammals_domestic';

export type SpecialistInferenceMode = 'genus_direct' | 'species_rollup';

export type TfliteRoutingSpecialist = {
  id: string;
  title: string;
  description?: string;
  preview_groups: string[];
  inference_mode?: string;
  train_dataset?: string;
  bundle_tflite?: string;
  rollup_manifest?: string;
};

export type TfliteRoutingConfig = {
  preview_groups: string[];
  preview_to_specialist: Record<string, string | null>;
  specialists: TfliteRoutingSpecialist[];
};

const BUNDLED_ROUTING: TfliteRoutingConfig = bundleRoutingRoot as unknown as TfliteRoutingConfig;

const regionalRoutingCache: Partial<Record<RegionPackId, TfliteRoutingConfig>> = {};

/** @deprecated Use `getTfliteRouting(regionId)` — kept for tests and bundled fallback. */
export const TFLITE_ROUTING: TfliteRoutingConfig = BUNDLED_ROUTING;

export function getBundledTfliteRouting(): TfliteRoutingConfig {
  return BUNDLED_ROUTING;
}

export function setRegionalRoutingConfig(regionId: RegionPackId, config: TfliteRoutingConfig): void {
  regionalRoutingCache[regionId] = config;
}

export function clearRegionalRoutingCache(regionId?: RegionPackId): void {
  if (regionId) {
    delete regionalRoutingCache[regionId];
    return;
  }
  for (const key of Object.keys(regionalRoutingCache) as RegionPackId[]) {
    delete regionalRoutingCache[key];
  }
}

export function getTfliteRouting(regionId?: RegionPackId): TfliteRoutingConfig {
  if (regionId && regionalRoutingCache[regionId]) {
    return regionalRoutingCache[regionId]!;
  }
  return BUNDLED_ROUTING;
}

/** Routing specialist id → on-disk folder under `inat2021_specialists/`. */
const ROUTING_ID_TO_ASSET_FOLDER: Record<string, SpecialistAssetFolder> = {
  trees: 'trees',
  woody_plants: 'woody_plants',
  herbaceous_plants: 'herbaceous_plants',
  forbs_ferns: 'forbs_ferns',
  dryland_plants: 'dryland_plants',
  birds: 'birds',
  herps: 'herps',
  insects_arachnids: 'insects_arachnids',
  insects: 'insects',
  arachnids: 'arachnids',
  fish: 'fish',
  fungi: 'fungi',
  mammals_domestic: 'mammals_domestic',
};

export type PreviewRoutingResolution = {
  routingId: string | null;
  assetFolder: SpecialistAssetFolder | null;
  displayName: string | null;
  description: string | null;
  inferenceMode: SpecialistInferenceMode;
};

export function resolveAssetFolderForRoutingSpecialist(
  routingId: string,
): SpecialistAssetFolder | null {
  return ROUTING_ID_TO_ASSET_FOLDER[routingId] ?? null;
}

export function getRoutingSpecialist(
  routingId: string,
  regionId?: RegionPackId,
): TfliteRoutingSpecialist | undefined {
  const routing = getTfliteRouting(regionId);
  return routing.specialists.find((s) => s.id === routingId);
}

export function resolveSpecialistForPreviewLabel(
  previewLabel: string,
  regionId?: RegionPackId,
): PreviewRoutingResolution {
  const routing = getTfliteRouting(regionId);
  const routingId = routing.preview_to_specialist[previewLabel] ?? null;
  if (!routingId) {
    return {
      routingId: null,
      assetFolder: null,
      displayName: null,
      description: null,
      inferenceMode: 'genus_direct',
    };
  }

  const specialist = getRoutingSpecialist(routingId, regionId);
  const assetFolder = resolveAssetFolderForRoutingSpecialist(routingId);
  const inferenceMode: SpecialistInferenceMode =
    specialist?.inference_mode === 'species_rollup' ? 'species_rollup' : 'genus_direct';

  return {
    routingId,
    assetFolder,
    displayName: specialist?.title ?? routingId,
    description: specialist?.description ?? null,
    inferenceMode,
  };
}
