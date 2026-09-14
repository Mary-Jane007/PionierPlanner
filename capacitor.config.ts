import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.pioniersplanner",
  appName: "Pioniersplanner",
  webDir: "out",
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      launchAutoHide: true,
      backgroundColor: "#29483F",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
