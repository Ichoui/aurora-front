import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AuroraService } from '../aurora.service';
import { Currently, Daily, HourClock, Hourly, MeasureUnits, TemperatureUnits, Weather } from '../models/weather';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Geocoding } from '../models/geocoding';
import { countryNameFromCode, roundTwoNumbers } from '../models/utils';
import { combineLatest, from, Subject } from 'rxjs';
import { OnViewWillEnter } from '../models/ionic';
import { ELocales } from '../models/locales';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ToastError } from '../shared/toast/toast.component';
import { CityCoords } from '../models/cities';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab1Page implements OnViewWillEnter, OnDestroy {
  loading: boolean = true;

  coords: CityCoords;
  city: string;
  country: string;
  tzOffset: number;

  private readonly _destroy$ = new Subject<void>();
  private _eventRefresh: any;

  // Data inputs
  dataCurrentWeather: Currently;
  dataHourly: Hourly[];
  dataSevenDay: Daily[];

  measureUnits: MeasureUnits;
  temperatureUnits: TemperatureUnits;
  locale: ELocales;
  hourClock: HourClock;
  dataToast: ToastError;

  constructor(
    private _storageService: StorageService,
    private _auroraService: AuroraService,
    private _translate: TranslateService,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ionViewWillEnter(): void {
    this.loading = true; // buffer constant

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
        takeUntil(this._destroy$),
        tap({
          next: ([coords, previousLocation, measure, temperature, weather, locale, clock]: [
            CityCoords,
            { lat: number; long: number },
            MeasureUnits,
            TemperatureUnits,
            any,
            ELocales,
            HourClock,
          ]) => {
            this.temperatureUnits = temperature;
            this.measureUnits = measure;
            this.locale = locale;
            this.hourClock = clock;

            // Ceci pour éviter de call l'API trop souvent
            if (this._shouldRecallWeatherAPI(weather, coords, previousLocation)) {
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
          },
        }),
      )
      .subscribe();
  }

  /**
   * Return TRUE
   * PreviousLocation and location are different
   * No weather in store
   * Date stored is passed from more than 5mn
   * */
  private _shouldRecallWeatherAPI(weather: Weather, location: CityCoords, previousLocation: { lat: number; long: number }): boolean {
    const weatherDateDifference = weather?.date ? moment(new Date()).diff(moment(weather['date']), 'minutes') : null;
    let bool = false;

    if (
      roundTwoNumbers(location?.lat) !== roundTwoNumbers(previousLocation?.lat) ||
      roundTwoNumbers(location?.long) !== roundTwoNumbers(previousLocation?.long) ||
      !weather ||
      weatherDateDifference > 10
    ) {
      bool = true;
    }
    return bool;
  }

  /**
   * @lat {number}
   * @long {number}
   * Si utilisateur a déjà eu accès à cette page / utilisé la tab 3 / rentré coords dans tab3
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
        takeUntil(this._destroy$),
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            this.city = res ? `${res.name}${res?.state ? ', ' + res.state : ''} -` : null;
            this.country = res ? countryNameFromCode(res.country, this.locale) : null;
            this._getForecast(this.city, this.country);
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Reverse geocode error ==> ', error.error);
            this._eventRefresh?.target?.complete();
            this.dataToast = {
              message: this._translate.instant('global.error.reversegeo'),
              status: error.status,
            };
          },
        }),
      )
      .subscribe();
  }

  /**
   * API OpenWeatherMap
   */
  private _getForecast(city: string, country: string): void {
    this._auroraService
      .openWeatherMapForecast$(this.coords.lat, this.coords.long, this.locale)
      .pipe(
        takeUntil(this._destroy$),
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
            void this._storageService.setData('previousLocation', {
              lat: this.coords.lat,
              long: this.coords.long,
            });

            // End loading
            this._eventRefresh ? this._eventRefresh.target.complete() : '';
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
          },
        }),
      )
      .subscribe();
  }

  /**
   @event {event} renvoyé par le rafraichissement
   * Attends les retours des résultats d'API pour retirer l'animation visuelle
   */
  doRefresh(event: any): void {
    this._eventRefresh = event;
    this._getForecast(this.city, this.country);
  }

  protected readonly close = close;
}
