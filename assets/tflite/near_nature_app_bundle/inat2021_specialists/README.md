# iNat 2021 specialist models (on-device)

Copy this folder into your app assets.

## Routing

Read `routing.json`:
- Preview model (20 classes) → `preview_to_specialist` → specialist folder
- **Bird** → `birds/` uses **species roll-up** (not direct genus TFLite)
- All other specialists → direct genus argmax on `<id>_genus.tflite`

## Birds (species → genus)

1. Run `birds/birds_species.tflite` → softmax over 1486 species
2. Sum species probabilities into 648 genus buckets using `birds/rollup.json` → `speciesToGenus[i]`
3. Argmax genus bucket → name from `birds/genus_labels.json`

Optional: show top species from `birds/species_labels.json` as detail under the genus.

## Other specialists

`trees/`, `herps/`, etc.: argmax `*_genus.tflite` → `labels.json` (genus names).

## Rebuild

```powershell
py DATASET/build_inat2021_app_bundle.py
```
