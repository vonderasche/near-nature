import bundleRoutingRoot from '@/assets/tflite/near_nature_app_bundle/routing.json';

export type SpecialistAssetFolder =
  | 'birds'
  | 'trees'
  | 'woody_plants'
  | 'herbaceous_plants'
  | 'herps'
  | 'insects_arachnids'
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

type BundleSpecialistRow = {
  id: string;
  title: string;
  description?: string;
  preview_groups: string[];
  inference_mode?: string;
  mode?: string;
  train_dataset?: string;
  bundle_tflite?: string;
  tfliteFile?: string;
  rollup_manifest?: string;
  rollupFile?: string;
};

type NearNatureAppBundleRoutingRoot = {
  previewClasses: string[];
  previewToSpecialist: Record<string, string | null>;
  specialistRouting: {
    preview_to_specialist?: Record<string, string | null>;
    specialists: BundleSpecialistRow[];
  };
};

function normalizeBundleRouting(root: NearNatureAppBundleRoutingRoot): TfliteRoutingConfig {
  const specialistRouting = root.specialistRouting;
  return {
    preview_groups: root.previewClasses,
    preview_to_specialist:
      root.previewToSpecialist ?? specialistRouting.preview_to_specialist ?? {},
    specialists: specialistRouting.specialists.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      preview_groups: row.preview_groups,
      inference_mode:
        row.inference_mode ?? (row.mode === 'species_rollup' ? 'species_rollup' : undefined),
      train_dataset: row.train_dataset,
      bundle_tflite: row.bundle_tflite ?? row.tfliteFile,
      rollup_manifest: row.rollup_manifest ?? row.rollupFile,
    })),
  };
}

export const TFLITE_ROUTING: TfliteRoutingConfig = normalizeBundleRouting(
  bundleRoutingRoot as NearNatureAppBundleRoutingRoot,
);

const SPECIALIST_BY_ID = new Map(TFLITE_ROUTING.specialists.map((s) => [s.id, s]));

/** Routing specialist id → on-disk folder under `inat2021_specialists/`. */
const ROUTING_ID_TO_ASSET_FOLDER: Record<string, SpecialistAssetFolder> = {
  trees: 'trees',
  woody_plants: 'woody_plants',
  herbaceous_plants: 'herbaceous_plants',
  birds: 'birds',
  herps: 'herps',
  insects_arachnids: 'insects_arachnids',
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

export function getRoutingSpecialist(routingId: string): TfliteRoutingSpecialist | undefined {
  return SPECIALIST_BY_ID.get(routingId);
}

export function resolveSpecialistForPreviewLabel(previewLabel: string): PreviewRoutingResolution {
  const routingId = TFLITE_ROUTING.preview_to_specialist[previewLabel] ?? null;
  if (!routingId) {
    return {
      routingId: null,
      assetFolder: null,
      displayName: null,
      description: null,
      inferenceMode: 'genus_direct',
    };
  }

  const specialist = getRoutingSpecialist(routingId);
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
