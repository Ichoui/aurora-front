import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.aurora.start', // override by trapeze-config.yaml, needed for creating folder android
  appName: 'Aurorapp', // Official application name on smartphone ; override by trapeze-config.yaml, needed for creating folder android
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 500,
      launchFadeOutDuration: 500,
      backgroundColor: '#001e49',
    },
  },
};

export default config;
