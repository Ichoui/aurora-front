import { Component, OnDestroy } from '@angular/core';
import { cities, CodeLocation, Coords } from '../models/cities';
import { AuroraService } from '../aurora.service';
import { NavController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ErrorTemplate } from '../shared/broken/broken.model';
import { StorageService } from '../storage.service';
import { map, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, from, Subject } from 'rxjs';
import { MeasureUnits } from '../models/weather';
import { Kp27day, KpCurrent, KpForecast, SolarCycle, SolarWind } from '../models/aurorav3';
import { determineColorsOfValue, monthSwitcher } from '../models/utils';
import { OnViewWillEnter } from '../models/ionic';
import { HttpErrorResponse } from '@angular/common/http';
import { ELocales } from '../models/locales';
import SwiperCore, { Navigation, Pagination, SwiperOptions } from 'swiper';
import * as moment from 'moment/moment';

SwiperCore.use([Pagination, Navigation]);

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnViewWillEnter, OnDestroy {
  loading = true;

  coords: Coords;
  city: string;
  country: string;

  eventRefresh: any;

  // Data inputs
  kpForecast: KpForecast[] = [];
  kpForecast27days: Kp27day[] = [];
  measure: MeasureUnits;
  locale: ELocales;
  solarWindInstant: SolarWind;
  solarWind: SolarWind[];
  solarCycle: SolarCycle[];
  kpCurrent: KpCurrent;
  nowcastAurora: number;

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

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _auroraService: AuroraService,
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ionViewWillEnter(): void {
    combineLatest([from(this._storageService.getData('measure')), from(this._storageService.getData('locale'))])
      .pipe(
        takeUntil(this._destroy$),
        tap(([measure, locale]: [MeasureUnits, ELocales]) => {
          this.measure = measure;
          this.locale = locale;
        }),
      )
      .subscribe();

    combineLatest([from(this._storageService.getData('ACEdate')), from(this._storageService.getData('location'))])
      .pipe(
        takeUntil(this._destroy$),
        map(([ACEdate, location]: [number, CodeLocation]) => [
          ACEdate ? moment(new Date()).diff(moment(ACEdate), 'minutes') > 10 : true,
          location,
        ]),
        tap(([moreThanFiveMinutes, location]: [boolean, CodeLocation]) => {
          if (moreThanFiveMinutes) {
            // Avoid to load the page every time the user access to tab2, waiting 5 mins
            if (!location) {
              this._userLocalisation();
            } else if (location.code === 'currentLocation' || location.code === 'marker') {
              this._getExistingLocalisation(location.lat, location.long);
            } else {
              this._chooseExistingCity(location.code);
            }
          } else {
            this._getACEDataFromStorage();
          }
        }),
      )
      .subscribe();
  }

  private _getACEDataFromStorage() {
    combineLatest([
      from(this._storageService.getData('location')),
      from(this._storageService.getData('solarCycle')),
      from(this._storageService.getData('solarWind')),
      from(this._storageService.getData('kpForecast')),
      from(this._storageService.getData('kp27day')),
      from(this._storageService.getData('nowcastAurora')),
      from(this._storageService.getData('kpCurrent')),
    ])
      .pipe(
        takeUntil(this._destroy$),
        tap({
          next: ([location, solarCycle, solarWind, kpForecast, kp27day, nowcastAurora, kpCurrent]: [
            CodeLocation,
            SolarCycle[],
            SolarWind[],
            KpForecast[],
            string, // kp27day[] in .txt
            number,
            KpCurrent,
          ]) => {
            this.coords = { ...this.coords, latitude: location.lat, longitude: location.long };
            this.solarCycle = solarCycle;
            this.solarWindInstant = this._getSolarWind(solarWind, true) as SolarWind;
            this.solarWind = this._getSolarWind(solarWind) as SolarWind[];
            this.kpForecast = this._getKpForecast(kpForecast);
            this.kpForecast27days = this._getKpForecast27day(kp27day);
            this.nowcastAurora = nowcastAurora;
            this.kpCurrent = kpCurrent;
            this.loading = false;
          },
          error: error => {
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
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   */
  private _userLocalisation() {
    this._geoloc
      .getCurrentPosition()
      .then(resp => this._getExistingLocalisation(resp.coords.latitude, resp.coords.longitude))
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
      this._auroraService.getCurrentKp$(),
      this._auroraService.getKpForecast27Days$(),
      this._auroraService.getKpForecast$(),
      this._auroraService.getSolarCycle$(),
      this._auroraService.getAuroraMapData$(this.coords.latitude, this.coords.longitude),
    ])
      .pipe(
        tap({
          next: ([solarWind, kpCurrent, kp27day, kpForecast, solarCycle, nc]: [
            SolarWind[],
            KpCurrent,
            string,
            KpForecast[],
            SolarCycle[],
            { nowcast: number },
          ]) => {
            this.kpCurrent = kpCurrent;
            void this._storageService.setData('kpCurrent', kpCurrent); // to me remove
            this.solarCycle = solarCycle;
            this.solarWindInstant = this._getSolarWind(solarWind, true) as SolarWind;
            this.solarWind = this._getSolarWind(solarWind) as SolarWind[];
            this.kpForecast = this._getKpForecast(kpForecast);
            this.kpForecast27days = this._getKpForecast27day(kp27day);
            this.nowcastAurora = nc.nowcast

            // End loading
            this.loading = false;
            this.eventRefresh ? this.eventRefresh.target.complete() : '';

            void this._storageService.setData('solarCycle', solarCycle);
            void this._storageService.setData('solarWind', solarWind);
            void this._storageService.setData('kpForecast', kpForecast);
            void this._storageService.setData('kp27day', kp27day);
            void this._storageService.setData('ACEdate', new Date());
            void this._storageService.setData('nowcastAurora', nc.nowcast);
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
        keyFromFirstIndexValue.reduce((acc, key, index) => {
          let val = value[index];
          if (key !== 'propagated_time_tag' && key !== 'time_tag' && key !== 'temperature') {
            // Transforme certaine valeur en Integer
            // Si value n'existe pas (null), on retourne null (bt bz)
            val = val ? parseFloat(value[index]) : value[index];
          }
          return { ...acc, [key]: val };
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
