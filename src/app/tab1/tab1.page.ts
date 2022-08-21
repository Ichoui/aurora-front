import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { NavController, Platform } from '@ionic/angular';
import { AuroraService } from '../aurora.service';
import { NativeGeocoder, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { cities, CodeLocalisation, Coords } from '../models/cities';
import { Currently, Daily, Hourly, Unit, Weather } from '../models/weather';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
// import { ErrorTemplate } from '../tab2/tab2.page';

// export interface ErrorTemplate {
//   value: boolean;
//   message: string;
// }

const API_CALL_NUMBER = 1; // nombre de fois où une API est appelé sur cette page

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  loading = true;
  tabLoading: string[] = [];

  localisation: string;
  // getCode: string;
  coords: Coords;
  city: string;
  country: string;

  eventRefresh: any;

  // Data inputs
  dataCurrentWeather: Currently;
  dataHourly: Hourly[];
  dataSevenDay: Daily[];
  utcOffset: number;

  unit: Unit;
  dataError = new ErrorTemplate(null);

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _platform: Platform,
    private _auroraService: AuroraService,
    private _nativeGeo: NativeGeocoder
  ) {}

  ionViewWillEnter(): void {
    this.loading = true; // buffer constant
    this.tabLoading = [];

    // Cheminement en fonction si la localisation est pré-set ou si géoloc
    this._storageService.getData('unit').then((unit: Unit) => {
      this.unit = unit;
    });
    this._storageService.getData('localisation').then(
      (codeLocation: CodeLocalisation) => {
        if (!codeLocation) {
          this.userLocalisation();
          // console.log('aa');
        } else if (codeLocation.code === 'currentLocation' || codeLocation.code === 'marker') {
          // console.log('bb');
          this.reverseGeoloc(codeLocation.lat, codeLocation.long);
        } else {
          // console.log('cc');
          this.chooseExistingCity(codeLocation.code);
        }
      },
      (error: HttpErrorResponse) => {
        console.warn('Local storage error', error);
        this.dataError = new ErrorTemplate({
          value: true,
          status: error.status,
          message: error.statusText,
          error,
        });
      }
    );
  }

  /**
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   */
  userLocalisation(): void {
    this._geoloc
      .getCurrentPosition()
      .then(resp => {
        this.reverseGeoloc(resp.coords.latitude, resp.coords.longitude);
      })
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
  reverseGeoloc(lat: number, long: number): void {
    this.coords = {
      latitude: lat,
      longitude: long,
    };
    // this.getForecast(); // TODO pour tricker en web car reverseGeoloc plante avec cordopute / commenter en dessous
    this._nativeGeo.reverseGeocode(lat, long).then(
      (res: NativeGeocoderResult[]) => {
        this.city = res[0].locality;
        this.country = res[0].countryName;
        this.getForecast();
      },
      (error: HttpErrorResponse) => {
        console.warn('Reverse geocode error ==> ');
        console.warn(error);
        this.loading = false;
        this.dataError = new ErrorTemplate({
          value: true,
          status: error.status,
          message: error.statusText,
          error,
        });
      }
    );
  }

  /**
   * @code slug de la ville pour pouvoir récupérer les données liées au code
   * Choisir une des villes pré-enregistrées
   */
  chooseExistingCity(code: string): void {
    const city = cities.find(res => res.code === code);
    this.city = city.ville;
    this.country = city.pays;

    this.coords = {
      latitude: city.latitude,
      longitude: city.longitude,
    };
    this.getForecast();
  }

  /**
   * API OpenWeatherMap
   * 4 variables pour aujourd'hui, les variables vont aux enfants via Input()
   */
  getForecast(): void {
    this._auroraService.openWeatherMapForecast$(this.coords.latitude, this.coords.longitude, this.unit).subscribe(
      (res: Weather) => {
        this.dataCurrentWeather = res.current;
        this.dataHourly = res.hourly;
        this.dataSevenDay = res.daily;
        this.utcOffset = res.timezone_offset; // in seconds
        this.trickLoading('1st');
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
      }
    );
  }

  /**
   * @count {string}
   * Gère le loader
   * Lorsque tout les appels API sont passés et le tableau égal à la valeur API_CALL_NUMBER, débloque le loader
   */
  trickLoading(count: string): void {
    this.tabLoading.push(count);
    if (this.tabLoading.length === API_CALL_NUMBER) {
      this.loading = false;
      this.eventRefresh ? this.eventRefresh.target.complete() : '';
    }
  }

  /**
     @event {event} renvoyé par le rafraichissement
     * Attends les retours des résultats d'API pour retirer l'animation visuelle
     */
  doRefresh(event: any): void {
    this.tabLoading = [];
    this.eventRefresh = event;
    this.getForecast();
  }
}
