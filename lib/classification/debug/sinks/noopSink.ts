import type { MlTelemetryEventInsert, TelemetrySink } from '@/lib/classification/debug/types';

export const noopSink: TelemetrySink = {
  async send() {
    /* telemetry disabled */
  },
};
