import type { HttpErrorResponse } from '@angular/common/http';
import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import type { RefresherCustomEvent, ViewWillEnter } from '@ionic/angular';
import { IonContent, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { catchError, forkJoin, of, type Subscription, timeout } from 'rxjs';
import { AuroraService } from '../aurora.service';
import type { CityCoords } from '../models/cities';
import { ELocales } from '../models/locales';
import type { CachedWeather } from '../models/storage';
import { countryNameFromCode, roundTwoNumbers } from '../models/utils';
import type { Currently, Daily, Hourly } from '../models/weather';
import { HourClock, MeasureUnits, TemperatureUnits } from '../models/weather';
import { HeaderComponent } from '../shared/header/header.component';
import type { ToastError } from '../shared/toast/toast.component';
import { ToastComponent } from '../shared/toast/toast.component';
import { StorageService } from '../storage.service';
import { MeteoComponent } from './meteo/meteo.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrl: 'tab1.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonRefresherContent, IonRefresher, IonContent, HeaderComponent, TranslatePipe, MeteoComponent, ToastComponent],
})
export class Tab1Page implements ViewWillEnter, OnDestroy {
  private readonly _storageService = inject(StorageService);
  private readonly _auroraService = inject(AuroraService);
  private readonly _translate = inject(TranslateService);
  private readonly _cdr = inject(ChangeDetectorRef);

  loading: boolean = true;

  coords: CityCoords | null = null;
  city = '';
  country = '';
  tzOffset = 0;

  private _request?: Subscription;
  private _requestVersion = 0;
  private _eventRefresh?: RefresherCustomEvent;

  // Data inputs
  dataCurrentWeather: Currently | null = null;
  dataHourly: Hourly[] = [];
  dataSevenDay: Daily[] = [];

  measureUnits = MeasureUnits.METRIC;
  temperatureUnits = TemperatureUnits.CELSIUS;
  locale = ELocales.EN;
  hourClock = HourClock.TWENTYFOUR;
  dataToast: ToastError | null = null;
  staleWeather = false;

  ngOnDestroy(): void {
    this._requestVersion++;
    this._request?.unsubscribe();
    this._completeRefresh();
  }

  ionViewWillEnter(): void {
    void this._loadWeather();
  }

  doRefresh(event: RefresherCustomEvent): void {
    this._eventRefresh = event;
    void this._loadWeather(true);
  }

  private async _loadWeather(force = false): Promise<void> {
    const version = ++this._requestVersion;
    this._request?.unsubscribe();
    this.dataToast = null;
    try {
      const [location, previous, measure, temperature, weather, locale, clock] = await Promise.all([
        this._storageService.getLocation(),
        this._storageService.getData('previousLocation'),
        this._storageService.getData('measure'),
        this._storageService.getData('temperature'),
        this._storageService.getData('weather'),
        this._storageService.getData('locale'),
        this._storageService.getData('clock'),
      ]);
      if (version !== this._requestVersion) return;

      this.coords = location;
      this.measureUnits = measure ?? MeasureUnits.METRIC;
      this.temperatureUnits = temperature ?? TemperatureUnits.CELSIUS;
      this.locale = locale ?? ELocales.EN;
      this.hourClock = clock ?? HourClock.TWENTYFOUR;
      const cachedCoords = weather?.coords ?? previous;
      const cached =
        weather &&
        cachedCoords &&
        roundTwoNumbers(location.lat) === roundTwoNumbers(cachedCoords.lat) &&
        roundTwoNumbers(location.long) === roundTwoNumbers(cachedCoords.long) &&
        (!weather.locale || weather.locale === this.locale)
          ? weather
          : null;
      this._showWeather(cached, location.label);
      this.staleWeather = !!cached && moment().diff(moment(cached.date), 'minutes') >= 10;
      this.loading = !cached;
      if (force || !cached || this.staleWeather) {
        this._requestWeather(location);
      } else {
        this._completeRefresh();
      }
    } catch {
      if (version !== this._requestVersion) return;
      this._completeRefresh();
      this.loading = false;
      this.dataToast = { message: this._translate.instant('global.error.storage'), status: '' };
    }
    this._cdr.markForCheck();
  }

  private _requestWeather(location: CityCoords & { label?: string }): void {
    const { lat, long } = location;
    this._request = forkJoin({
      places: this._auroraService.getGeocoding$(lat, long).pipe(
        timeout(8000),
        catchError(() => of([])),
      ),
      forecast: this._auroraService.openWeatherMapForecast$(lat, long, this.locale).pipe(timeout(20_000)),
    }).subscribe({
      next: ({ places: [place], forecast }) => {
        const weather: CachedWeather = {
          coords: { lat, long },
          locale: this.locale,
          dataCurrentWeather: forecast.current,
          dataHourly: forecast.hourly,
          dataSevenDay: forecast.daily,
          city: place?.name ?? this.city,
          country: place ? countryNameFromCode(place.country, this.locale) : this.country,
          date: new Date(),
          timezoneOffset: forecast.timezone_offset,
        };
        this._showWeather(weather, location.label);
        this.staleWeather = false;
        this._completeRefresh();
        this.loading = false;
        this._cdr.markForCheck();
        void this._storageService.setData('weather', weather).catch((error: unknown) => console.warn('Weather cache unavailable', error));
      },
      error: (error: HttpErrorResponse) => {
        this._completeRefresh();
        this.loading = false;
        this.dataToast = { message: this._translate.instant('global.error.weatherForecast'), status: error.status };
        this._cdr.markForCheck();
      },
    });
  }

  private _showWeather(weather: CachedWeather | null, locationLabel?: string): void {
    this.dataCurrentWeather = weather?.dataCurrentWeather ?? null;
    this.dataHourly = weather?.dataHourly ?? [];
    this.dataSevenDay = weather?.dataSevenDay ?? [];
    this.city = weather?.city || locationLabel || '';
    this.country = weather?.country ?? '';
    this.tzOffset = weather?.timezoneOffset ?? 0;
  }

  private _completeRefresh(): void {
    void this._eventRefresh?.target.complete();
    this._eventRefresh = undefined;
  }
}
