import type { MlTelemetryEventName } from '@/lib/classification/debug/types';

const SAMPLE_RATES: Partial<Record<MlTelemetryEventName, number>> = {
  capture_identify: 1,
  cloud_reclassify: 1,
  save_linked: 1,
  live_preview_sample: 0.08,
};

export function shouldSampleEvent(eventName: MlTelemetryEventName): boolean {
  const rate = SAMPLE_RATES[eventName] ?? 1;
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}
