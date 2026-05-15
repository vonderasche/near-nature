import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { authColors } from '@/constants/auth-theme';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CameraControlButton({
  icon,
  accessibilityLabel,
  onPress,
  active = false,
  disabled = false,
  style,
}: Props) {
  return (
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
        style,
      ]}>
      <MaterialIcons
        name={icon}
        size={26}
        color={disabled ? authColors.textMuted : authColors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
