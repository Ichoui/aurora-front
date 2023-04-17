import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
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
import { determineColorsOfValue } from '../models/utils';
import { OnViewWillEnter } from '../models/ionic';
import { HttpErrorResponse } from '@angular/common/http';
import { ELocales } from '../models/locales';
import SwiperCore, { Navigation, Pagination, SwiperOptions } from 'swiper';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';

SwiperCore.use([Pagination, Navigation]);

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab2Page implements OnViewWillEnter, OnDestroy {
  loading = true;
  loadSwiper = false;

  coords: Coords;
  city: string;
  country: string;
  // Data inputs
  kpForecast: KpForecast[] = [];
  kpForecast27days: Kp27day[] = [];
  measure: MeasureUnits;
  locale: ELocales;
  solarWindInstant: SolarWind;
  solarWind: SolarWind[] = [];
  solarCycle: SolarCycle[] = [];
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
  private _eventRefresh: any;

  constructor(
    private _geoloc: Geolocation,
    private _storageService: StorageService,
    private _navCtrl: NavController,
    private _auroraService: AuroraService,
    private _translate: TranslateService,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ionViewWillEnter(): void {
    this.loadSwiper = true;
    this._cdr.markForCheck();

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
        map(([ACEdate, location]: [number, CodeLocation]) => [ACEdate ? moment(new Date()).diff(moment(ACEdate), 'minutes') > 10 : true, location]),
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
            this._cdr.markForCheck();
          },
          error: error => {
            console.warn('Local storage error', error.error);
            // this.dataError = new ErrorTemplate({
            //   value: true,
            //   status: error.status,
            //   message: this._translate.instant('global.error.storage'),
            //   error,
            // });
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
        console.warn('Geolocalisation error', error.message);
        // this.loading = false;
        this._cdr.markForCheck();
        this._eventRefresh?.target?.complete();
        // this.dataError = new ErrorTemplate({
        //   value: true,
        //   status: error.status,
        //   message: this._translate.instant('global.error.geoloc'),
        //   error,
        // });
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
    this._auroraService
      .getAllSwpcDatas$(this.coords.latitude, this.coords.longitude)
      .pipe(
        tap({
          next: value => {
            console.log('PUTA');
            this.kpCurrent = value.instantKp;
            void this._storageService.setData('kpCurrent', value.instantKp);
            this.solarCycle = value.forecastSolarCycle;
            this.solarWindInstant = this._getSolarWind(value.forecastSolarWind, true) as SolarWind;
            this.solarWind = this._getSolarWind(value.forecastSolarWind) as SolarWind[];
            this.kpForecast = this._getKpForecast(value.forecastKp);
            this.kpForecast27days = this._getKpForecast27day(value.forecastTwentySevenDays);
            this.nowcastAurora = value.nowcast;

            // End loading
            this.loading = false;
            this._cdr.markForCheck();
            this._eventRefresh?.target?.complete();

            void this._storageService.setData('solarCycle', value.forecastSolarCycle);
            void this._storageService.setData('solarWind', value.forecastSolarWind);
            void this._storageService.setData('kpForecast', value.forecastKp);
            void this._storageService.setData('kp27day', value.forecastTwentySevenDays);
            void this._storageService.setData('ACEdate', new Date());
            void this._storageService.setData('nowcastAurora', value.nowcast);
          },
          error: (error: HttpErrorResponse) => {
            console.warn('Solar Wind data error', error.message);
            // this.loading = false;
            this._cdr.markForCheck();
            this._eventRefresh?.target?.complete();
            // this.dataError = new ErrorTemplate({
            //   value: true,
            //   status: error.status,
            //   message: this._translate.instant('global.error.solarwind'),
            //   error,
            // });
          },
        }),
      )
      .subscribe();
  }

  private _getSolarWind(dataSolarWind: SolarWind[], instant = false): SolarWind[] | SolarWind {
    if (instant) {
      return dataSolarWind.reduce((a, b) => {
        const aDiff = moment.utc(a.propagated_time_tag).diff(moment.utc(new Date()));
        return aDiff > 0 && aDiff < moment.utc(b.propagated_time_tag).diff(moment.utc(new Date())) ? a : b;
      });
    }
    return dataSolarWind ?? [];
  }

  private _getKpForecast(kpForecast: KpForecast[]): KpForecast[] {
    return kpForecast.map(kp => ({
      color: determineColorsOfValue('kp', kp.kpIndex),
      kpIndex: kp.kpIndex,
      timeTag: new Date(kp.timeTag),
    }));
  }

  private _getKpForecast27day(file: string): Kp27day[] {
    let lineObject: Kp27day[] = [];
    for (const [index, line] of file.split(/[\r\n]+/).entries()) {
      const hashRegex = /#(\w*)/; // Ligne ne commençant pas par un commentaire #
      if (index >= 11 && !hashRegex.exec(line)) {
        // lineArray type : [Year, Month, Day, SolarF10.7, A-index, Largest KpIndex]
        const lineArray = line.split(' ').filter(e => !!e);
        if (!lineArray.length) {
          break;
        }
        lineObject.push({
          timeTag: moment(`${lineArray[2]} ${lineArray[1]} ${lineArray[0]}`, 'DD MMM').format('DD/MM'),
          kpIndex: parseInt(lineArray[lineArray.length - 1]),
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
    this._eventRefresh = event;
    this._getDataACE();
  }
}
