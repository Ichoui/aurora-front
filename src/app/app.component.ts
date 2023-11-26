import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { MeasureUnits, TemperatureUnits } from './models/weather';
import { ELocales } from './models/locales';
import { StatusBar } from '@capacitor/status-bar';
import { STATUS_BAR_COLOR } from './models/colors';
import { Geolocation } from '@capacitor/geolocation';
import { ToastError } from './shared/toast/toast.component';
import { CodeLocation } from './models/cities';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // selectedKp: number;
  // currentKp: number;
  dataToast: ToastError;

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _translateService: TranslateService,
    private _storageService: StorageService,
    private _translate: TranslateService,
  ) {
    this._initializeApp();
  }

  private _initializeApp() {
    if (this._platform.is('hybrid')) {
      void StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
    }
    this._platform.ready().then(async () => {
      this._storageService
        .init()
        .then(() => {
          // Vérifier si une location a déjà été set par le passé sur l'appli, sinon on fait les demandes de géoloc car probable première viste
          this._storageService.getData('location').then((codeLocation: CodeLocation) => {
            if (!codeLocation) {
              this._checkPermissions();
            }
          });
        })
        .then(() => {
          this._getLocale();
          this._getMeasureUnit();
          this._getTempUnit();
        });
      this._translateService.addLangs(['fr', 'en']);
      await this._router.navigate(['/tabs/tab2']);

      // this.getKp();
      // this.isNotifsActive();
    });
  }

  /**
   * Check la permission de geoposition autorisée par l'utilisateur sur Android
   * Puis détermine la localisation en fonction de la réponse
   * Par défault : Tromso
   */
  private async _checkPermissions(): Promise<void> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('permission status: ', permissionStatus);

      if (permissionStatus?.location !== 'granted') {
        // Si permission n'a jamais été donnée par le passé
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          // Si l'utilisateur la refuse
          console.warn('permission request not granted ', request.location);
          // par default, on paramètre tout sur tromso
          await this._setStorageLocation(69.650288, 18.955098); // par défault, on met tromso
          return null;
        } else {
          console.warn('permission request is granted');
          await this._getPosition();
        }
      } else {
        console.warn('permission is granted in ELSE', permissionStatus.location);
        await this._getPosition();
      }
    } catch (e) {
      console.error('_checkPermission() catch, message :  ', e);
      await this._setStorageLocation(69.650288, 18.955098); // par défault, on met tromso
    }
  }

  private async _getPosition(): Promise<void> {
    await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
      .then(resp => this._setStorageLocation(resp.coords.latitude, resp.coords.longitude))
      .catch(error => {
        console.warn('getPosition() : Geolocation error, message :', error.message);

        // this._cdr.markForCheck();
        // this._eventRefresh?.target?.complete();
        this.dataToast = {
          message: this._translate.instant('global.error.geoloc'),
          status: error.status,
        };
      });
  }

  private async _setStorageLocation(lat: number, long: number): Promise<void> {
    void this._storageService.setData('location', {
      code: 'currentLocation',
      lat,
      long,
    });
  }

  // private _isNotifsActive(): void {
  // this.storageService.get('notifications_active').then(notifs => {
  //     if (notifs) {
  //         // console.log(this.selectedKp);
  //         // console.log(this.currentKp);
  //         if (this.selectedKp === this.currentKp && this.selectedKp !== undefined) {
  //             // console.log('Cool');
  //         } else {
  //             // console.log('PAS Cool');
  //         }
  //     }
  // });
  // }

  // private _getKp(): void {
  // this.storage.get('kp_notif').then(kp => (this.selectedKp = kp));
  // this.storage.get('current_kp').then(kp => (this.currentKp = kp));
  // }

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
        console.warn('_getTempUnit() : problem with tempeartyre : ', noValue);
      },
    );
  }
}
