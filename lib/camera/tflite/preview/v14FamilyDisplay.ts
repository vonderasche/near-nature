import genusProfiles from '@/assets/tflite/near_nature_app_bundle/genus_info/genus_profiles.enriched.min.json';
import type { GenusProfilesJson } from '@/types/speciesRecord';

let familyCommonByFamily: Map<string, string> | null = null;

function getFamilyCommonMap(): Map<string, string> {
  if (!familyCommonByFamily) {
    familyCommonByFamily = new Map();
    for (const entry of Object.values(genusProfiles as GenusProfilesJson)) {
      const family = entry.familia?.trim();
      const common = entry.commonName?.trim();
      if (!family || !common) continue;
      if (common.toLowerCase() === family.toLowerCase()) continue;
      if (!familyCommonByFamily.has(family)) {
        familyCommonByFamily.set(family, common);
      }
    }
  }
  return familyCommonByFamily;
}

export function lookupFamilyCommonName(familyLabel: string): string | null {
  const trimmed = familyLabel.trim();
  if (!trimmed || trimmed === 'negative') return null;
  return getFamilyCommonMap().get(trimmed) ?? null;
}

export function formatV14FamilyLabel(familyLabel: string): string {
  const trimmed = familyLabel.trim();
  if (trimmed === 'negative') return 'Not a target';
  const common = lookupFamilyCommonName(trimmed);
  return common ? `${trimmed} · ${common}` : trimmed;
}
