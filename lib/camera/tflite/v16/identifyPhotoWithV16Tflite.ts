import type { CaptureMode } from '@/constants/identification-preferences';
import type { RegionPackId } from '@/constants/regions';
import { formatV14FamilyLabel } from '@/lib/camera/tflite/preview/v14FamilyDisplay';
import { isOnDevicePreviewEnabled } from '@/lib/camera/tflite/isOnDevicePreviewEnabled';
import { prepareMvpCaptureMemory } from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { runV16Capture } from '@/lib/camera/tflite/v16/v16CachedModels';
import { v16FamilyToTaxonGroup } from '@/lib/camera/tflite/v16/v16FamilyTaxonomy';
import { V16_FAMILY_CONFIDENCE_THRESHOLD } from '@/lib/camera/tflite/v16/v16ModelRegistry';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function toPreviewPredictions(
  predictions: readonly { label: string; confidence: number }[],
): PreviewPrediction[] {
  return predictions.map((row, index) => ({
    label: row.label,
    confidence: row.confidence,
    classIndex: index,
  }));
}

function familyToClassification(label: string, confidence: number): ClassificationResult {
  const display = formatV14FamilyLabel(label);
  return {
    latinName: label,
    commonName: display,
    confidence,
    taxonGroup: v16FamilyToTaxonGroup(label),
  };
}

export type IdentifyPhotoWithV16Options = {
  captureMode?: CaptureMode;
  regionId?: RegionPackId;
};

/**
 * v16 single-model capture: one EfficientNet-B2 family classifier (107 classes).
 */
export async function identifyPhotoWithV16Tflite(
  photoUri: string,
  _options?: IdentifyPhotoWithV16Options,
): Promise<TfliteIdentificationResult> {
  if (isOnDevicePreviewEnabled()) {
    await prepareMvpCaptureMemory();
  }

  const { predictions: raw } = await runV16Capture(photoUri);
  const sorted = [...raw].sort((a, b) => b.confidence - a.confidence);
  const previewTop = toPreviewPredictions(sorted);
  const top = sorted[0];

  if (!top || top.confidence < V16_FAMILY_CONFIDENCE_THRESHOLD) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: top?.label ?? '',
        specialistId: 'v16',
        specialistDisplayName: 'V16 family classifier',
        genusTop: [],
        usedSpecialist: false,
        notice: 'Family confidence was too low for this photo.',
      },
    };
  }

  const genusTop: GenusPrediction[] = sorted.slice(0, 3).map((row, index) => ({
    genus: row.label,
    confidence: row.confidence,
    classIndex: index,
  }));

  const classifications = genusTop.map((row) => familyToClassification(row.genus, row.confidence));

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel: top.label,
      specialistId: 'v16',
      specialistDisplayName: 'V16 family classifier',
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
