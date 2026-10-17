import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { addIcons } from 'ionicons';
import { arrowUp, at, caretDownOutline, caretForwardOutline, informationCircle, locationOutline, logoGithub, pin, telescope } from 'ionicons/icons';
import { provideLottieOptions } from 'ngx-lottie';
import { register } from 'swiper/element/bundle';
import { httpsInterceptor } from './https-interceptor.service';
import { routes } from './tabs/tabs.routes';

register();
addIcons({ arrowUp, at, caretDownOutline, caretForwardOutline, informationCircle, locationOutline, logoGithub, pin, telescope });

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({ useSetInputAPI: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([httpsInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
    }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__dbAurora',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage, CordovaSQLiteDriver._driver],
      }),
    ),
  ],
};
