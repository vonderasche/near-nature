import { LayoutAnimation, Platform, UIManager } from 'react-native';

let configured = false;

function ensureConfigured() {
  if (configured || Platform.OS !== 'android') {
    configured = true;
    return;
  }
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  configured = true;
}

/** Subtle expand/collapse for profile/discover collapsible panels. */
export function animateCollapsibleToggle() {
  ensureConfigured();
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}
