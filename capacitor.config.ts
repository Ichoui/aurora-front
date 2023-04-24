import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.aurora.start', // override by trapeze-config.yaml, needed for creating folder android
  appName: 'Northern Lights', // Official application name on smartphone ; override by trapeze-config.yaml, needed for creating folder android
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchFadeOutDuration: 500,
    },
  },
};

export default config;
