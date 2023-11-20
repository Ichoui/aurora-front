import { Component } from '@angular/core';
import { ELocales, Locales, SelectContents } from '../../models/locales';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { MeasureUnits, measureUnits, temperatureUnits, TemperatureUnits } from '../../models/weather';
import { StorageService } from '../../storage.service';
import { Browser } from '@capacitor/browser';
import { OnViewWillEnter } from '../../models/ionic';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnViewWillEnter {
  kpindex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  notifications = false;
  notifKp;

  locale = ELocales.FR;
  readonly locales: SelectContents[] = Locales;

  measureUnits = MeasureUnits.METRIC;
  readonly measure: SelectContents[] = measureUnits;

  temperatureUnits = TemperatureUnits.CELSIUS;
  readonly temperature: SelectContents[] = temperatureUnits;

  readonly credits = [
    {
      label: 'first',
      labelLink: 'first.link',
      url: 'https://www.swpc.noaa.gov/',
    },
    {
      label: 'second',
      labelLink: 'second.link',
      url: 'https://openweathermap.org/',
    },
    {
      label: 'third',
      labelLink: 'third.link',
      url: 'https://play.google.com/store/apps/details?id=io.aurora.v2',
      bis: {
        label: 'third.bis',
        labelLink: 'third.bis.link',
        url: 'https://www.paypal.me/ichoui/1',
      },
    },
  ];

  constructor(private _storageService: StorageService, private _modalController: ModalController, private _translateService: TranslateService) {}

  /**
   * Invoqué à chaque retour sur la page
   * */
  ionViewWillEnter() {
    this._getLocale();
    this._getMeasureUnit();
    this._getTemperatureUnit();
  }

  async CGU() {
    const modal = await this._modalController.create({
      component: ModalComponent,
      componentProps: {
        cgu: true,
      },
    });
    return await modal.present();
  }

  /**
   * Sélection de la langue à utiliser et update du storage
   * */
  setLocale(event) {
    this.locale = event.detail.value;
    this._translateService.use(this.locale);
    void this._storageService.setData('locale', this.locale);
  }

  /**
   * Sélection de l'unité Imperiale ou Métrique
   * */
  setMeasureUnit(event): void {
    this.measureUnits = event.detail.value;
    void this._storageService.setData('measure', this.measureUnits);
  }

  /**
   * Sélection de l'unité Celsius ou Farheneight
   * */
  setTemperatureUnit(event): void {
    this.temperatureUnits = event.detail.value;
    void this._storageService.setData('temperature', this.temperatureUnits);
  }

  private _getLocale(): void {
    this._storageService.getData('locale').then((locale: ELocales) => {
      this._translateService.use(locale);
      this.locale = locale;
    });
  }

  private _getMeasureUnit(): void {
    this._storageService.getData('measure').then((measure: MeasureUnits) => (this.measureUnits = measure));
  }

  private _getTemperatureUnit(): void {
    this._storageService.getData('temperature').then((temp: TemperatureUnits) => (this.temperatureUnits = temp));
  }

  /**
   * @param url {string} Url navigable
   * Demande à l'utilisateur d'ouvrir dans l'application au choix le lien
   **/
  openUrl(url: string): void {
    void Browser.open({ url });

    // deeplinks ?
    // https://www.youtube.com/watch?v=tAQwllZSQD8

    // https://capacitorjs.com/docs/guides/deep-links
  }

  // need backend
  // storageNotif(): void {
  //   this.storage.get("notifications_active").then(
  //     (notif) => {
  //       this.notifications = notif;
  //       if (notif) this.storageKP();
  //     },
  //     (error) => console.warn("Problème de récupération notification", error)
  //   );
  // }

  // storageKP(): void {
  //   this.storage.get("kp_notif").then(
  //     (kp) => {
  //       this.notifKp = kp;
  //     },
  //     (error) => console.warn("Problème de récupération notification", error)
  //   );
  // }

  // activeNotif(e): void {
  //   this.notifications = e.detail.checked;
  //   this.storage.set("notifications_active", this.notifications);
  // }

  // selectedKp(choice?: any): void {
  //   if (choice) {
  //     this.notifKp = choice.detail.value;
  //     this.storage.set("kp_notif", this.notifKp);
  //   }
  // }
}
