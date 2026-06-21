import {
  V3_ANIMAL_ROUTER_LABELS,
  V3_ANIMAL_ROUTER_TOP1_THRESHOLD,
  V3_KINGDOM_LABELS,
  V3_KINGDOM_TOP1_THRESHOLD,
  V3_ORGANISM_LABEL,
  V3_PLANT_ROUTER_LABELS,
  V3_PLANT_ROUTER_TOP1_THRESHOLD,
  V3_SCENE_GATE_LABELS,
  V3_SCENE_GATE_ORGANISM_THRESHOLD,
  V3_SPECIALIST_DISPLAY_NAMES,
  V3_SPECIALIST_LABELS,
  type V3SpecialistGroup,
  isV3AnimalSpecialistAvailable,
  isV3PlantSpecialistAvailable,
} from '@/lib/camera/tflite/v3/v3CascadeConfig';
import {
  loadV3AnimalRouterModel,
  loadV3KingdomModel,
  loadV3PlantRouterModel,
  loadV3SceneGateModel,
  loadV3SpecialistModel,
} from '@/lib/camera/tflite/v3/v3CachedModels';
import {
  predictionConfidence,
  runV3ClassificationBuffer,
  topPrediction,
  type V3StepPrediction,
} from '@/lib/camera/tflite/v3/v3Inference';
import { buildV3Input224Square, buildV3Input240B1Crop } from '@/lib/camera/tflite/v3/v3Preprocess';
import {
  formatV3RouteLabel,
  genusToV3Classification,
  v3AnimalGroupToSubcategory,
  v3PlantGroupToSubcategory,
  v3SpecialistGroupToSubcategory,
} from '@/lib/camera/tflite/v3/v3Taxonomy';
import { devLog } from '@/lib/devLog';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function toPreviewPredictions(rows: V3StepPrediction[]): PreviewPrediction[] {
  return rows.map((row) => ({
    classIndex: row.classIndex,
    confidence: row.confidence,
    label: row.label,
  }));
}

function toGenusPredictions(rows: V3StepPrediction[]): GenusPrediction[] {
  return rows.map((row) => ({
    classIndex: row.classIndex,
    confidence: row.confidence,
    genus: row.label,
  }));
}

function logCaptureCascadeTotal(cascadeStart: number, outcome: string): void {
  devLog(`[v3] capture cascade total ${(performance.now() - cascadeStart).toFixed(1)}ms`, outcome);
}

function finishEmpty(
  cascadeStart: number,
  outcome: string,
  meta: TfliteIdentificationMeta,
): TfliteIdentificationResult {
  logCaptureCascadeTotal(cascadeStart, outcome);
  return { classifications: [], meta };
}

async function buildV3Input240B1CropLogged(photoUri: string): Promise<ArrayBuffer> {
  const preprocessStart = performance.now();
  const input240 = await buildV3Input240B1Crop(photoUri);
  devLog(`[v3] preprocess 240_b1_crop ${(performance.now() - preprocessStart).toFixed(1)}ms`);
  return input240;
}

/**
 * Near Nature v3 capture cascade:
 * scene_gate (224) → kingdom (224) → plant_router / animal_router (240) → specialist.
 */
