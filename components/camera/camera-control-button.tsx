import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { authColors, authTypography } from '@/constants/auth-theme';

type Props = {
  icon: HeroIconName;
  accessibilityLabel: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  /** Short label under the icon (e.g. flash Off / Auto / On). */
  caption?: string;
  style?: StyleProp<ViewStyle>;
};

export function CameraControlButton({
  icon,
  accessibilityLabel,
  onPress,
  active = false,
  disabled = false,
  caption,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled, selected: active }}
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
        style={({ pressed }) => [
          styles.btn,
          active && styles.btnActive,
          disabled && styles.btnDisabled,
          pressed && !disabled && styles.btnPressed,
        ]}>
        <HeroIcon
          name={icon}
          size={26}
          color={disabled ? authColors.textMuted : authColors.text}
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  btnActive: {
    backgroundColor: 'rgba(10,126,164,0.55)',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPressed: {
    opacity: Platform.OS === 'ios' ? 0.85 : 1,
  },
  caption: {
    ...authTypography.subtitle,
    fontSize: 10,
    fontWeight: '600',
    color: authColors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  captionDisabled: {
    color: authColors.textMuted,
  },
});
