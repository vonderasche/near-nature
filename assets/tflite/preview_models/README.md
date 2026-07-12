# Live camera preview models

Modular TFLite classifiers for Vision Camera live preview. Each subfolder is one swappable model.

## Layout

```
preview_models/
  shared/imagenet1k_labels.json     # ImageNet 1k labels (shared by Google pretrained models)
  scene_gate/tflite/                # Organism gate (copied from trained_v4)
  kingdom/tflite/                   # Kingdom head (copied from trained_v4)
  kingdom_global/tflite/            # Global kingdom head
  n1/tflite/                        # 13-class neighborhood plant classifier
  v14/tflite/                       # 114-class family classifier + negative class
  routing_preview_v1/tflite/        # 20-class routing preview (Bird, Tree, …)
  efficientnet_b0_imagenet/tflite/  # EfficientNet B0 ImageNet
  efficientnet_lite0_imagenet/      # Google MediaPipe EfficientNet-Lite0
  efficientnet_lite2_imagenet/      # Google MediaPipe EfficientNet-Lite2
  mobilenet_v2_imagenet/            # Optional — run fetch script or add manually
```

## Fetch standard Google weights

```powershell
npm run fetch:preview-models
```

Downloads EfficientNet-Lite0/Lite2 from Google MediaPipe hosting into this folder.

## Add a new preview model

1. Create `assets/tflite/preview_models/<id>/tflite/<model>.tflite` + `labels.json`
2. Add `<id>` to `PreviewModelId` in `lib/camera/tflite/preview/previewModelIds.ts`
3. Append one entry to `PREVIEW_MODEL_DEFINITIONS` in `lib/camera/tflite/preview/previewModelRegistry.ts`
4. Set `kind`: `plain` (show top labels), `kingdom_global`, or `kingdom` (custom overlay mapping)
5. Reload the app — the camera AI toggle cycles through all registered models

## Code entry points

| File | Role |
|------|------|
| `lib/camera/tflite/preview/previewModelRegistry.ts` | Model list + `ClassificationModelConfig` |
| `lib/camera/tflite/preview/mapPreviewPredictions.ts` | Overlay label mapping per `kind` |
| `hooks/useLivePreviewFrameProcessor.ts` | Vision Camera frame processor wiring |

## Registered models (default)

| Id | Toggle | Kind | Source |
|----|--------|------|--------|
| `kingdom_global` | Kingdom | kingdom_global | Near Nature v12/v6 global kingdom |
| `n1` | N1 | plain | Near Nature n1 |
| `v14` | V14 | plain | Near Nature v14 family classifier |
| `kingdom` | Kingdom (legacy) | kingdom | Near Nature trained_v4 |
