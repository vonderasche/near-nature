import '@/lib/classification/debug/flags/registerDefaultFlags';

import { buildTelemetryContext } from '@/lib/classification/debug/buildContext';
import { evaluateFlags } from '@/lib/classification/debug/flagEvaluatorRegistry';
import { getEventBuilder } from '@/lib/classification/debug/eventBuilderRegistry';
import { isClassificationDebugEnabled } from '@/lib/classification/debug/isClassificationDebugEnabled';
import { TelemetryQueue } from '@/lib/classification/debug/queue/telemetryQueue';
import { createCompositeSink } from '@/lib/classification/debug/sinks/compositeSink';
import { createDevLogSink } from '@/lib/classification/debug/sinks/compositeSink';
import { noopSink } from '@/lib/classification/debug/sinks/noopSink';
import { createSupabaseTelemetrySink, linkMlTelemetrySession } from '@/lib/classification/debug/sinks/supabaseSink';
import { shouldSampleEvent } from '@/lib/classification/debug/sampling';
import type {
  MlTelemetryEventInsert,
  MlTelemetryEventName,
  MlTelemetryRawContext,
} from '@/lib/classification/debug/types';

let globalSession: ClassificationDebugSession | null = null;

export class ClassificationDebugSession {
  private readonly queue: TelemetryQueue;
  private disposed = false;

  constructor(
    private readonly sessionId: string,
    private readonly regionId: string | null,
    sink = createDefaultSink(),
  ) {
    this.queue = new TelemetryQueue(sink);
  }

  emit(
    eventName: MlTelemetryEventName,
    raw: MlTelemetryRawContext,
    opts?: { forceSample?: boolean },
  ): void {
    if (this.disposed || !isClassificationDebugEnabled()) return;
    if (!shouldSampleEvent(eventName, { force: opts?.forceSample })) return;

    const builder = getEventBuilder(eventName);
    if (!builder) return;

    const ctx = buildTelemetryContext(this.sessionId, this.regionId);
    const draft = builder(ctx, raw);
    if (!draft) return;

    const { flagHints, ...rest } = draft;
    const event: MlTelemetryEventInsert = {
      ...rest,
      flags: evaluateFlags({ ...rest, flags: [] }, flagHints ?? []),
    };

    this.queue.enqueue(event);
  }

  linkDetection(detectionId: string): void {
    if (this.disposed || !isClassificationDebugEnabled()) return;
    void linkMlTelemetrySession(this.sessionId, detectionId).catch(() => {
      /* best-effort */
    });
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    await this.queue.flush();
    if (globalSession === this) {
      globalSession = null;
    }
  }
}

function createDefaultSink() {
  if (!isClassificationDebugEnabled()) {
    return noopSink;
  }
  const sinks = [createSupabaseTelemetrySink()];
  if (__DEV__) {
    sinks.push(createDevLogSink());
  }
  return createCompositeSink(sinks);
}

export function createClassificationDebugSession(
  sessionId: string,
  regionId: string | null,
): ClassificationDebugSession {
  const session = new ClassificationDebugSession(sessionId, regionId);
  globalSession = session;
  return session;
}

export function getGlobalClassificationDebugSession(): ClassificationDebugSession | null {
  return globalSession;
}

export function clearGlobalClassificationDebugSession(session?: ClassificationDebugSession): void {
  if (session && globalSession !== session) return;
  globalSession = null;
}
