import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Unit } from './models/weather';
import { ELocales } from './models/locales';

// eslint-disable-next-line @typescript-eslint/naming-convention
const {StatusBar} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    selectedKp: number;
    currentKp: number;

    //private splashScreen: SplashScreen // TODO
    constructor(private _platform: Platform, private _router: Router, private _translateService: TranslateService, private _storageService: StorageService) {
        this._initializeApp();
    }

    private _initializeApp() {
        if (this._platform.is('hybrid')) {
            StatusBar.setBackgroundColor({color: '#69BFAF'});
        }
        this._platform.ready().then(async () => {
            this._storageService.init().then(() => {
                this._getLocale();
                this._getUnit();

            });
            this._translateService.addLangs(['fr', 'en']);
            await this._router.navigate(['/tabs/tab2']);

            // this.getKp();
            // this.isNotifsActive();
        });
    }

    private _isNotifsActive(): void {
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
    }

    private _getKp(): void {
        // this.storage.get('kp_notif').then(kp => (this.selectedKp = kp));
        // this.storage.get('current_kp').then(kp => (this.currentKp = kp));
    }

    private _getLocale(): void {
        this._storageService.getData('locale').then(
            (locale: ELocales) => {
                if (locale) {
                    this._translateService.setDefaultLang(locale);
                    void this._storageService.setData('locale', locale);
                } else {
                    if (this._translateService.getBrowserLang() === ELocales.FR) {
                        this._translateService.setDefaultLang('fr');
                        void this._storageService.setData('locale', ELocales.FR);
                    } else {
                        this._translateService.setDefaultLang(this._translateService.getBrowserLang());
                        void this._storageService.setData('locale', this._translateService.getBrowserLang());
                    }
                }
            },
            async noValue => {
                await this._storageService.setData('locale', this._translateService.getBrowserLang());
                console.warn('novalue of locale', noValue);
            }
        );
    }

    private _getUnit(): void {
        this._storageService.getData('unit').then(
            (unit: Unit) => {
                if (unit) {
                    void this._storageService.setData('unit', unit);
                } else {
                    if (this._translateService.getBrowserLang() === 'fr') {
                        void this._storageService.setData('unit', 'metric');
                    } else {
                        void this._storageService.setData('unit', 'imperial');
                    }
                }
            },
            async noValue => {
                await this._storageService.setData('unit', 'metric');
                console.warn('novalue of units', noValue);
            }
        );
    }
}
