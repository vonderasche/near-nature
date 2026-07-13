import defaultRoutingJson from '@/assets/region/default-routing.json';

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

const BUNDLED_ROUTING: TfliteRoutingConfig = defaultRoutingJson as unknown as TfliteRoutingConfig;

const regionalRoutingCache: Partial<Record<RegionPackId, TfliteRoutingConfig>> = {};

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
