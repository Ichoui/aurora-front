import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// import { routes } from './app.routes';
import { HttpsInterceptorService } from './https-interceptor.service';
import { register } from 'swiper/element/bundle';
import { provideLottieOptions } from 'ngx-lottie';
import { routes } from './tabs/tabs.router.module';
register();

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),
    Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpsInterceptorService,
      multi: true,
    },
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    importProvidersFrom(
      IonicModule.forRoot(),
      IonicStorageModule.forRoot({
        name: '__dbAurora',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage, CordovaSQLiteDriver._driver],
      }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
