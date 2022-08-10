import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  selectedKp: number;
  currentKp: number;

  //private splashScreen: SplashScreen // TODO
  constructor(private platform: Platform, private router: Router, private translateService: TranslateService, private storage: Storage) {
    this.initializeApp();
  }

  initializeApp() {
    if (this.platform.is('hybrid')) {StatusBar.setBackgroundColor({ color: '#69BFAF' }).then();}
    this.platform.ready().then(() => {
      this.translateService.addLangs(['fr', 'en']);
      this.getLanguage();
      this.getUnit();
      this.router.navigate(['/tabs/tab2']);

      // this.getKp();
      // this.isNotifsActive();
    });
  }

  isNotifsActive(): void {
    this.storage.get('notifications_active').then(notifs => {
      if (notifs) {
        // console.log(this.selectedKp);
        // console.log(this.currentKp);
        if (this.selectedKp === this.currentKp && this.selectedKp !== undefined) {
          // console.log('Cool');
        } else {
          // console.log('PAS Cool');
        }
      }
    });
  }

  getKp(): void {
    this.storage.get('kp_notif').then(kp => (this.selectedKp = kp));
    this.storage.get('current_kp').then(kp => (this.currentKp = kp));
  }

  getLanguage(): void {
    this.storage.get('language').then(
      lg => {
        if (lg) {
          this.translateService.setDefaultLang(lg);
          this.storage.set('language', lg);
        } else {
          if (this.translateService.getBrowserLang() === 'fr') {
            this.translateService.setDefaultLang('fr');
            this.storage.set('language', 'fr');
          } else {
            this.translateService.setDefaultLang(this.translateService.getBrowserLang());
            this.storage.set('language', this.translateService.getBrowserLang());
          }
        }
      },
      noValue => {
        this.storage.set('language', this.translateService.getBrowserLang());
        console.warn('novalue of language', noValue);
      }
    );
  }

  getUnit(): void {
    this.storage.get('unit').then(
      unit => {
        if (unit) {
          this.storage.set('unit', unit);
        } else {
          if (this.translateService.getBrowserLang() === 'fr') {
            this.storage.set('unit', 'metric');
          } else {
            this.storage.set('unit', 'imperial');
          }
        }
      },
      noValue => {
        this.storage.set('unit', 'metric');
        console.warn('novalue of units', noValue);
      }
    );
  }
}
