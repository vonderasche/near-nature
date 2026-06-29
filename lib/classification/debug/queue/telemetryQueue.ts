import type { MlTelemetryEventInsert, TelemetrySink } from '@/lib/classification/debug/types';

const DEFAULT_MAX_BATCH = 8;
const DEFAULT_FLUSH_MS = 2_000;

export class TelemetryQueue {
  private buffer: MlTelemetryEventInsert[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly sink: TelemetrySink,
    private readonly maxBatch = DEFAULT_MAX_BATCH,
    private readonly flushMs = DEFAULT_FLUSH_MS,
  ) {}

  enqueue(event: MlTelemetryEventInsert): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.maxBatch) {
      void this.flush();
      return;
    }
    this.scheduleFlush();
  }

  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    await this.sink.send(batch);
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, this.flushMs);
  }
}
