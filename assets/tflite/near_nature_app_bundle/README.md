# Near Nature — app model bundle (iNat 2021)

Built: 2026-05-29

Copy this entire folder into your app assets.

## Layout

```
near_nature_app_bundle/
  routing.json              <- start here (preview -> specialist map)
  manifest.json
  preview/
    preview_classifier.tflite
    labels.json
    model_info.json
  inat2021_specialists/
    routing.json
    trees/ woody_plants/ ... birds/ ...
  genus_info/
    genus_profiles.enriched.min.json   (partial; grows as enrichment runs)
```

## Inference

1. **Preview** — `preview/preview_classifier.tflite` (20 classes)
2. **Route** — `routing.json` → `previewToSpecialist["Bird"]` → `"birds"`
3. **Specialist** — load `inat2021_specialists/birds/` or other folder
   - Most: `<id>_genus.tflite` + `labels.json`
   - **Birds only**: `birds_species.tflite` + `rollup.json` → genus via probability sum
4. **Display** — optional `genus_info/` lookup by genus scientific name

## Rebuild

```powershell
py DATASET/build_inat2021_app_bundle.py
py DATASET/build_app_upload_bundle.py
```
