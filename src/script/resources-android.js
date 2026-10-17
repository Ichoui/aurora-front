const { copyFile } = require('node:fs/promises');
const path = require('node:path');

const SOURCE_ANDROID_ICON = 'resources/android/icon/';
const SOURCE_ANDROID_SPLASH = 'resources/android/splash/';

const TARGET_ANDROID_ICON = 'android/app/src/main/res/';
const TARGET_ANDROID_SPLASH = 'android/app/src/main/res/';

const ANDROID_ICONS = [
  { source: 'drawable-ldpi-icon.png', target: 'drawable-hdpi-icon.png' },
  { source: 'drawable-mdpi-icon.png', target: 'mipmap-mdpi/ic_launcher.png' },
  { source: 'drawable-mdpi-icon.png', target: 'mipmap-mdpi/ic_launcher_round.png' },
  { source: 'drawable-mdpi-icon.png', target: 'mipmap-mdpi/ic_launcher_foreground.png' },
  { source: 'drawable-hdpi-icon.png', target: 'mipmap-hdpi/ic_launcher.png' },
  { source: 'drawable-hdpi-icon.png', target: 'mipmap-hdpi/ic_launcher_round.png' },
  { source: 'drawable-hdpi-icon.png', target: 'mipmap-hdpi/ic_launcher_foreground.png' },
  { source: 'drawable-xhdpi-icon.png', target: 'mipmap-xhdpi/ic_launcher.png' },
  { source: 'drawable-xhdpi-icon.png', target: 'mipmap-xhdpi/ic_launcher_round.png' },
  { source: 'drawable-xhdpi-icon.png', target: 'mipmap-xhdpi/ic_launcher_foreground.png' },
  { source: 'drawable-xxhdpi-icon.png', target: 'mipmap-xxhdpi/ic_launcher.png' },
  { source: 'drawable-xxhdpi-icon.png', target: 'mipmap-xxhdpi/ic_launcher_round.png' },
  { source: 'drawable-xxhdpi-icon.png', target: 'mipmap-xxhdpi/ic_launcher_foreground.png' },
  { source: 'drawable-xxxhdpi-icon.png', target: 'mipmap-xxxhdpi/ic_launcher.png' },
  { source: 'drawable-xxxhdpi-icon.png', target: 'mipmap-xxxhdpi/ic_launcher_round.png' },
  { source: 'drawable-xxxhdpi-icon.png', target: 'mipmap-xxxhdpi/ic_launcher_foreground.png' },
];
const ANDROID_SPLASHES = [
  { source: 'drawable-land-mdpi-screen.png', target: 'drawable/splash.png' },
  { source: 'drawable-land-mdpi-screen.png', target: 'drawable-land-mdpi/splash.png' },
  { source: 'drawable-land-hdpi-screen.png', target: 'drawable-land-hdpi/splash.png' },
  { source: 'drawable-land-xhdpi-screen.png', target: 'drawable-land-xhdpi/splash.png' },
  { source: 'drawable-land-xxhdpi-screen.png', target: 'drawable-land-xxhdpi/splash.png' },
  { source: 'drawable-land-xxxhdpi-screen.png', target: 'drawable-land-xxxhdpi/splash.png' },
  { source: 'drawable-port-mdpi-screen.png', target: 'drawable-port-mdpi/splash.png' },
  { source: 'drawable-port-hdpi-screen.png', target: 'drawable-port-hdpi/splash.png' },
  { source: 'drawable-port-xhdpi-screen.png', target: 'drawable-port-xhdpi/splash.png' },
  { source: 'drawable-port-xxhdpi-screen.png', target: 'drawable-port-xxhdpi/splash.png' },
  { source: 'drawable-port-xxxhdpi-screen.png', target: 'drawable-port-xxxhdpi/splash.png' },
];

async function copyImages(sourcePath, targetPath, images) {
  await Promise.all(
    images.map(async icon => {
      const source = path.join(sourcePath, icon.source);
      const target = path.join(targetPath, icon.target);
      await copyFile(source, target);
      console.warn(`${source} >> ${target}`);
    }),
  );
}

Promise.all([
  copyImages(SOURCE_ANDROID_ICON, TARGET_ANDROID_ICON, ANDROID_ICONS),
  copyImages(SOURCE_ANDROID_SPLASH, TARGET_ANDROID_SPLASH, ANDROID_SPLASHES),
]).catch(error => {
  console.error('Android asset copy failed', error);
  process.exitCode = 1;
});
