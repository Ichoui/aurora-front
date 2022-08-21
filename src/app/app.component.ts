import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

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
            StatusBar.setBackgroundColor({color: '#69BFAF'}).then();
        }
        this._platform.ready().then(() => {
            this._storageService.init().then(() => {
            this._getLanguage();
            this._getUnit();

            });
            this._translateService.addLangs(['fr', 'en']);
            this._router.navigate(['/tabs/tab2']).then();

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

    private _getLanguage(): void {
        this._storageService.getData('language').then(
            lg => {
                if (lg) {
                    this._translateService.setDefaultLang(lg);
                    this._storageService.setData('language', lg).then();
                } else {
                    if (this._translateService.getBrowserLang() === 'fr') {
                        this._translateService.setDefaultLang('fr');
                        this._storageService.setData('language', 'fr').then();
                    } else {
                        this._translateService.setDefaultLang(this._translateService.getBrowserLang());
                        this._storageService.setData('language', this._translateService.getBrowserLang()).then();
                    }
                }
            },
            noValue => {
                this._storageService.setData('language', this._translateService.getBrowserLang()).then();
                console.warn('novalue of language', noValue);
            }
        );
    }

    private _getUnit(): void {
        this._storageService.getData('unit').then(
            unit => {
                if (unit) {
                    this._storageService.setData('unit', unit).then();
                } else {
                    if (this._translateService.getBrowserLang() === 'fr') {
                        this._storageService.setData('unit', 'metric').then();
                    } else {
                        this._storageService.setData('unit', 'imperial').then();
                    }
                }
            },
            noValue => {
                this._storageService.setData('unit', 'metric').then();
                console.warn('novalue of units', noValue);
            }
        );
    }
}
