import Constants from 'expo-constants';

/** User-visible semver from app.json (`expo.version`). */
export function getAppVersionName(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/** Play Store integer version from app.json (`expo.android.versionCode`). */
export function getAndroidVersionCode(): number {
  const raw = Constants.expoConfig?.android?.versionCode;
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 1;
}

export function formatAppVersionLabel(): string {
  return `v${getAppVersionName()} (${getAndroidVersionCode()})`;
}
