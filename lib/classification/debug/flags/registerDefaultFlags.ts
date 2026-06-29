import { CONFIDENCE_THRESHOLD } from '@/lib/image/imageFilters';
import { defineFlag, registerFlagEvaluator } from '@/lib/classification/debug/flagEvaluatorRegistry';

registerFlagEvaluator(
  defineFlag('empty_result', (event) => event.outcome === 'empty'),
);

registerFlagEvaluator(
  defineFlag('identify_exception', (event) => event.outcome === 'error'),
);

registerFlagEvaluator(
  defineFlag('low_confidence', (event) => {
    const top = event.payload.top_predictions as { confidence?: number }[] | undefined;
    const confidence = top?.[0]?.confidence;
    return typeof confidence === 'number' && confidence > 0 && confidence < CONFIDENCE_THRESHOLD;
  }),
);

registerFlagEvaluator(
  defineFlag('routing_no_organism', (event) => {
    const routing = event.payload.routing_label;
    return routing === 'No Plant or Animal';
  }),
);

registerFlagEvaluator(
  defineFlag('specialist_unavailable', (event) => {
    const notice = event.payload.notice;
    return (
      typeof notice === 'string' &&
      (notice.includes('does not have a bundled on-device model') ||
        notice.includes('No specialist model is available'))
    );
  }),
);

registerFlagEvaluator(
  defineFlag('user_reclassified', (event) => event.event_name === 'cloud_reclassify' && event.outcome === 'success'),
);

registerFlagEvaluator(
  defineFlag('reclassify_mismatch', (event) => event.payload.reclassify_mismatch === true),
);

registerFlagEvaluator(
  defineFlag('gemini_filtered', (event) => {
    const summary = event.payload.filter_summary as { dropped?: number } | undefined;
    return typeof summary?.dropped === 'number' && summary.dropped > 0;
  }),
);

registerFlagEvaluator(
  defineFlag('kingdom_uncertain', (event) => {
    if (event.event_name !== 'live_preview_sample') return false;
    return event.payload.top_label === 'Uncertain';
  }),
);
