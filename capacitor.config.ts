import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "app.pioniersplanner",
  appName: "Pioniersplanner",
  webDir: "out",
  backgroundColor: "#29483F",
  android: {
    allowMixedContent: true,
    backgroundColor: "#29483F",
  },
  ios: {
    contentInset: "never",
    backgroundColor: "#29483F",
    preferredContentMode: "mobile",
    scheme: "Pioniersplanner",
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: "#29483F",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#29483F",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
