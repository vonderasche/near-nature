import { Platform } from 'react-native';

export function isTfliteIdentificationAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
