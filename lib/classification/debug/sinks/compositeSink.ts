import { devLog } from '@/lib/devLog';
import type { MlTelemetryEventInsert, TelemetrySink } from '@/lib/classification/debug/types';

export function createDevLogSink(): TelemetrySink {
  return {
    async send(events) {
      if (!__DEV__) return;
      for (const event of events) {
        devLog('[ml_telemetry]', event.event_name, {
          outcome: event.outcome,
          flags: event.flags,
          pipeline: event.pipeline,
        });
      }
    },
  };
}

export function createCompositeSink(sinks: TelemetrySink[]): TelemetrySink {
  return {
    async send(events) {
      await Promise.all(
        sinks.map((sink) =>
          sink.send(events).catch((error) => {
            if (__DEV__) {
              devLog('[ml_telemetry] sink failed', error);
            }
          }),
        ),
      );
    },
  };
}
