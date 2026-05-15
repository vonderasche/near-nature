import * as Location from 'expo-location';

import { usStateCodeFromRegion } from '@/constants/us-states';

export type DetectUsStateResult =
  | { ok: true; stateCode: string }
  | { ok: false; reason: 'permission'; message: string }
  | { ok: false; reason: 'unavailable'; message: string };

/**
 * Requests foreground location, reverse-geocodes, and returns a US state code when possible.
 */
export async function detectUsStateFromLocation(): Promise<DetectUsStateResult> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return {
      ok: false,
      reason: 'unavailable',
      message: 'Location services are turned off on this device.',
    };
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    return {
      ok: false,
      reason: 'permission',
      message: 'Location permission is needed to detect your state.',
    };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const places = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const place = places[0];
  const region = place?.region ?? place?.subregion ?? null;
  const stateCode = usStateCodeFromRegion(region);

  if (!stateCode) {
    return {
      ok: false,
      reason: 'unavailable',
      message: region
        ? `Could not map "${region}" to a US state. Please pick from the list.`
        : 'Could not determine your state. Please pick from the list.',
    };
  }

  return { ok: true, stateCode };
}
