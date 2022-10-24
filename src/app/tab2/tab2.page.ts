import { Component } from '@angular/core';
import { cities, CodeLocation, Coords } from '../models/cities';
import { AuroraService } from '../aurora.service';
import { NavController } from '@ionic/angular';
import { ACEModule } from '../models/aurorav2';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { StorageService } from '../storage.service';
import { tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { MeasureUnits } from '../models/weather';
import { Kp27day, KpForecast, SolarCycle, SolarWind } from '../models/aurorav3';
import { determineColorsOfValue, monthSwitcher } from '../models/utils';
import { OnViewWillEnter } from '../models/ionic';
import { HttpErrorResponse } from '@angular/common/http';
import { ELocales } from '../models/locales';
import SwiperCore, { Navigation, Pagination, SwiperOptions } from 'swiper';

SwiperCore.use([Pagination, Navigation]);
// import 'moment/locale/fr';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnViewWillEnter {
  loading = true;

  coords: Coords;
  city: string;
  country: string;

  eventRefresh: any;

  // Data inputs
  moduleACE: ACEModule;
  kpForecast: KpForecast[] = [];
  kpForecast27days: Kp27day[] = [];
  unit: MeasureUnits;
  locale: ELocales;
  solarWindInstant: SolarWind;
  solarWind: SolarWind[];
  solarCycle: SolarCycle[];

  dataError = new ErrorTemplate(null);
  configSwiper: SwiperOptions = {
    pagination: {
      enabled: true,
      clickable: false,
      type: 'bullets',
      bulletClass: `swiper-pagination-bullet`,
    },
    scrollbar: false,
    slidesPerView: 1,
    autoHeight: true,
  };

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _auroraService: AuroraService,
  ) {}

  ionViewWillEnter(): void {
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
    this._getDataACE();
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
    this._getDataACE();
  }

  /**
   * Récupère les données ACE de vent solaire, nowcast et kp
   * */
  private _getDataACE(): void {
    combineLatest([
      this._auroraService.getSolarWind$(),
      this._auroraService.auroraLiveV2$(this.coords.latitude, this.coords.longitude), // To be removed
      this._auroraService.getKpForecast27Days$(),
      this._auroraService.getKpForecast$(),
      this._auroraService.getSolarCycle$(),
      this._storageService.getData('measure'),
      this._storageService.getData('locale'),
    ])
      .pipe(
        tap({
          next: ([solarWind, ace, kp27day, kpForecast, solarCycle, unit, locale]: [
            SolarWind[],
            ACEModule,
            string,
            KpForecast[],
            SolarCycle[],
            MeasureUnits,
            ELocales,
          ]) => {
            this.loading = false;
            this.moduleACE = ace; // to be removed
            this.solarCycle = solarCycle;
            this.unit = unit;
            this.locale = locale;
            this.solarWindInstant = this._getSolarWind(solarWind, true) as SolarWind;
            this.solarWind = this._getSolarWind(solarWind) as SolarWind[];
            this.kpForecast = this._getKpForecast(kpForecast);
            this.kpForecast27days = this._getKpForecast27day(kp27day);

            // End loading
            this.loading = false;
            this.eventRefresh ? this.eventRefresh.target.complete() : '';
          },
          error: (error: HttpErrorResponse) => {
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

  private _getSolarWind(dataSolarWind: SolarWind[], instant = false): SolarWind[] | SolarWind {
    const keyFromFirstIndexValue = Object.values(dataSolarWind[0]);
    let solarWind: SolarWind[] = [];
    for (const value of Object.values(dataSolarWind)) {
      // Associe un tableau de clef à un tableau de valeurs à chaque itération et l'ajoute à un tableau
      solarWind.push(
        keyFromFirstIndexValue.reduce((o, k, i) => {
          let val = value[i];
          if (k !== 'propagated_time_tag' && k !== 'time_tag' && k !== 'temperature') {
            // Transforme certaine valeur en Integer
            val = parseFloat(value[i]);
          }
          return { ...o, [k]: val };
        }, {}),
      );
    }
    if (instant) {
      return solarWind[solarWind.length - 1];
    }
    solarWind.shift(); // Removing first index with keys
    return solarWind;
  }

  private _getKpForecast(kpForecast: KpForecast[]): KpForecast[] {
    return kpForecast
      .map(kp => ({
        color: determineColorsOfValue('kp', parseInt(kp[1])),
        value: parseInt(kp[1]),
        predicted: kp[2],
        date: new Date(kp[0]),
      }))
      .filter(kp => kp.predicted === 'predicted');
  }

  private _getKpForecast27day(file: string): Kp27day[] {
    let lineObject: Kp27day[] = [];
    for (const [index, line] of file.split(/[\r\n]+/).entries()) {
      const hashRegex = /#(\w*)/; // Ligne ne commençant pas par un commentaire #
      if (index >= 11 && !hashRegex.exec(line)) {
        const lineArray = line.split(' ').filter(e => !!e);
        lineObject.push({
          date: new Date(parseInt(lineArray[0]), monthSwitcher(lineArray[1]?.toLowerCase()), parseInt(lineArray[2])),
          value: parseInt(lineArray[lineArray.length - 1]),
          color: determineColorsOfValue('kp', parseInt(lineArray[lineArray.length - 1])),
        });
      }
    }
    return lineObject;
  }

  /**
   @param event {event} renvoyé par le rafraichissement
   * Attends les retours des résultats d'API pour retirer l'animation visuelle
   * */
  doRefresh(event) {
    this.eventRefresh = event;
    this._getDataACE();
  }
}
