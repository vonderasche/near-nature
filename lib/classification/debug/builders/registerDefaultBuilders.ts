import type { ClassificationResult } from '@/types';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';
import { hasNoSpeciesFound } from '@/lib/image/imageFilters';
import type {
  CaptureIdentifyRawContext,
  CloudReclassifyRawContext,
  EventBuilder,
  EventBuilderResult,
  LivePreviewSampleRawContext,
  SaveLinkedRawContext,
  TelemetryBuildContext,
} from '@/lib/classification/debug/types';

function baseFields(
  ctx: TelemetryBuildContext,
  partial: Omit<EventBuilderResult, 'session_id' | 'region_id' | 'platform' | 'app_version' | 'domain'>,
): EventBuilderResult {
  return {
    session_id: ctx.sessionId,
    region_id: ctx.regionId,
    platform: ctx.platform,
    app_version: ctx.appVersion,
    domain: 'classification',
    ...partial,
  };
}

function predictionsFromClassifications(
  classifications: { latinName: string; confidence: number; commonName?: string }[],
) {
  return classifications.map((row, classIndex) => ({
    label: row.latinName,
    common_name: row.commonName ?? row.latinName,
    confidence: row.confidence,
    classIndex,
  }));
}

type PredictionTop = {
  latin_name: string | null;
  common_name: string | null;
  confidence: number | null;
};

function buildTflitePredictionSummary(
  meta: TfliteIdentificationMeta | null,
  priorClassifications: ClassificationResult[] | undefined,
) {
  const topFromUi = priorClassifications?.[0];
  const topFromGenus = meta?.genusTop[0];
  const top: PredictionTop | null = topFromUi
    ? {
        latin_name: topFromUi.latinName,
        common_name: topFromUi.commonName,
        confidence: topFromUi.confidence,
      }
    : topFromGenus
      ? {
          latin_name: topFromGenus.genus,
          common_name: topFromGenus.genus,
          confidence: topFromGenus.confidence,
        }
      : null;

  return {
    routing_label: meta?.routedPreviewLabel ?? null,
    specialist_id: meta?.specialistId ?? null,
    specialist_display_name: meta?.specialistDisplayName ?? null,
    preview_top: meta?.previewTop ?? [],
    genus_top: meta?.genusTop ?? [],
    top,
  };
}

function buildGeminiPredictionSummary(classifications: ClassificationResult[]) {
  const predictions = classifications.map((row) => ({
    latin_name: row.latinName,
    common_name: row.commonName,
    confidence: row.confidence,
    taxon_group: row.taxonGroup,
  }));

  return {
    top: predictions[0] ?? null,
    predictions,
  };
}

function buildGeminiFallbackComparison(
  meta: TfliteIdentificationMeta | null,
  priorClassifications: ClassificationResult[] | undefined,
  cloudClassifications: ClassificationResult[],
) {
  const tflite_prediction = buildTflitePredictionSummary(meta, priorClassifications);
  const gemini_prediction = buildGeminiPredictionSummary(cloudClassifications);
  const tfliteLatin = tflite_prediction.top?.latin_name?.toLowerCase() ?? null;
  const geminiLatin = gemini_prediction.top?.latin_name?.toLowerCase() ?? null;
  const hasBoth = tfliteLatin != null && tfliteLatin.length > 0 && geminiLatin != null && geminiLatin.length > 0;

  return {
    tflite_prediction,
    gemini_prediction,
    comparison: {
      tflite_top_latin: tfliteLatin,
      gemini_top_latin: geminiLatin,
      latin_match: hasBoth ? tfliteLatin === geminiLatin : null,
      reclassify_mismatch: hasBoth ? tfliteLatin !== geminiLatin : null,
    },
  };
}

