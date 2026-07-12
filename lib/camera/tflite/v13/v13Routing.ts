/** v13 routing — mirrors python/v5/inference/router.py (used by v13 cascade). */

export {
  V5_KINGDOM_THRESHOLD as V13_KINGDOM_THRESHOLD,
  V5_ROUTER_THRESHOLD as V13_ROUTER_THRESHOLD,
  V5_SPECIALIST_THRESHOLD as V13_SPECIALIST_THRESHOLD,
  V5_NOT_IN_GUIDE as V13_NOT_IN_GUIDE,
  predictionsToProbabilityMap,
  routeKingdom,
  routePlant,
  routePlantTopOutput,
  routeAnimal,
  routeSpecialist,
} from '@/lib/camera/tflite/v5/v5Routing';
