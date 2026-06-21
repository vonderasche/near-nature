import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  icon: HeroIconName;
  accessibilityLabel: string;
  onPress: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  accessibilityHint?: string;
  active?: boolean;
  disabled?: boolean;
  /** Short label under the icon (e.g. flash Off / Auto / On). */
  caption?: string;
  /** Anchor for a long-press expandable control group. */
  submenuOpen?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CameraControlButton({
  icon,
  accessibilityLabel,
  onPress,
  onLongPress,
  delayLongPress = 450,
  accessibilityHint,
  active = false,
  disabled = false,
  caption,
  submenuOpen = false,
  style,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignItems: 'center',
          gap: 2,
        },
        btn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.overlayScrim,
        },
        btnActive: {
          backgroundColor: theme.colors.cameraControlActive,
        },
        btnSubmenuOpen: {
          borderWidth: 1,
          borderColor: theme.colors.textPrimary,
        },
        btnDisabled: {
          opacity: 0.45,
        },
        btnPressed: {
          opacity: Platform.OS === 'ios' ? 0.85 : 1,
        },
        caption: {
          ...theme.typography.subtitle,
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.textPrimary,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        captionDisabled: {
          color: theme.colors.textSecondary,
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, selected: active || submenuOpen }}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={onLongPress ? delayLongPress : undefined}
        disabled={disabled}
        android_ripple={{ color: theme.colors.rippleOnDark, borderless: true }}
        style={({ pressed }) => [
          styles.btn,
          active && styles.btnActive,
          submenuOpen && styles.btnSubmenuOpen,
          disabled && styles.btnDisabled,
          pressed && !disabled && styles.btnPressed,
        ]}>
        <HeroIcon
          name={icon}
          size={26}
          color={disabled ? theme.colors.textSecondary : theme.colors.textPrimary}
        />
      </Pressable>
      {caption ? (
        <Text style={[styles.caption, disabled && styles.captionDisabled]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