export const captureIdentifyBuilder: EventBuilder = (ctx, raw) => {
  const data = raw as CaptureIdentifyRawContext;
  if (data.error) {
    return baseFields(ctx, {
      event_name: 'capture_identify',
      pipeline: data.pipeline,
      outcome: 'error',
      error_message: data.error,
      payload: { pipeline: data.pipeline },
      flagHints: ['identify_exception'],
    });
  }

  const empty = hasNoSpeciesFound(data.classifications);
  const tfliteMeta = data.tfliteMeta ?? null;
  const topPredictions = tfliteMeta
    ? tfliteMeta.genusTop.map((row) => ({
        label: row.genus,
        confidence: row.confidence,
        classIndex: row.classIndex,
      }))
    : predictionsFromClassifications(data.classifications);

  return baseFields(ctx, {
    event_name: 'capture_identify',
    pipeline: data.pipeline,
    outcome: empty ? 'empty' : 'success',
    payload: {
      pipeline: data.pipeline,
      routing_label: tfliteMeta?.routedPreviewLabel ?? null,
      specialist_id: tfliteMeta?.specialistId ?? null,
      specialist_display_name: tfliteMeta?.specialistDisplayName ?? null,
      notice: tfliteMeta?.notice ?? null,
      used_specialist: tfliteMeta?.usedSpecialist ?? false,
      preview_top: tfliteMeta?.previewTop ?? [],
      genus_top: tfliteMeta?.genusTop ?? [],
      top_predictions: topPredictions,
      classifications: data.classifications,
      filter_summary: data.filterSummary ?? null,
    },
    flagHints: empty ? ['empty_result'] : undefined,
  });
};

export const cloudReclassifyBuilder: EventBuilder = (ctx, raw) => {
  const data = raw as CloudReclassifyRawContext;
  const fallback = buildGeminiFallbackComparison(
    data.priorTfliteMeta,
    data.priorClassifications,
    data.cloudClassifications,
  );

  if (data.error) {
    return baseFields(ctx, {
      event_name: 'cloud_reclassify',
      pipeline: 'gemini',
      outcome: 'error',
      error_message: data.error,
      payload: {
        prior_tflite_meta: data.priorTfliteMeta,
        tflite_prediction: fallback.tflite_prediction,
        gemini_prediction: fallback.gemini_prediction,
        comparison: fallback.comparison,
      },
      flagHints: ['identify_exception', 'user_reclassified'],
    });
  }

  const empty = hasNoSpeciesFound(data.cloudClassifications);
  const mismatch = fallback.comparison.reclassify_mismatch === true;

  return baseFields(ctx, {
    event_name: 'cloud_reclassify',
    pipeline: 'gemini',
    outcome: empty ? 'empty' : 'success',
    payload: {
      prior_tflite_meta: data.priorTfliteMeta,
      routing_label: data.priorTfliteMeta?.routedPreviewLabel ?? null,
      specialist_id: data.priorTfliteMeta?.specialistId ?? null,
      reclassify_mismatch: mismatch,
      tflite_prediction: fallback.tflite_prediction,
      gemini_prediction: fallback.gemini_prediction,
      comparison: fallback.comparison,
      top_predictions: predictionsFromClassifications(data.cloudClassifications),
      classifications: data.cloudClassifications,
    },
    flagHints: empty
      ? ['empty_result', 'user_reclassified']
      : mismatch
        ? ['user_reclassified', 'reclassify_mismatch']
        : ['user_reclassified'],
  });
};

export const saveLinkedBuilder: EventBuilder = (ctx, raw) => {
  const data = raw as SaveLinkedRawContext;
  const feedback = data.userFeedback;
  return baseFields(ctx, {
    event_name: 'save_linked',
    pipeline: 'none',
    outcome: 'success',
    detection_id: data.detectionId,
    payload: {
      detection_id: data.detectionId,
      selected_index: data.selectedIndex,
      ...(feedback ? { user_feedback: feedback } : {}),
    },
    flagHints: feedback ? ['user_feedback', 'user_selected_alternate'] : undefined,
  });
};

export const livePreviewSampleBuilder: EventBuilder = (ctx, raw) => {
  const data = raw as LivePreviewSampleRawContext;
  const top = data.predictions[0];
  const topLabel = top?.label ?? null;
  const uncertain = topLabel === 'Uncertain';
  const noOrganism =
    topLabel === 'No Plant or Animal' ||
    topLabel === 'No organism' ||
    topLabel === 'Searching…';

  return baseFields(ctx, {
    event_name: 'live_preview_sample',
    pipeline: 'preview',
    outcome: uncertain || noOrganism || data.predictions.length === 0 ? 'empty' : 'success',
    payload: {
      model_id: data.modelId,
      top_label: topLabel,
      top_confidence: top?.confidence ?? null,
      predictions: data.predictions,
    },
    flagHints: uncertain
      ? ['kingdom_uncertain']
      : noOrganism
        ? ['routing_no_organism']
        : undefined,
  });
};
