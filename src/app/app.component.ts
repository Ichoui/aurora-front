import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { ELocales } from './models/locales';
import { HourClock, MeasureUnits, TemperatureUnits } from './models/weather';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  // Ionic's cached router views need an eager application shell.
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ion-app class="md">
      @if (!loadApp()) {
        <div class="content-spinner">
          <div class="whirly-loader"></div>
        </div>
      } @else {
        <ion-router-outlet />
      }
    </ion-app>
  `,
})
export class AppComponent {
  private readonly _platform = inject(Platform);
  private readonly _translateService = inject(TranslateService);
  private readonly _storageService = inject(StorageService);

  readonly loadApp = signal(false);

  constructor() {
    void this._initializeApp().catch((error: unknown) => console.error('Application initialization failed', error));
  }

  private async _initializeApp(): Promise<void> {
    await this._platform.ready();
    if (Capacitor.isNativePlatform()) {
      void SystemBars.setStyle({ style: SystemBarsStyle.Dark }).catch((error: unknown) => console.warn('System bars unavailable', error));
    }
    this._translateService.addLangs([ELocales.FR, ELocales.EN]);
    await this._storageService.init();
    await Promise.all([this._getLocale(), this._getMeasureUnit(), this._getTempUnit(), this._getHourClockSystem()]);
    this.loadApp.set(true);
  }

  private async _getLocale(): Promise<void> {
    const locale =
      (await this._storageService.getData('locale')) ?? (this._translateService.getBrowserLang() === ELocales.FR ? ELocales.FR : ELocales.EN);
    this._translateService.setFallbackLang(locale);
    this._translateService.use(locale);
    await this._storageService.setData('locale', locale);
  }

  private async _getMeasureUnit(): Promise<void> {
    const measure =
      (await this._storageService.getData('measure')) ??
      (this._translateService.getBrowserLang() === ELocales.FR ? MeasureUnits.METRIC : MeasureUnits.IMPERIAL);
    await this._storageService.setData('measure', measure);
  }

  private async _getTempUnit(): Promise<void> {
    const temperature =
      (await this._storageService.getData('temperature')) ??
      (this._translateService.getBrowserLang() === ELocales.FR ? TemperatureUnits.CELSIUS : TemperatureUnits.FAHRENHEIT);
    await this._storageService.setData('temperature', temperature);
  }

  private async _getHourClockSystem(): Promise<void> {
    const clock = (await this._storageService.getData('clock')) ?? HourClock.TWENTYFOUR;
    await this._storageService.setData('clock', clock);
  }
}
