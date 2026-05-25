import AsyncStorage from '@react-native-async-storage/async-storage';

import { FIRST_LOGIN_WELCOME_KEY_PREFIX } from '@/constants/welcome-modal';

export function firstLoginWelcomeKey(userId: string): string {
  return `${FIRST_LOGIN_WELCOME_KEY_PREFIX}${userId}`;
}

export async function hasSeenFirstLoginWelcome(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(firstLoginWelcomeKey(userId))) === '1';
}

export async function markFirstLoginWelcomeSeen(userId: string): Promise<void> {
  await AsyncStorage.setItem(firstLoginWelcomeKey(userId), '1');
}
