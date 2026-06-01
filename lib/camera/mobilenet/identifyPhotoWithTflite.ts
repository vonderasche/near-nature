import routingModelAsset from '@/assets/tflite/near_nature_app_bundle/routing_capture/mobilevit_routing/tflite/routing_classifier.tflite';

import { getLabelAtIndex } from '@/lib/camera/mobilenet/parseModelLabels';
import { preprocessImageForMobileNet } from '@/lib/camera/mobilenet/preprocessImageForMobileNet';
import { previewLabelToTaxonGroup } from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import { ROUTING_MODEL_INPUT_SIZE, SPECIALIST_MODEL_INPUT_SIZE } from '@/lib/camera/mobilenet/modelConfig';
import { parseMobileNetTop3 } from '@/lib/camera/mobilenet/parseMobileNetOutput';
import { resolveSpecialistForPreviewLabel } from '@/lib/camera/mobilenet/tfliteRouting';
import { getSpecialistDefinition } from '@/lib/camera/mobilenet/specialistModelRegistry';
import {
  getCachedTfliteModel,
  runTfliteTop3,
  runTfliteTop3Transient,
} from '@/lib/camera/mobilenet/tfliteModelRunner';
import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function previewLabelAtIndex(classIndex: number): string {
  return TFLITE_ROUTING.preview_groups[classIndex] ?? `Class ${classIndex}`;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function toPreviewPredictions(
  scores: { classIndex: number; confidence: number }[],
): PreviewPrediction[] {
  return scores.map((score) => ({
    classIndex: score.classIndex,
    confidence: score.confidence,
    label: previewLabelAtIndex(score.classIndex),
  }));
}

function toGenusPredictions(
  scores: { classIndex: number; confidence: number }[],
  labelLookup: readonly string[],
): GenusPrediction[] {
  return scores.map((score) => ({
    classIndex: score.classIndex,
    confidence: score.confidence,
    genus: getLabelAtIndex(labelLookup, score.classIndex),
  }));
}

function genusToClassification(
  genus: string,
  confidence: number,
  previewLabel: string,
): ClassificationResult {
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup: previewLabelToTaxonGroup(previewLabel),
  };
}

async function runSpecialistGenusTop3(
  input224: Float32Array,
  specialist: NonNullable<ReturnType<typeof getSpecialistDefinition>>,
): Promise<{ classIndex: number; confidence: number }[]> {
  return runTfliteTop3Transient(specialist.model, input224);
}

/**
 * On-device identification for camera capture and gallery picks:
 * 1) MobileViT routing model (top-3 preview groups)
 * 2) route top preview group via routing.json
 * 3) run the matching specialist model for genus predictions (top-3)
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const routingInput = await preprocessImageForMobileNet(photoUri, ROUTING_MODEL_INPUT_SIZE);
  const specialistInput = await preprocessImageForMobileNet(photoUri, SPECIALIST_MODEL_INPUT_SIZE);

  const routingModel = await getCachedTfliteModel(routingModelAsset);
  const outputs = await routingModel.run([routingInput.buffer as ArrayBuffer]);
  const raw = outputs[0];
  if (raw == null) {
    throw new Error('The routing model returned no output.');
  }

  const logits = new Float32Array(raw);
  const probs = new Float32Array(logits.length);
  for (let i = 0; i < logits.length; i += 1) {
    probs[i] = sigmoid(logits[i] ?? 0);
  }

  const previewTop = toPreviewPredictions(parseMobileNetTop3(probs.buffer));

  const topPreview = previewTop[0];
  if (!topPreview) {
    return {
      classifications: [],
      meta: {
        previewTop: [],
        routedPreviewLabel: '',
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'Could not classify this photo.',
      },
    };
  }

  if (topPreview.label === 'No Plant or Animal') {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: topPreview.label,
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'No plant or animal detected in this image.',
      },
    };
  }

  const routing = resolveSpecialistForPreviewLabel(topPreview.label);

  if (!routing.assetFolder) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: topPreview.label,
        specialistId: routing.routingId,
        specialistDisplayName: routing.displayName,
        genusTop: [],
        usedSpecialist: false,
        notice: routing.routingId
          ? `${routing.displayName ?? 'This category'} does not have a bundled on-device model.`
          : 'No specialist model is available for this category.',
      },
    };
  }

  const specialist = getSpecialistDefinition(routing.assetFolder);
  if (!specialist) {
    throw new Error(`Missing specialist model configuration for ${routing.assetFolder}.`);
  }

  const genusScores = await runSpecialistGenusTop3(specialistInput, specialist);
  const genusTop = toGenusPredictions(genusScores, specialist.labelLookup);

  const classifications = genusTop.map((row) =>
    genusToClassification(row.genus, row.confidence, topPreview.label),
  );

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel: topPreview.label,
      specialistId: routing.routingId,
      specialistDisplayName: routing.displayName,
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