export async function identifyPhotoWithV3Cascade(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const cascadeStart = performance.now();

  const preprocess224Start = performance.now();
  const input224 = await buildV3Input224Square(photoUri);
  devLog(`[v3] preprocess 224_square ${(performance.now() - preprocess224Start).toFixed(1)}ms`);

  const sceneGateModel = await loadV3SceneGateModel();
  const sceneGatePredictions = runV3ClassificationBuffer(
    sceneGateModel,
    input224,
    V3_SCENE_GATE_LABELS,
    2,
    'scene_gate',
  );
  const organismConfidence = predictionConfidence(sceneGatePredictions, V3_ORGANISM_LABEL);
  const previewTop = toPreviewPredictions(sceneGatePredictions);

  if (organismConfidence < V3_SCENE_GATE_ORGANISM_THRESHOLD) {
    return finishEmpty(cascadeStart, 'scene_gate rejected', {
      previewTop,
      routedPreviewLabel: V3_ORGANISM_LABEL,
      specialistId: null,
      specialistDisplayName: null,
      genusTop: [],
      usedSpecialist: false,
      notice: 'No plant or animal detected in this image.',
    });
  }

  const kingdomModel = await loadV3KingdomModel();
  const kingdomPredictions = runV3ClassificationBuffer(
    kingdomModel,
    input224,
    V3_KINGDOM_LABELS,
    4,
    'kingdom',
  );
  const kingdomTop = topPrediction(kingdomPredictions);

  if (!kingdomTop || kingdomTop.confidence < V3_KINGDOM_TOP1_THRESHOLD) {
    return finishEmpty(cascadeStart, 'kingdom below threshold', {
      previewTop: [...previewTop, ...toPreviewPredictions(kingdomPredictions)],
      routedPreviewLabel: kingdomTop?.label ?? 'uncertain',
      specialistId: null,
      specialistDisplayName: null,
      genusTop: [],
      usedSpecialist: false,
      notice: 'Could not confidently determine kingdom for this photo.',
    });
  }

  const kingdom = kingdomTop.label;

  if (kingdom === 'animalia') {
    const input240 = await buildV3Input240B1CropLogged(photoUri);
    const animalRouterModel = await loadV3AnimalRouterModel();
    const animalRouterPredictions = runV3ClassificationBuffer(
      animalRouterModel,
      input240,
      V3_ANIMAL_ROUTER_LABELS,
      7,
      'animal_router',
    );
    const animalGroupTop = topPrediction(animalRouterPredictions);

    if (!animalGroupTop || animalGroupTop.confidence < V3_ANIMAL_ROUTER_TOP1_THRESHOLD) {
      return finishEmpty(cascadeStart, 'animal_router below threshold', {
        previewTop: [...previewTop, kingdomTop, ...toPreviewPredictions(animalRouterPredictions)],
        routedPreviewLabel: formatV3RouteLabel(kingdom, animalGroupTop?.label),
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'Could not confidently route this animal photo.',
      });
    }

    const animalGroup = animalGroupTop.label;

    if (animalGroup === 'not_animal') {
      return finishEmpty(cascadeStart, 'animal_router not_animal', {
        previewTop: [...previewTop, kingdomTop, animalGroupTop],
        routedPreviewLabel: formatV3RouteLabel(kingdom, animalGroup),
        specialistId: animalGroup,
        specialistDisplayName: 'Not animal',
        genusTop: [],
        usedSpecialist: false,
        notice: 'Animal router classified this image as not an animal.',
      });
    }

    if (!isV3AnimalSpecialistAvailable(animalGroup)) {
      return finishEmpty(cascadeStart, `no specialist for ${animalGroup}`, {
        previewTop: [...previewTop, kingdomTop, animalGroupTop],
        routedPreviewLabel: formatV3RouteLabel(kingdom, animalGroup),
        specialistId: animalGroup,
        specialistDisplayName: animalGroup,
        genusTop: [],
        usedSpecialist: false,
        notice: `No on-device specialist is available for "${animalGroup}".`,
      });
    }

    return runV3SpecialistCapture({
      cascadeStart,
      previewTop: [...previewTop, kingdomTop, animalGroupTop],
      routedPreviewLabel: formatV3RouteLabel(kingdom, animalGroup),
      specialistGroup: animalGroup,
      taxonGroup: 'animals',
      subcategory: v3AnimalGroupToSubcategory(animalGroup),
      input240,
    });
  }

  if (kingdom === 'uncertain') {
    return finishEmpty(cascadeStart, 'kingdom uncertain', {
      previewTop: [...previewTop, kingdomTop],
      routedPreviewLabel: kingdom,
      specialistId: null,
      specialistDisplayName: null,
      genusTop: [],
      usedSpecialist: false,
      notice: 'Kingdom uncertain for this photo.',
    });
  }

  if (kingdom === 'fungi') {
    const input240 = await buildV3Input240B1CropLogged(photoUri);
    return runV3SpecialistCapture({
      cascadeStart,
      previewTop: [...previewTop, kingdomTop],
      routedPreviewLabel: kingdom,
      specialistGroup: 'fungi',
      taxonGroup: 'fungi',
      subcategory: v3SpecialistGroupToSubcategory('fungi'),
      input240,
    });
  }

  if (kingdom !== 'plantae') {
    return finishEmpty(cascadeStart, `unsupported kingdom ${kingdom}`, {
      previewTop: [...previewTop, kingdomTop],
      routedPreviewLabel: kingdom,
      specialistId: null,
      specialistDisplayName: null,
      genusTop: [],
      usedSpecialist: false,
      notice: `No capture path for kingdom "${kingdom}".`,
    });
  }

  const input240 = await buildV3Input240B1CropLogged(photoUri);
  const plantRouterModel = await loadV3PlantRouterModel();
  const plantRouterPredictions = runV3ClassificationBuffer(
    plantRouterModel,
    input240,
    V3_PLANT_ROUTER_LABELS,
    5,
    'plant_router',
  );
  const plantGroupTop = topPrediction(plantRouterPredictions);

  if (!plantGroupTop || plantGroupTop.confidence < V3_PLANT_ROUTER_TOP1_THRESHOLD) {
    const routerHint = plantGroupTop
      ? `Best guess: ${plantGroupTop.label.replace(/_/g, ' ')} (${Math.round(plantGroupTop.confidence * 100)}%, need ${Math.round(V3_PLANT_ROUTER_TOP1_THRESHOLD * 100)}%).`
      : 'No plant group prediction returned.';
    return finishEmpty(cascadeStart, 'plant_router below threshold', {
      previewTop: [...previewTop, kingdomTop, ...toPreviewPredictions(plantRouterPredictions)],
      routedPreviewLabel: formatV3RouteLabel(kingdom, plantGroupTop?.label),
      specialistId: null,
      specialistDisplayName: null,
      genusTop: [],
      usedSpecialist: false,
      notice: `Could not confidently route this plant photo. ${routerHint}`,
    });
  }

  const plantGroup = plantGroupTop.label;

  if (plantGroup === 'not_plant') {
    return finishEmpty(cascadeStart, 'plant_router not_plant', {
      previewTop: [...previewTop, kingdomTop, plantGroupTop],
      routedPreviewLabel: formatV3RouteLabel(kingdom, plantGroup),
      specialistId: plantGroup,
      specialistDisplayName: 'Not plant',
      genusTop: [],
      usedSpecialist: false,
      notice: 'Plant router classified this image as not a plant.',
    });
  }

  if (!isV3PlantSpecialistAvailable(plantGroup)) {
    return finishEmpty(cascadeStart, `no specialist for ${plantGroup}`, {
      previewTop: [...previewTop, kingdomTop, plantGroupTop],
      routedPreviewLabel: formatV3RouteLabel(kingdom, plantGroup),
      specialistId: plantGroup,
      specialistDisplayName: plantGroup,
      genusTop: [],
      usedSpecialist: false,
      notice: `No on-device specialist is available for "${plantGroup}".`,
    });
  }

  return runV3SpecialistCapture({
    cascadeStart,
    previewTop: [...previewTop, kingdomTop, plantGroupTop],
    routedPreviewLabel: formatV3RouteLabel(kingdom, plantGroup),
    specialistGroup: plantGroup,
    taxonGroup: 'plants',
    subcategory: v3PlantGroupToSubcategory(plantGroup),
    input240,
  });
}

