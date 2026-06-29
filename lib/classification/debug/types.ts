import type { ClassificationResult } from '@/types';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';
import type { FilterSummary } from '@/lib/image/imageFilters';

export type MlTelemetryDomain = 'classification';

export type MlTelemetryEventName =
  | 'capture_identify'
  | 'cloud_reclassify'
  | 'save_linked'
  | 'live_preview_sample';

export type MlTelemetryPipeline = 'tflite' | 'gemini' | 'preview' | 'none';

export type MlTelemetryOutcome = 'success' | 'empty' | 'error';

export type MlTelemetryEventInsert = {
  session_id: string;
  domain: MlTelemetryDomain;
  event_name: MlTelemetryEventName;
  pipeline: MlTelemetryPipeline;
  outcome: MlTelemetryOutcome;
  region_id: string | null;
  platform: string;
  app_version: string;
  detection_id?: string | null;
  flags: string[];
  payload: Record<string, unknown>;
  image_path?: string | null;
  error_message?: string | null;
};

export type TelemetrySink = {
  send(events: MlTelemetryEventInsert[]): Promise<void>;
};

export type TelemetryBuildContext = {
  sessionId: string;
  regionId: string | null;
  platform: string;
  appVersion: string;
};

export type CaptureIdentifyRawContext = {
  pipeline: MlTelemetryPipeline;
  classifications: ClassificationResult[];
  tfliteMeta?: TfliteIdentificationMeta | null;
  filterSummary?: FilterSummary;
  error?: string | null;
};

export type CloudReclassifyRawContext = {
  priorTfliteMeta: TfliteIdentificationMeta | null;
  cloudClassifications: ClassificationResult[];
  error?: string | null;
};

export type SaveLinkedRawContext = {
  detectionId: string;
  selectedIndex: number;
};

export type LivePreviewSampleRawContext = {
  modelId: string;
  predictions: { label: string; confidence: number; classIndex: number }[];
};

export type MlTelemetryRawContext =
  | CaptureIdentifyRawContext
  | CloudReclassifyRawContext
  | SaveLinkedRawContext
  | LivePreviewSampleRawContext;

export type EventBuilderResult = Omit<MlTelemetryEventInsert, 'flags'> & {
  flagHints?: string[];
};

export type EventBuilder = (
  ctx: TelemetryBuildContext,
  raw: MlTelemetryRawContext,
) => EventBuilderResult | null;

export type FlagEvaluator = ((event: MlTelemetryEventInsert) => boolean) & {
  flagName?: string;
};
