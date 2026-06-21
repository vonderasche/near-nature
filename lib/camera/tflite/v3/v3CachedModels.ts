import type { TfliteModel } from 'react-native-fast-tflite';



import { getCachedTfliteModel } from '@/lib/camera/tflite/cachedModels';

import {

  V3_MODEL_ASSETS,

  type V3SpecialistGroup,

} from '@/lib/camera/tflite/v3/v3CascadeConfig';



let sceneGatePromise: Promise<TfliteModel> | null = null;

let kingdomPromise: Promise<TfliteModel> | null = null;

let plantRouterPromise: Promise<TfliteModel> | null = null;

let animalRouterPromise: Promise<TfliteModel> | null = null;

const specialistPromises: Partial<Record<V3SpecialistGroup, Promise<TfliteModel>>> = {};



export function loadV3SceneGateModel(): Promise<TfliteModel> {

  if (!sceneGatePromise) {

    sceneGatePromise = getCachedTfliteModel(V3_MODEL_ASSETS.sceneGate);

  }

  return sceneGatePromise;

}



export function loadV3KingdomModel(): Promise<TfliteModel> {

  if (!kingdomPromise) {

    kingdomPromise = getCachedTfliteModel(V3_MODEL_ASSETS.kingdom);

  }

  return kingdomPromise;

}



export function loadV3PlantRouterModel(): Promise<TfliteModel> {

  if (!plantRouterPromise) {

    plantRouterPromise = getCachedTfliteModel(V3_MODEL_ASSETS.plantRouter);

  }

  return plantRouterPromise;

}



export function loadV3AnimalRouterModel(): Promise<TfliteModel> {

  if (!animalRouterPromise) {

    animalRouterPromise = getCachedTfliteModel(V3_MODEL_ASSETS.animalRouter);

  }

  return animalRouterPromise;

}



export function loadV3SpecialistModel(group: V3SpecialistGroup): Promise<TfliteModel> {

  if (!specialistPromises[group]) {

    specialistPromises[group] = getCachedTfliteModel(V3_MODEL_ASSETS.specialists[group]);

  }

  return specialistPromises[group]!;

}


