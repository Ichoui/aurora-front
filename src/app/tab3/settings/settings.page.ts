import { Component } from '@angular/core';
import { ELocales, Locales, SelectContents } from '../../models/locales';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { HourClock, hourClockSystem, MeasureUnits, measureUnits, temperatureUnits, TemperatureUnits } from '../../models/weather';
import { StorageService } from '../../storage.service';
import { OnViewWillEnter } from '../../models/ionic';
import { App } from '@capacitor/app';

interface About {
  label: string;
  labelLink: string;
  url: string;
  bis?: About;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnViewWillEnter {
  locale = ELocales.FR;
  readonly locales: SelectContents[] = Locales;

  measureUnits = MeasureUnits.METRIC;
  readonly measure: SelectContents[] = measureUnits;

  temperatureUnits = TemperatureUnits.CELSIUS;
  readonly temperature: SelectContents[] = temperatureUnits;

  hourClock = HourClock.TWENTYFOUR;
  readonly hourClockSystem: SelectContents[] = hourClockSystem;

  versionApp: string = null;

  readonly about: About[] = [
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
      url: 'https://play.google.com/store/apps/details?id=io.aurora.start',
      bis: {
        label: 'third.bis',
        labelLink: 'third.bis.link',
        url: 'https://www.paypal.me/ichoui/1',
      },
    },
  ];

  constructor(
    private _storageService: StorageService,
    private _modalController: ModalController,
    private _translateService: TranslateService,
    private _platform: Platform,
  ) {}

  /**
   * Invoqué à chaque retour sur la page
   * */
  async ionViewWillEnter(): Promise<void> {
    this._getLocale();
    this._getMeasureUnit();
    this._getTemperatureUnit();
    this._getClockHourSystem();

    if (this._platform.is('hybrid')) {
      const info = await App?.getInfo();
      this.versionApp = info.version;
    }
  }

  async CGU(): Promise<void> {
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
  setLocale(event): void {
    this.locale = event.detail.value;
    this._translateService.use(this.locale);
    void this._storageService.setData('locale', event.detail.value);
  }

  /**
   * Sélection de l'unité Imperiale ou Métrique
   * */
  setMeasureUnit(event): void {
    this.measureUnits = event.detail.value;
    void this._storageService.setData('measure', event.detail.value);
  }

  /**
   * Sélection de l'unité Celsius ou Farheneight
   * */
  setTemperatureUnit(event): void {
    this.temperatureUnits = event.detail.value;
    void this._storageService.setData('temperature', event.detail.value);
  }

  /**
   * Sélection du format horaire
   * */
  setHourClockSystem(event): void {
    this.hourClock = event.detail.value;
    void this._storageService.setData('clock', event.detail.value);
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

  private _getClockHourSystem(): void {
    this._storageService.getData('clock').then((clock: HourClock) => (this.hourClock = clock));
  }

  /**
   * @param url {string} Url navigable
   * Demande à l'utilisateur d'ouvrir dans l'application au choix le lien
   **/
  openUrl(url: string): void {
    window.open(url, '_self');
  }
}
