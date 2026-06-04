# Local model setup (not committed)

This repo intentionally does **not** commit large model binaries.  
To run the latest local classifier stack, copy model folders from your local source checkout.

## Source (example)

`E:/PROGRAMMING/Portfolio/Vision Camera/models`

## Destination (this repo)

`assets/tflite/near_nature_app_bundle/`

Create/copy these folders:

- `preview_live/efficientnet_b0/tflite/`
  - `efficientnet_b0_imagenet1k.tflite`
  - `labels.json`
  - `model_info.json`
- `routing_capture/mobilevit_routing/tflite/`
  - `routing_classifier.tflite`
  - `labels.json`
  - `model_info.json`
- `inat2021_specialists_v2/`
  - `routing.json`
  - specialist subfolders under `*/tflite/` with:
    - `<id>_genus.tflite`
    - `labels.json`

## Important

- Do **not** copy training/export artifacts (`*.pt`, `*.onnx`, `tflite_out/`, logs) into git.
- The project `.gitignore` already excludes those artifact patterns.

## Quick verification

1. Run the app (`npm run android`).
2. Open Camera and enable live classifier.
3. Take a few detections across different categories.
4. Confirm logs show:
   - preview model load once and reused
   - routing label + specialist id
   - successful genus top-3 output
