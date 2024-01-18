import { ChangeDetectorRef, Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { HourClock, MeasureUnits, TemperatureUnits } from './models/weather';
import { ELocales } from './models/locales';
import { StatusBar } from '@capacitor/status-bar';
import { STATUS_BAR_COLOR } from './models/colors';
import { ToastError } from './shared/toast/toast.component';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { CityCoords } from './models/cities';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { AuroraService } from './aurora.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <ion-app class="md">
      <div *ngIf="!loadApp" class="content-spinner">
        <div class="whirly-loader"></div>
      </div>
      <ion-router-outlet *ngIf="loadApp"></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  dataToast: ToastError;
  loadApp: boolean = false;
  private _deviceUuid = null;

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _translateService: TranslateService,
    private _storageService: StorageService,
    private _translate: TranslateService,
    private _cdr: ChangeDetectorRef,
    private _geoloc: Geolocation,
    private _auroraService: AuroraService,
  ) {
    this._initializeApp();
  }

  private _initializeApp(): void {
    if (this._platform.is('hybrid')) {
      void StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
      this._registerPushNotifs();
    }
    this._translateService.addLangs(['fr', 'en']);
    this._router.navigate(['/tabs/tab2']);
    this._platform.ready().then(async () => {
      this._storageService
        .init()
        .then(() => {
          // Vérifier si une location a déjà été set par le passé sur l'appli, sinon on fait les demandes de géoloc car probable première visite
          this._storageService.getData('location').then((coords: CityCoords) => {
            if (!coords) {
              this._getPosition();
            } else {
              this.loadApp = true;
              this._cdr.markForCheck();
            }
          });
        })
        .then(() => {
          this._getLocale();
          this._getMeasureUnit();
          this._getTempUnit();
          this._getHourClockSystem();
        });
    });
  }

  private _registerPushNotifs(): void {
    //Android will just grant without prompting ; iOS will prompt user and return if they granted permission or not ;
    Promise.all([PushNotifications.requestPermissions(), Device.getId()]).then(([push, device]) => {
      console.log('DEVICE', device.identifier);
      this._deviceUuid = device.identifier;
      if (push.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
        // } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.warn(token.value);
      console.warn(this._deviceUuid);
      this._auroraService.registerDevice(this._deviceUuid, token.value).pipe(first()).subscribe();
    });

    // PushNotifications.addListener('registrationError', (error: any) => {
    //   console.error('Not registered')
    // });
    //
    // PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    //   alert('Push received: ' + JSON.stringify(notification));
    // });
    //
    // PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
    //   alert('Push action performed: ' + JSON.stringify(notification));
    // });
  }

  /**
   * Détermine la localisation de l'utilisateur
   * Par défault : Tromso
   */
  private async _getPosition(): Promise<void> {
    this._geoloc
      .getCurrentPosition()
      .then(resp => this._setStorageLocation(resp.coords.latitude, resp.coords.longitude))
      .catch(error => {
        console.warn('getPosition() : Geolocation error, message :', error.message);
        this._setStorageLocation(69.650288, 18.955098); // par défault, on met tromso
        this.dataToast = {
          message: this._translate.instant('global.error.geoloc'),
          status: error.status,
        };
      });
  }

  private _setStorageLocation(lat: number, long: number): void {
    this._storageService.setData('location', {
      lat,
      long,
    });
    this.loadApp = true;
    this._cdr.markForCheck();
  }

  private _getLocale(): void {
    this._storageService.getData('locale').then(
      (locale: ELocales) => {
        if (locale) {
          this._translateService.setDefaultLang(locale);
          void this._storageService.setData('locale', locale);
        } else {
          if (this._translateService.getBrowserLang() === ELocales.FR) {
            this._translateService.setDefaultLang(ELocales.FR);
            void this._storageService.setData('locale', ELocales.FR);
          } else {
            this._translateService.setDefaultLang(ELocales.EN);
            void this._storageService.setData('locale', ELocales.EN);
          }
        }
        if (this._platform.is('hybrid')) {
          this._auroraService
            .registerLocale(this._deviceUuid, locale === ELocales.FR ? ELocales.FR : ELocales.EN)
            .pipe(first())
            .subscribe();
        }
      },
      noValue => {
        void this._storageService.setData('locale', ELocales.EN);
        console.warn('_getLocale() : problem with locale : ', noValue);
      },
    );
  }

  private _getMeasureUnit(): void {
    this._storageService.getData('measure').then(
      (measure: MeasureUnits) => {
        if (measure) {
          void this._storageService.setData('measure', measure);
        } else {
          if (this._translateService.getBrowserLang() === ELocales.FR) {
            void this._storageService.setData('measure', 'metric');
          } else {
            void this._storageService.setData('measure', 'imperial');
          }
        }
      },
      noValue => {
        void this._storageService.setData('measure', 'metric');
        console.warn('_getMeasureUnit() : problem with measure unit : ', noValue);
      },
    );
  }

  private _getTempUnit(): void {
    this._storageService.getData('temperature').then(
      (measure: TemperatureUnits) => {
        if (measure) {
          void this._storageService.setData('temperature', measure);
        } else {
          if (this._translateService.getBrowserLang() === ELocales.FR) {
            void this._storageService.setData('temperature', 'celsius');
          } else {
            void this._storageService.setData('temperature', 'fahrenheit');
          }
        }
      },
      noValue => {
        void this._storageService.setData('temperature', 'celsius');
        console.warn('_getTempUnit() : problem with temperature : ', noValue);
      },
    );
  }

  private _getHourClockSystem(): void {
    this._storageService.getData('clock').then(
      (format: HourClock) => {
        if (format) {
          void this._storageService.setData('clock', format);
        } else {
          void this._storageService.setData('clock', 'twentyfour');
        }
      },
      noValue => {
        void this._storageService.setData('clock', 'twentyfour');
        console.warn('_getHourClockSystem() : problem with hour clock system : ', noValue);
      },
    );
  }
}
