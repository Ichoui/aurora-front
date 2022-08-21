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
            StatusBar.setBackgroundColor({color: '#69BFAF'});
        }
        this._platform.ready().then(async () => {
            this._storageService.init().then(() => {
                this._getLanguage();
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

    private _getLanguage(): void {
        this._storageService.getData('language').then(
            async lg => {
                if (lg) {
                    this._translateService.setDefaultLang(lg);
                    await this._storageService.setData('language', lg);
                } else {
                    if (this._translateService.getBrowserLang() === 'fr') {
                        this._translateService.setDefaultLang('fr');
                        await this._storageService.setData('language', 'fr');
                    } else {
                        this._translateService.setDefaultLang(this._translateService.getBrowserLang());
                        await this._storageService.setData('language', this._translateService.getBrowserLang());
                    }
                }
            },
            async noValue => {
                await this._storageService.setData('language', this._translateService.getBrowserLang());
                console.warn('novalue of language', noValue);
            }
        );
    }

    private _getUnit(): void {
        this._storageService.getData('unit').then(
            async unit => {
                if (unit) {
                    await this._storageService.setData('unit', unit);
                } else {
                    if (this._translateService.getBrowserLang() === 'fr') {
                        await this._storageService.setData('unit', 'metric');
                    } else {
                        await this._storageService.setData('unit', 'imperial');
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
