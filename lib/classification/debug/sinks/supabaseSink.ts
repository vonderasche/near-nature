import { formatSupabaseError } from '@/lib/errors/errorMessage';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { MlTelemetryEventInsert, TelemetrySink } from '@/lib/classification/debug/types';

export async function insertMlTelemetryEvents(events: MlTelemetryEventInsert[]): Promise<number> {
  if (events.length === 0) return 0;

  const { data, error } = await supabase.rpc('insert_ml_telemetry_events', {
    p_events: events,
  });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  return typeof data === 'number' ? data : events.length;
}

export async function linkMlTelemetrySession(
  sessionId: string,
  detectionId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('link_ml_telemetry_session', {
    p_session_id: sessionId,
    p_detection_id: detectionId,
  });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  return typeof data === 'number' ? data : 0;
}

export function createSupabaseTelemetrySink(): TelemetrySink {
  return {
    async send(events) {
      try {
        await insertMlTelemetryEvents(events);
      } catch (error) {
        devLog('[ml_telemetry] insert failed', error);
      }
    },
  };
}
