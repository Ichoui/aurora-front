import type { HttpErrorResponse } from '@angular/common/http';
import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { RefresherCustomEvent, ViewWillEnter } from '@ionic/angular';
import { IonContent, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { combineLatest, from, map, tap } from 'rxjs';
import { AuroraService } from '../aurora.service';
import type { CityCoords } from '../models/cities';
import type { Geocoding } from '../models/geocoding';
import { ELocales } from '../models/locales';
import type { CachedWeather } from '../models/storage';
import { countryNameFromCode, roundTwoNumbers } from '../models/utils';
import type { Currently, Daily, Hourly, Weather } from '../models/weather';
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

  private readonly _destroyRef = inject(DestroyRef);
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

  ngOnDestroy(): void {
    void this._eventRefresh?.target.complete();
  }

  ionViewWillEnter(): void {
    this.loading = true; // buffer constant
    this._cdr.markForCheck();
    // Cheminement en fonction si la localisation est pré-set ou si géoloc
    combineLatest([
      from(this._storageService.getData('location')),
      from(this._storageService.getData('previousLocation')),
      from(this._storageService.getData('measure')),
      from(this._storageService.getData('temperature')),
      from(this._storageService.getData('weather')),
      from(this._storageService.getData('locale')),
      from(this._storageService.getData('clock')),
    ])
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap({
          next: ([coords, previousLocation, measure, temperature, weather, locale, clock]) => {
            if (!coords) return;
            this.temperatureUnits = temperature ?? TemperatureUnits.CELSIUS;
            this.measureUnits = measure ?? MeasureUnits.METRIC;
            this.locale = locale ?? ELocales.EN;
            this.hourClock = clock ?? HourClock.TWENTYFOUR;

            // Ceci pour éviter de call l'API trop souvent
            if (!weather || this._shouldRecallWeatherAPI(weather, coords, previousLocation)) {
              this._reverseGeoloc(coords.lat, coords.long);
            } else {
              this.dataCurrentWeather = weather.dataCurrentWeather;
              this.dataHourly = weather.dataHourly;
              this.dataSevenDay = weather.dataSevenDay;
              this.city = weather.city;
              this.country = weather.country;
              this.tzOffset = weather.timezoneOffset;
              this.coords = {
                lat: coords?.lat,
                long: coords?.long,
              };
              this.loading = false;
              this._cdr.markForCheck();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Local storage error', error.message);
            this.dataToast = {
              message: this._translate.instant('global.error.storage'),
              status: error.status,
            };

            this._cdr.markForCheck();
          },
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  /**
   * Return TRUE
   * PreviousLocation and location are different
   * No weather in store
   * Date stored is passed from more than 5mn
   * */
  private _shouldRecallWeatherAPI(weather: CachedWeather | null, location: CityCoords, previousLocation: CityCoords | null): boolean {
    const weatherDateDifference = weather?.date ? moment(new Date()).diff(moment(weather['date']), 'minutes') : null;
    let bool = false;

    if (
      roundTwoNumbers(location?.lat) !== roundTwoNumbers(previousLocation?.lat) ||
      roundTwoNumbers(location?.long) !== roundTwoNumbers(previousLocation?.long) ||
      !weather ||
      (weatherDateDifference ?? Infinity) > 10
    ) {
      bool = true;
    }
    return bool;
  }

  /**
   * @lat {number}
   * @long {number}
   * Si utilisateur a déjà eu accès à la localisation
   * reverseGeocode, retrouve le nom de la ville via Lat/long
   */
  private _reverseGeoloc(lat: number, long: number): void {
    this.coords = {
      lat,
      long,
    };
    this._auroraService
      .getGeocoding$(lat, long)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            this.city = res ? `${res.name} -` : '';
            this.country = res ? countryNameFromCode(res.country, this.locale) : '';
            this._getForecast(this.city, this.country);
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Reverse geocode error ==> ', error.error);
            this._eventRefresh?.target?.complete();
            this.dataToast = {
              message: this._translate.instant('global.error.reversegeo'),
              status: error.status,
            };

            this._cdr.markForCheck();
          },
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  /**
   * API OpenWeatherMap
   */
  private _getForecast(city: string, country: string): void {
    if (!this.coords) return;
    this._auroraService
      .openWeatherMapForecast$(this.coords.lat, this.coords.long, this.locale)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap({
          next: (res: Weather) => {
            this.dataCurrentWeather = res.current;
            this.dataHourly = res.hourly;
            this.dataSevenDay = res.daily;
            void this._storageService.setData('weather', {
              dataCurrentWeather: res.current,
              dataHourly: res.hourly,
              dataSevenDay: res.daily,
              city: city,
              country: country,
              date: new Date(),
              timezoneOffset: res.timezone_offset,
            });
            this.tzOffset = res.timezone_offset;
            if (this.coords) void this._storageService.setData('previousLocation', this.coords);

            // End loading
            void this._eventRefresh?.target.complete();
            this.loading = false;
            this._cdr.markForCheck();
          },
          error: (error: HttpErrorResponse) => {
            console.warn('OpenWeatherMap forecast error', error.error);
            this._eventRefresh?.target?.complete();
            this.dataToast = {
              message: this._translate.instant('global.error.weatherForecast'),
              status: error.status,
            };

            this._cdr.markForCheck();
          },
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  /**
   @event {event} renvoyé par le rafraichissement
   * Attends les retours des résultats d'API pour retirer l'animation visuelle
   */
  doRefresh(event: RefresherCustomEvent): void {
    this._eventRefresh = event;
    this._getForecast(this.city, this.country);
  }
}
