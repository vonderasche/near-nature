# Live camera preview models

Modular TFLite classifiers for Vision Camera live preview. Each subfolder is one swappable model.

## Layout

```
preview_models/
  shared/imagenet1k_labels.json     # ImageNet 1k labels (shared by Google pretrained models)
  scene_gate/tflite/                # Organism gate (copied from trained_v4)
  kingdom/tflite/                   # Kingdom head (copied from trained_v4)
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
4. Set `kind`: `plain` (show top labels), `scene_gate`, or `kingdom` (custom overlay mapping)
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
| `scene_gate` | Scene | scene_gate | Near Nature trained_v4 |
| `kingdom` | Kingdom | kingdom | Near Nature trained_v4 |
| `routing_preview_v1` | Route | plain | 20-class routing preview |
| `efficientnet_b0_imagenet` | EN-B0 | plain | ImageNet pretrained |
| `efficientnet_lite0_imagenet` | EN-L0 | plain | Google MediaPipe |
| `efficientnet_lite2_imagenet` | EN-L2 | plain | Google MediaPipe |
| `mobilenet_v2_imagenet` | MN-V2 | plain | Google MobileNet V2 (LiteRT mirror) |
