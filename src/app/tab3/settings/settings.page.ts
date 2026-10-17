import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { SelectCustomEvent, ViewWillEnter } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonItem,
  IonSelect,
  IonSelectOption,
  ModalController,
} from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { SelectContents } from '../../models/locales';
import { ELocales, Locales } from '../../models/locales';
import { HourClock, hourClockSystem, MeasureUnits, measureUnits, temperatureUnits, TemperatureUnits } from '../../models/weather';
import { HeaderComponent } from '../../shared/header/header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { StorageService } from '../../storage.service';

interface About {
  label: string;
  labelLink: string;
  url: string;
  bis?: About;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    IonContent,
    TranslatePipe,
    RouterLink,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonFabList,
  ],
})
export class SettingsPage implements ViewWillEnter {
  private readonly _storageService = inject(StorageService);
  private readonly _modalController = inject(ModalController);
  private readonly _translateService = inject(TranslateService);

  readonly locale = signal(ELocales.FR);
  readonly locales: SelectContents[] = Locales;

  readonly measureUnits = signal(MeasureUnits.METRIC);
  readonly measure: SelectContents[] = measureUnits;

  readonly temperatureUnits = signal(TemperatureUnits.CELSIUS);
  readonly temperature: SelectContents[] = temperatureUnits;

  readonly hourClock = signal(HourClock.TWENTYFOUR);
  readonly hourClockSystem: SelectContents[] = hourClockSystem;

  readonly versionApp = signal<string | null>(null);

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

  /**
   * Invoqué à chaque retour sur la page
   * */
  async ionViewWillEnter(): Promise<void> {
    await Promise.all([this._getLocale(), this._getMeasureUnit(), this._getTemperatureUnit(), this._getClockHourSystem()]);

    if (Capacitor.isNativePlatform()) {
      const info = await App.getInfo();
      this.versionApp.set(info.version);
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
  setLocale(event: SelectCustomEvent<ELocales>): void {
    this.locale.set(event.detail.value);
    this._translateService.use(this.locale());
    void this._storageService.setData('locale', event.detail.value);
  }

  /**
   * Sélection de l'unité Imperiale ou Métrique
   * */
  setMeasureUnit(event: SelectCustomEvent<MeasureUnits>): void {
    this.measureUnits.set(event.detail.value);
    void this._storageService.setData('measure', event.detail.value);
  }

  /**
   * Sélection de l'unité Celsius ou Farheneight
   * */
  setTemperatureUnit(event: SelectCustomEvent<TemperatureUnits>): void {
    this.temperatureUnits.set(event.detail.value);
    void this._storageService.setData('temperature', event.detail.value);
  }

  /**
   * Sélection du format horaire
   * */
  setHourClockSystem(event: SelectCustomEvent<HourClock>): void {
    this.hourClock.set(event.detail.value);
    void this._storageService.setData('clock', event.detail.value);
  }

  private async _getLocale(): Promise<void> {
    const locale = (await this._storageService.getData('locale')) ?? ELocales.EN;
    this._translateService.use(locale);
    this.locale.set(locale);
  }

  private async _getMeasureUnit(): Promise<void> {
    this.measureUnits.set((await this._storageService.getData('measure')) ?? MeasureUnits.METRIC);
  }

  private async _getTemperatureUnit(): Promise<void> {
    this.temperatureUnits.set((await this._storageService.getData('temperature')) ?? TemperatureUnits.CELSIUS);
  }

  private async _getClockHourSystem(): Promise<void> {
    this.hourClock.set((await this._storageService.getData('clock')) ?? HourClock.TWENTYFOUR);
  }

  /**
   * @param url {string} Url navigable
   * Demande à l'utilisateur d'ouvrir dans l'application au choix le lien
   **/
  openUrl(url: string): void {
    window.open(url, '_self');
  }
}
