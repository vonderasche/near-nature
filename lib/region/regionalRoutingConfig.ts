import type { RegionPackId } from '@/constants/regions';
import { getInfoAsync, readAsStringAsync } from '@/lib/fs/legacyFileSystem';
import { getRegionModelFilePath } from '@/lib/region/regionModelPaths';
import { REGIONAL_ROUTING_RELATIVE_PATH } from '@/lib/region/resolveRegionalModelUri';
import type { TfliteRoutingConfig } from '@/lib/camera/mobilenet/tfliteRouting';
import {
  getBundledTfliteRouting,
  setRegionalRoutingConfig,
} from '@/lib/camera/mobilenet/tfliteRouting';

export async function loadRegionalRoutingConfig(regionId: RegionPackId): Promise<TfliteRoutingConfig> {
  const routingPath = getRegionModelFilePath(regionId, REGIONAL_ROUTING_RELATIVE_PATH);
  const info = await getInfoAsync(routingPath);
  if (info.exists) {
    const text = await readAsStringAsync(routingPath);
    const config = JSON.parse(text) as TfliteRoutingConfig;
    setRegionalRoutingConfig(regionId, config);
    return config;
  }

  return getBundledTfliteRouting();
}

export { clearRegionalRoutingCache } from '@/lib/camera/mobilenet/tfliteRouting';
