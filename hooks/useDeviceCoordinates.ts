import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';

export type DeviceCoordinatesStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable';

export function useDeviceCoordinates(enabled: boolean): {
  coords: DeviceCoordinates | null;
  status: DeviceCoordinatesStatus;
} {
  const [coords, setCoords] = useState<DeviceCoordinates | null>(null);
  const [status, setStatus] = useState<DeviceCoordinatesStatus>('idle');

  useEffect(() => {
    if (!enabled) {
      setCoords(null);
      setStatus('idle');
      return;
    }

    let cancelled = false;

    void (async () => {
      setStatus('loading');

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (!cancelled) {
          setCoords(null);
          setStatus('unavailable');
        }
        return;
      }

      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        if (!cancelled) {
          setCoords(null);
          setStatus('denied');
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!cancelled) {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('ready');
      }
    })().catch(() => {
      if (!cancelled) {
        setCoords(null);
        setStatus('unavailable');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { coords, status };
}
