import { Component } from '@angular/core';
import { cities, CodeLocation, Coords } from '../models/cities';
import { AuroraService } from '../aurora.service';
import { NavController } from '@ionic/angular';
import { ACEModule, Kp27day, KpForecast } from '../models/aurorav2';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { StorageService } from '../storage.service';
import { tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Unit } from '../models/weather';
import { SolarWind } from '../models/aurorav3';
import { environment } from '../../environments/environment';

// import 'moment/locale/fr';
const API_CALL_NUMBER = 1; // nombre de fois où une API est appelé sur cette page

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  loading = true;
  tabLoading: string[] = [];

  localisation: string;
  coords: Coords;
  city: string;
  country: string;

  eventRefresh: any;

  // Data inputs
  moduleACE: ACEModule;
  kpForecast: KpForecast[] = [];
  kpForecast27days: Kp27day[] = [];

  dataError = new ErrorTemplate(null);
  unit: Unit;
  solarWind: SolarWind[];

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _auroraService: AuroraService,
  ) {}

  ionViewWillEnter() {
    this.tabLoading = [];

    fetch(`${environment.cors}/https://services.swpc.noaa.gov/text/27-day-outlook.txt`).then((e: Response) => {
      console.log(e);
      // return e.formData();
      // return e.text();
    }).then(f => {
      // fs.
      // console.log(f);
      // console.log(f);
      // const t =JSON.stringify(f)
      // const l = JSON.parse(t)
      // console.log(l);
    })


    // this._auroraService.test$().subscribe(console.log);

    // Cheminement en fonction si la localisation est pré-set ou si géoloc
    this._storageService.getData('location').then(
      (codeLocation: CodeLocation) => {
        if (!codeLocation) {
          this._userLocalisation();
        } else if (codeLocation.code === 'currentLocation' || codeLocation.code === 'marker') {
          this._getExistingLocalisation(codeLocation.lat, codeLocation.long);
        } else {
          this._chooseExistingCity(codeLocation.code);
        }
      },
      error => {
        console.warn('Local storage error', error);
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
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   */
  private _userLocalisation() {
    this._geoloc
      .getCurrentPosition()
      .then(resp => {
        this._getExistingLocalisation(resp.coords.latitude, resp.coords.longitude);
      })
      .catch(error => {
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
   * @param lat {number}
   * @param long {number}
   * Set les coords avec celles existante en localStorage (déjà eu accès tab3 et marker placé ou géolocalisé)
   * */
  private _getExistingLocalisation(lat: number, long: number) {
    this.coords = {
      latitude: lat,
      longitude: long,
    };
    this._getSolarWind();
  }

  /**
   * @param code slug de la ville pour pouvoir récupérer les données liées au code
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
    this._getSolarWind();
  }

  /**
   * Récupère les données ACE de vent solaire & nowcast
   * */
  private _getSolarWind(): void {
    combineLatest([
      this._auroraService.getSolarWind$(),
      this._auroraService.auroraLiveV2$(this.coords.latitude, this.coords.longitude),
      this._storageService.getData('unit'),
    ])
      .pipe(
        tap({
          next: ([solarWind, ace, unit]: [SolarWind[], ACEModule, Unit]) => {
            this.solarWind = solarWind;
            this.loading = false;
            this.moduleACE = ace;
            this.kpForecast27days = ace['kp:27day'];
            this.kpForecast = ace['kp:forecast'];
            this._trickLoading('1st');
            this.unit = unit;
          },
          error: error => {
            console.warn('Wind Solar data error', error);
            this.loading = false;
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
   * @param count {string}
   * Gère le loader
   * Lorsque tout les appels API sont passés et le tableau égal à la valeur API_CALL_NUMBER, débloque le loader
   * */
  private _trickLoading(count: string): void {
    this.tabLoading.push(count);
    if (this.tabLoading.length === API_CALL_NUMBER) {
      this.loading = false;
      this.eventRefresh ? this.eventRefresh.target.complete() : '';
    }
  }

  /**
   @param event {event} renvoyé par le rafraichissement
   * Attends les retours des résultats d'API pour retirer l'animation visuelle
   * */
  doRefresh(event) {
    this.tabLoading = [];
    this.eventRefresh = event;
    this._getSolarWind();
  }
}
