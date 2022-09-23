import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NavController, Platform } from '@ionic/angular';
import { AuroraService } from '../aurora.service';
import { cities, CodeLocalisation, Coords } from '../models/cities';
import { Currently, Daily, Hourly, Unit, Weather } from '../models/weather';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { map, tap } from 'rxjs/operators';
import { Geocoding } from '../models/geocoding';
import { countryNameFromCode } from '../models/utils';

const API_CALL_NUMBER = 1; // nombre de fois où une API est appelé sur cette page

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
    private _tabLoading: string[] = [];
    loading = true;

    coords: Coords;
    city: string;
    country: string;

    private _eventRefresh: any;

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
    ) {
    }

    ionViewWillEnter(): void {
        this.loading = true; // buffer constant
        this._tabLoading = [];

        // Cheminement en fonction si la localisation est pré-set ou si géoloc
        this._storageService.getData('unit').then((unit: Unit) => {
            this.unit = unit;
        });
        this._storageService.getData('localisation').then(
            (codeLocation: CodeLocalisation) => {
                if (!codeLocation) {
                    this._userLocalisation();
                    // console.log('aa');
                } else if (codeLocation.code === 'currentLocation' || codeLocation.code === 'marker') {
                    // console.log('bb');
                    this._reverseGeoloc(codeLocation.lat, codeLocation.long);
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
    private _userLocalisation(): void {
        this._geoloc
            .getCurrentPosition()
            .then(resp => {
                this._reverseGeoloc(resp.coords.latitude, resp.coords.longitude);
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
    private _reverseGeoloc(lat: number, long: number): void {
        this.coords = {
            latitude: lat,
            longitude: long,
        };
        // this.getForecast(); // @deprecated pour tricker en web car reverseGeoloc plante avec cordopute / commenter en dessous

        this._auroraService.getGeocoding$(lat, long).pipe(
            map((res: Geocoding[]) => res[0]),
            tap({
                next: (res: Geocoding) => {
                    this.city = `${res?.name}${res?.state ? ', ' + res.state : ''} -`;
                    this.country = countryNameFromCode(res.country);
                    this.country = countryNameFromCode(res.country);
                    // TODO rajouter le state dans l'interface visible (pour rajouter notion genre québec/alberta/occitanie/michigan)
                    // TODO Rajouter également un country code en FR et EN, préférable en JSON pour charger plus vite et pas d'API
                    this._getForecast();
                },
                error: error => {
                    // (error: HttpErrorResponse)
                    console.log(error);
                    console.warn('Reverse geocode error ==> ', error);
                    this.loading = false;
                    this.dataError = new ErrorTemplate({
                        value: false,
                        status: error.status,
                        message: error.statusText,
                        error,
                    });
                }
            }))
            .subscribe();
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
        this._getForecast();
    }

    /**
     * API OpenWeatherMap
     * 4 variables pour aujourd'hui, les variables vont aux enfants via Input()
     */
    private _getForecast(): void {
        this._auroraService.openWeatherMapForecast$(this.coords.latitude, this.coords.longitude, this.unit).subscribe(
            (res: Weather) => {
                this.dataCurrentWeather = res.current;
                this.dataHourly = res.hourly;
                this.dataSevenDay = res.daily;
                this.utcOffset = res.timezone_offset; // in seconds
                this._trickLoading('1st');
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
    private _trickLoading(count: string): void {
        this._tabLoading.push(count);
        if (this._tabLoading.length === API_CALL_NUMBER) {
            this.loading = false;
            this._eventRefresh ? this._eventRefresh.target.complete() : '';
        }
    }

    /**
     @event {event} renvoyé par le rafraichissement
     * Attends les retours des résultats d'API pour retirer l'animation visuelle
     */
    doRefresh(event: any): void {
        this._tabLoading = [];
        this._eventRefresh = event;
        this._getForecast();
    }
}
