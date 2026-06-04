/** @type {import('@react-native-community/cli-types').Config} */
// Set FRIENDS_APK_DISABLE_RESIZE_PLUGIN=1 in build-friends-apk.ps1 when live preview is off
// (avoids Windows MAX_PATH failures in resize-plugin codegen).
const disableResizePlugin = process.env.FRIENDS_APK_DISABLE_RESIZE_PLUGIN === '1';

module.exports = {
  dependencies: disableResizePlugin
    ? {
        'vision-camera-resize-plugin': {
          platforms: {
            android: null,
            ios: null,
          },
        },
      }
    : {},
};
