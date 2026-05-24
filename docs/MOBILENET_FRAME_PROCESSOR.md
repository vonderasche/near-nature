# MobileNet frame processor (testing)

Runs **MobileNet v2 224 (quantized)** on live camera frames via Vision Camera + `react-native-fast-tflite`.

## Enable

1. Download assets (if missing):

   ```powershell
   .\scripts\download-mobilenet-tflite.ps1
   ```

2. In `.env`:

   ```env
   EXPO_PUBLIC_MOBILENET_FRAME_PROCESSOR=true
   ```

3. **Rebuild the native app** — required after enabling frame processors. An older dev client will crash or show “Frame Processors are disabled” until you rebuild (not available in Expo Go):

   ```powershell
   npx expo prebuild
   npm run android
   ```

4. Restart Metro with a clean cache:

   ```powershell
   npx expo start --clear
   ```

## UI

On the camera tab you should see a **MobileNet test** overlay with the top ImageNet label, confidence, inference time, and class index (~2 inferences/sec).

## Notes

- ImageNet classes are generic (e.g. “tabby cat”), not regional species — this branch is for **pipeline testing** only.
- Turn the flag off for normal builds; identification still uses Claude/Gemini on the capture path.
- Requires a physical device or emulator with a working camera; some emulators are slow.
