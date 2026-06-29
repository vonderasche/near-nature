import { isClassificationDebugThumbnailsEnabled } from '@/lib/classification/debug/isClassificationDebugEnabled';
import { uploadMlTelemetryThumbnail } from '@/lib/classification/debug/mlTelemetryStorage';
import type { MlTelemetryEventInsert, TelemetrySink } from '@/lib/classification/debug/types';

type ThumbnailContext = {
  sessionId: string;
  consumeCapturePhotoUri: () => string | null;
};

export function createThumbnailEnrichingSink(
  inner: TelemetrySink,
  ctx: ThumbnailContext,
): TelemetrySink {
  return {
    async send(events) {
      if (!isClassificationDebugThumbnailsEnabled()) {
        await inner.send(events);
        return;
      }

      const hasCapture = events.some(
        (event) => event.event_name === 'capture_identify' && !event.image_path,
      );
      if (!hasCapture) {
        await inner.send(events);
        return;
      }

      const localUri = ctx.consumeCapturePhotoUri();
      const imagePath =
        localUri != null
          ? await uploadMlTelemetryThumbnail(localUri, ctx.sessionId)
          : null;

      const enriched: MlTelemetryEventInsert[] =
        imagePath == null
          ? events
          : events.map((event) =>
              event.event_name === 'capture_identify' && !event.image_path
                ? { ...event, image_path: imagePath }
                : event,
            );

      await inner.send(enriched);
    },
  };
}
