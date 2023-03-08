import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { MeasureUnits, TemperatureUnits } from './models/weather';
import { ELocales } from './models/locales';
import { StatusBar } from '@capacitor/status-bar';
import { STATUS_BAR_COLOR } from './models/colors';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // selectedKp: number;
  // currentKp: number;

  //private splashScreen: SplashScreen // TODO
  constructor(
    private _platform: Platform,
    private _router: Router,
    private _translateService: TranslateService,
    private _storageService: StorageService,
  ) {
    this._initializeApp();
  }

  private _initializeApp() {
    if (this._platform.is('hybrid')) {
      void StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
    }
    this._platform.ready().then(async () => {
      this._storageService.init().then(() => {
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
            this._translateService.setDefaultLang(this._translateService.getBrowserLang());
            void this._storageService.setData('locale', this._translateService.getBrowserLang());
          }
        }
      },
      noValue => {
        void this._storageService.setData('locale', this._translateService.getBrowserLang());
        console.warn('novalue of locale', noValue);
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
        console.warn('novalue of measure unit', noValue);
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
        void this._storageService.setData('measure', 'metric');
        console.warn('novalue of measure unit', noValue);
      },
    );
  }
}
