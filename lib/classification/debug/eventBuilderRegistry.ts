import {
  captureIdentifyBuilder,
  cloudReclassifyBuilder,
  livePreviewSampleBuilder,
  saveLinkedBuilder,
} from '@/lib/classification/debug/builders/registerDefaultBuilders';
import type { EventBuilder, MlTelemetryEventName } from '@/lib/classification/debug/types';

const builders = new Map<MlTelemetryEventName, EventBuilder>();

export function registerEventBuilder(eventName: MlTelemetryEventName, builder: EventBuilder): void {
  builders.set(eventName, builder);
}

export function getEventBuilder(eventName: MlTelemetryEventName): EventBuilder | undefined {
  return builders.get(eventName);
}

export function registerDefaultEventBuilders(): void {
  registerEventBuilder('capture_identify', captureIdentifyBuilder);
  registerEventBuilder('cloud_reclassify', cloudReclassifyBuilder);
  registerEventBuilder('save_linked', saveLinkedBuilder);
  registerEventBuilder('live_preview_sample', livePreviewSampleBuilder);
}

registerDefaultEventBuilders();
