import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "app.pioniersplanner",
  appName: "Pioniersplanner",
  webDir: "out",
  backgroundColor: "#6A6A53",
  android: {
    allowMixedContent: true,
    backgroundColor: "#6A6A53",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#6A6A53",
    preferredContentMode: "mobile",
    scheme: "Pioniersplanner",
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: "#6A6A53",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#6A6A53",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
