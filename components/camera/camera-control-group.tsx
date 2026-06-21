import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

import type { CameraControlButton } from '@/components/camera/camera-control-button';
import { useTheme } from '@/hooks/useTheme';

type CameraControlButtonElement = ReactElement<
  React.ComponentProps<typeof CameraControlButton>
>;

type Props = {
  expanded: boolean;
  onToggleExpanded: () => void;
  onCollapse: () => void;
  anchor: CameraControlButtonElement;
  children: ReactNode;
};

function wrapChildPress(child: ReactNode, onCollapse: () => void): ReactNode {
  if (!isValidElement(child)) return child;
  const props = child.props as React.ComponentProps<typeof CameraControlButton>;
  const { onPress, disabled } = props;
  return cloneElement(child as CameraControlButtonElement, {
    onPress: () => {
      if (!disabled) {
        onPress();
        onCollapse();
      }
    },
  });
}

/**
 * Collapsed: single anchor. Tap anchor to expand a vertical stack below it.
 * Tapping a control in the stack runs its action and collapses the group.
 */
export function CameraControlGroup({
  expanded,
  onToggleExpanded,
  onCollapse,
  anchor,
  children,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        groupColumn: {
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 25,
          elevation: 25,
        },
        flyout: {
          marginTop: theme.spacing.xs,
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          borderRadius: 22,
          backgroundColor: theme.colors.overlayScrim,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
      }),
    [theme],
  );

  const anchorWithHandlers = cloneElement(anchor, {
    onPress: onToggleExpanded,
    onLongPress: onToggleExpanded,
    submenuOpen: expanded,
    accessibilityHint: expanded
      ? 'Tap to collapse this control group'
      : 'Tap to expand more controls in this group',
  });

  return (
    <View style={styles.groupColumn}>
      {anchorWithHandlers}
      {expanded ? (
        <View style={styles.flyout}>
          {Children.map(children, (child) => wrapChildPress(child, onCollapse))}
        </View>
      ) : null}
    </View>
  );
}
