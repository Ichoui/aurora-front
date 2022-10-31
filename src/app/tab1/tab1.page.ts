import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NavController, Platform } from '@ionic/angular';
import { AuroraService } from '../aurora.service';
import { cities, CodeLocation, Coords } from '../models/cities';
import { Currently, Daily, Hourly, MeasureUnits, TemperatureUnits, Weather } from '../models/weather';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { map, tap } from 'rxjs/operators';
import { Geocoding } from '../models/geocoding';
import { countryNameFromCode, roundTwoNumbers } from '../models/utils';
import { combineLatest, from } from 'rxjs';
import { OnViewWillEnter } from '../models/ionic';
import { ELocales } from '../models/locales';
import * as moment from 'moment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnViewWillEnter {
  loading = true;

  coords: Coords;
  city: string;
  country: string;

  private _eventRefresh: any;

  // Data inputs
  dataCurrentWeather: Currently;
  dataHourly: Hourly[];
  dataSevenDay: Daily[];

  measureUnits: MeasureUnits;
  temperatureUnits: TemperatureUnits;
  dataError = new ErrorTemplate(null);
  locale: ELocales;

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _platform: Platform,
    private _auroraService: AuroraService,
  ) {}

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
            }
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Local storage error', error);
            this.dataError = new ErrorTemplate({
              value: true,
              status: error.status,
              message: error.statusText,
              error,
            });
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
  private _shouldRecallWeatherAPI(
    weather: Weather,
    location: CodeLocation,
    previousLocation: { lat: number; long: number },
  ): boolean {
    const weatherDateDifference = weather?.date ? moment(new Date()).diff(moment(weather['date']), 'minutes') : null;
    let bool = false;

    if (
      roundTwoNumbers(location?.lat) !== roundTwoNumbers(previousLocation?.lat) ||
      roundTwoNumbers(location?.long) !== roundTwoNumbers(previousLocation?.long) ||
      !weather ||
      weatherDateDifference > 5
    ) {
      bool = true;
    }
    return bool;
  }

  // How to get Forecast if location has recently changed
  private _manageWeatherDisplay(codeLocation?: CodeLocation): void {
    if (!codeLocation) {
      this._userLocalisation();
    } else if (codeLocation.code === 'currentLocation' || codeLocation.code === 'marker') {
      this._reverseGeoloc(codeLocation.lat, codeLocation.long);
    } else {
      this._chooseExistingCity(codeLocation.code);
    }
  }

  /**
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   */
  private _userLocalisation(): void {
    this._geoloc
      .getCurrentPosition()
      .then(resp => this._reverseGeoloc(resp.coords.latitude, resp.coords.longitude))
      .catch((error: HttpErrorResponse) => {
        console.warn('Geolocalisation error', error);
        this.loading = false;
        this.dataError = new ErrorTemplate({
          value: true,
          status: error.status,
          message: error.statusText,
          error,
        });
      });
  }

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
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            this.city = `${res?.name}${res?.state ? ', ' + res.state : ''} -`;
            this.country = countryNameFromCode(res?.country);
            // TODO rajouter le state dans l'interface visible (pour rajouter notion genre québec/alberta/occitanie/michigan)
            // TODO Rajouter également un country code en FR et EN, préférable en JSON pour charger plus vite et pas d'API
            this._getForecast(this.city, this.country);
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Reverse geocode error ==> ', error);
            this.loading = false;
            this.dataError = new ErrorTemplate({
              value: false,
              status: error.status,
              message: error.statusText,
              error,
            });
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
    this._auroraService.openWeatherMapForecast$(this.coords.latitude, this.coords.longitude, this.locale).subscribe(
      (res: Weather) => {
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
        this.loading = false;
        this._eventRefresh ? this._eventRefresh.target.complete() : '';
      },
      (error: HttpErrorResponse) => {
        console.warn('OpenWeatherMap forecast error', error);
        this.loading = false;
        this.dataError = new ErrorTemplate({
          value: true,
          status: error.status,
          message: error.statusText,
          error,
        });
      },
    );
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