async function runV3SpecialistCapture(options: {
  cascadeStart: number;
  previewTop: PreviewPrediction[];
  routedPreviewLabel: string;
  specialistGroup: V3SpecialistGroup;
  taxonGroup: ClassificationResult['taxonGroup'];
  subcategory?: ClassificationResult['subcategory'];
  input240: ArrayBuffer;
}): Promise<TfliteIdentificationResult> {
  const {
    cascadeStart,
    previewTop,
    routedPreviewLabel,
    specialistGroup,
    taxonGroup,
    subcategory,
    input240,
  } = options;
  const specialistModel = await loadV3SpecialistModel(specialistGroup);
  const labels = V3_SPECIALIST_LABELS[specialistGroup];
  const specialistPredictions = runV3ClassificationBuffer(
    specialistModel,
    input240,
    labels,
    3,
    `specialist_${specialistGroup}`,
  );
  const genusTop = toGenusPredictions(specialistPredictions);

  const classifications = genusTop.map((row) =>
    genusToV3Classification(row.genus, row.confidence, taxonGroup, subcategory),
  );

  logCaptureCascadeTotal(cascadeStart, `specialist ${specialistGroup}`);

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel,
      specialistId: specialistGroup,
      specialistDisplayName: V3_SPECIALIST_DISPLAY_NAMES[specialistGroup],
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
