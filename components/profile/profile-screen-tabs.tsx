import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export type ProfileScreenTab = 'gallery' | 'scoring';

type TabDef = {
  id: ProfileScreenTab;
  label: string;
  icon: HeroIconName;
};

const TABS: TabDef[] = [
  { id: 'gallery', label: 'Gallery', icon: 'rectangle-stack' },
  { id: 'scoring', label: 'Scoring & badges', icon: 'chart-bar' },
];

type Props = {
  value: ProfileScreenTab;
  onChange: (tab: ProfileScreenTab) => void;
  borderColor: string;
  mutedColor: string;
};

export function ProfileScreenTabs({ value, onChange, borderColor, mutedColor }: Props) {
  return (
    <View style={[styles.row, { borderColor }]}>
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, active && styles.tabActive]}>
            <HeroIcon
              name={tab.icon}
              size={18}
              color={active ? authColors.text : mutedColor}
            />
            <Text style={[styles.label, { color: active ? authColors.text : mutedColor }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: authSpacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.xs,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    ...authTypography.subtitle,
    fontWeight: '600',
  },
});
