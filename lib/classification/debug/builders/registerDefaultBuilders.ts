import type {
  CaptureIdentifyRawContext,
  CloudReclassifyRawContext,
  EventBuilder,
  EventBuilderResult,
  LivePreviewSampleRawContext,
  SaveLinkedRawContext,
  TelemetryBuildContext,
} from '@/lib/classification/debug/types';
import { hasNoSpeciesFound } from '@/lib/image/imageFilters';

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
  if (data.error) {
    return baseFields(ctx, {
      event_name: 'cloud_reclassify',
      pipeline: 'gemini',
      outcome: 'error',
      error_message: data.error,
      payload: {
        prior_tflite_meta: data.priorTfliteMeta,
      },
      flagHints: ['identify_exception'],
    });
  }

  const empty = hasNoSpeciesFound(data.cloudClassifications);
  const priorGenus = data.priorTfliteMeta?.genusTop[0]?.genus?.toLowerCase() ?? null;
  const cloudTop = data.cloudClassifications[0]?.latinName?.toLowerCase() ?? null;
  const mismatch =
    priorGenus != null && cloudTop != null && priorGenus.length > 0 && priorGenus !== cloudTop;

  return baseFields(ctx, {
    event_name: 'cloud_reclassify',
    pipeline: 'gemini',
    outcome: empty ? 'empty' : 'success',
    payload: {
      prior_tflite_meta: data.priorTfliteMeta,
      routing_label: data.priorTfliteMeta?.routedPreviewLabel ?? null,
      specialist_id: data.priorTfliteMeta?.specialistId ?? null,
      reclassify_mismatch: mismatch,
      top_predictions: predictionsFromClassifications(data.cloudClassifications),
      classifications: data.cloudClassifications,
    },
    flagHints: empty ? ['empty_result', 'user_reclassified'] : ['user_reclassified'],
  });
};

export const saveLinkedBuilder: EventBuilder = (ctx, raw) => {
  const data = raw as SaveLinkedRawContext;
  return baseFields(ctx, {
    event_name: 'save_linked',
    pipeline: 'none',
    outcome: 'success',
    detection_id: data.detectionId,
    payload: {
      detection_id: data.detectionId,
      selected_index: data.selectedIndex,
    },
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
