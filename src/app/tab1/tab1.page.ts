import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AuroraService } from '../aurora.service';
import { cities, CodeLocation, Coords } from '../models/cities';
import { Currently, Daily, Hourly, MeasureUnits, TemperatureUnits, Weather } from '../models/weather';
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

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab1Page implements OnViewWillEnter, OnDestroy {
  loading = true;

  coords: Coords;
  city: string;
  country: string;

  private readonly _destroy$ = new Subject<void>();
  private _eventRefresh: any;

  // Data inputs
  dataCurrentWeather: Currently;
  dataHourly: Hourly[];
  dataSevenDay: Daily[];

  measureUnits: MeasureUnits;
  temperatureUnits: TemperatureUnits;
  locale: ELocales;
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
    ])
      .pipe(
        takeUntil(this._destroy$),
        tap({
          next: ([location, previousLocation, measure, temperature, weather, locale]: [
            CodeLocation,
            { lat: number; long: number },
            MeasureUnits,
            TemperatureUnits,
            any,
            ELocales,
          ]) => {
            this.temperatureUnits = temperature;
            this.measureUnits = measure;
            this.locale = locale;

            // Ceci pour éviter de call l'API trop souvent
            if (this._shouldRecallWeatherAPI(weather, location, previousLocation)) {
              this._manageWeatherDisplay(location);
            } else {
              this.dataCurrentWeather = weather.dataCurrentWeather;
              this.dataHourly = weather.dataHourly;
              this.dataSevenDay = weather.dataSevenDay;
              this.city = weather.city;
              this.country = weather.country;
              this.coords = {
                latitude: location?.lat,
                longitude: location?.long,
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
  private _shouldRecallWeatherAPI(weather: Weather, location: CodeLocation, previousLocation: { lat: number; long: number }): boolean {
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

  // How to get Forecast if location has recently changed
  private _manageWeatherDisplay(codeLocation?: CodeLocation): void {
    // if (!codeLocation) {
    //   this._userLocalisation();
    // } else
    if (codeLocation.code === 'currentLocation' || codeLocation.code === 'marker') {
      this._reverseGeoloc(codeLocation.lat, codeLocation.long);
    } else {
      this._chooseExistingCity(codeLocation.code);
    }
  }

  /*  /!**
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   *!/
  // TODO should : ne devrait pas exister! On cherche la localisation bien avant
  private async _userLocalisation(): Promise<void> {
    await Geolocation.getCurrentPosition()
      .then(resp => this._reverseGeoloc(resp.coords.latitude, resp.coords.longitude))
      .catch((error: HttpErrorResponse) => {
        console.warn('Geolocalisation error', error.error);
        this._eventRefresh?.target?.complete();
        this.dataToast = {
          message: this._translate.instant('global.error.geoloc'),
          status: error.status,
        };
      });
  }*/

  /**
   * @lat {number}
   * @long {number}
   * Si utilisateur a déjà eu accès à cette page / utilisé la tab 3 / rentré coords dans tab3
   * reverseGeocode, retrouve le nom de la ville via Lat/long
   */
  private _reverseGeoloc(lat: number, long: number): void {
    this.coords = {
      latitude: lat,
      longitude: long,
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
   * @code slug de la ville pour pouvoir récupérer les données liées au code
   * Choisir une des villes pré-enregistrées
   */
  private _chooseExistingCity(code: string): void {
    const city = cities.find(res => res.code === code);
    this.city = city.ville;
    this.country = city.pays;

    this.coords = {
      latitude: city.latitude,
      longitude: city.longitude,
    };
    this._getForecast(city.ville, city.pays);
  }

  /**
   * API OpenWeatherMap
   */
  private _getForecast(city: string, country: string): void {
    this._auroraService
      .openWeatherMapForecast$(this.coords.latitude, this.coords.longitude, this.locale)
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
            });
            void this._storageService.setData('previousLocation', {
              lat: this.coords.latitude,
              long: this.coords.longitude,
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
}
