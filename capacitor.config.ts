import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.aurora.start',
  appName: 'Aurorapp',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      launchFadeOutDuration: 500,
      backgroundColor: '#001e49',
    },
  },
};

export default config;
