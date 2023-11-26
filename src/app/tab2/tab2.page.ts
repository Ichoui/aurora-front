import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { cities, CodeLocation, Coords } from '../models/cities';
import { AuroraService } from '../aurora.service';
import { StorageService } from '../storage.service';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { combineLatest, from, Subject } from 'rxjs';
import { MeasureUnits } from '../models/weather';
import { Kp27day, KpCurrent, KpForecast, SolarCycle, SolarWind, SwpcData } from '../models/aurorav3';
import { determineColorsOfValue } from '../models/utils';
import { OnViewWillEnter } from '../models/ionic';
import { HttpErrorResponse } from '@angular/common/http';
import { ELocales } from '../models/locales';
import SwiperCore, { Navigation, Pagination, SwiperOptions } from 'swiper';
import * as moment from 'moment/moment';
import { TranslateService } from '@ngx-translate/core';
import { ToastError } from '../shared/toast/toast.component';

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

  dataToast: ToastError;
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
    this.loadSwiper = true;
    this._cdr.markForCheck();

    combineLatest([from(this._storageService.getData('measure')), from(this._storageService.getData('locale'))])
      .pipe(
        takeUntil(this._destroy$),
        tap(([measure, locale]: [MeasureUnits, ELocales]) => {
          this.measure = measure;
          this.locale = locale;
        }),
        switchMap(() => combineLatest([from(this._storageService.getData('ACEdate')), from(this._storageService.getData('location'))])),
        map(([ACEdate, location]: [number, CodeLocation]) => [ACEdate ? moment(new Date()).diff(moment(ACEdate), 'minutes') > 10 : true, location]),
        tap(([moreThanFiveMinutes, location]: [boolean, CodeLocation]) => {
          if (moreThanFiveMinutes) {
            // Avoid to load the page every time the user access to tab2, waiting 5 mins
            // if (!location) {
            //   console.log('should not pass here !location tab2');
            //   this._checkPermissions();
            // } else
            if (location.code === 'currentLocation' || location.code === 'marker') {
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

    /*    // TODO should : bloc de code devrait être dans une fonction, appelée dans le retour du combineLatest ci-dessus ... Pour éviter les erreurs bête
    // ou avec un switchMap ??? attention import lol!
    combineLatest([from(this._storageService.getData('ACEdate')), from(this._storageService.getData('location'))])
      .pipe(
        takeUntil(this._destroy$),
        map(([ACEdate, location]: [number, CodeLocation]) => [ACEdate ? moment(new Date()).diff(moment(ACEdate), 'minutes') > 10 : true, location]),
        tap(([moreThanFiveMinutes, location]: [boolean, CodeLocation]) => {
          if (moreThanFiveMinutes) {
            // Avoid to load the page every time the user access to tab2, waiting 5 mins
            if (!location) {
              console.log('should not pass here !location tab2');
              // this._checkPermissions();
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
      .subscribe();*/
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
            console.error('_getACEDataFromStorage() error, message : ', error.error);
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
   * Seulement premier accès sur cette page
   * Déterminer la localisation actuelle de l'utilisateur
   */
  /*  // Voir pour passer tout ce bloc de code dans App.component... Après tout, c'est là la première fois où on cherche la position
  private async _checkPermissions(): Promise<void> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('permission status: ', permissionStatus);

      if (permissionStatus?.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          console.warn('permission request not granted ', request.location);
          this._getExistingLocalisation(69.650288, 18.955098); // par default, on envoie tromso
          return null;
        } else {
          await this._getPosition();
        }
      } else {
        console.warn('permission is granted in ELSE', permissionStatus.location);
        await this._getPosition();
      }
    } catch (e) {
      console.error('catch here, ', e);
      this._getExistingLocalisation(69.650288, 18.955098); // par default, on envoie tromso
    }
  }

  // Todo should : doit suivre la fonction ci-dessus
  private async _getPosition(): Promise<void> {
    await Geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 10000, enableHighAccuracy: true })
      .then(resp => this._getExistingLocalisation(resp.coords.latitude, resp.coords.longitude))
      .catch(error => {
        console.warn('Geolocalisation error', error.message);

        this._cdr.markForCheck();
        this._eventRefresh?.target?.complete();
        this.dataToast = {
          message: this._translate.instant('global.error.geoloc'),
          status: error.status,
        };
      });
  }*/

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
          next: (value: SwpcData) => {
            this.kpCurrent = value.instantKp;
            void this._storageService.setData('kpCurrent', value.instantKp);
            this.solarCycle = value.forecastSolarCycle;
            this.solarWindInstant = this._getSolarWind(value.forecastSolarWind, true) as SolarWind;
            this.solarWind = this._getSolarWind(value.forecastSolarWind) as SolarWind[];
            this.kpForecast = this._getKpForecast(value.forecastKp);
            this.kpForecast27days = this._getKpForecast27day(value.forecastTwentySevenDays);
            // End loading
            this.loading = false;
            this._eventRefresh?.target?.complete();
            this._cdr.markForCheck();

            void this._storageService.setData('solarCycle', value.forecastSolarCycle);
            void this._storageService.setData('solarWind', value.forecastSolarWind);
            void this._storageService.setData('kpForecast', value.forecastKp);
            void this._storageService.setData('kp27day', value.forecastTwentySevenDays);
            void this._storageService.setData('ACEdate', new Date());
          },
          error: (error: HttpErrorResponse) => {
            console.error('_getDataACE() error with getAllSwpcData$, message : ', error.message);
            this._cdr.markForCheck();
            this._eventRefresh?.target?.complete();
            this.dataToast = {
              message: this._translate.instant('global.error.solarwind'),
              status: error.status,
            };
          },
        }),
      )
      .subscribe();

    this._auroraService
      .getAuroraMapData$(this.coords.latitude, this.coords.longitude)
      .pipe(
        tap({
          next: (nowcast: number) => {
            this.nowcastAurora = nowcast;
            this._cdr.markForCheck();
            void this._storageService.setData('nowcastAurora', nowcast);
          },
          error: (error: HttpErrorResponse) => {
            console.error('_getDataACE() error with getAuroraMapData$, message : ', error.message);
            this._cdr.markForCheck();
            this._eventRefresh?.target?.complete();
            this.dataToast = {
              message: this._translate.instant('global.error.solarwind'),
              status: error.status,
            };
          },
        }),
      )
      .subscribe();
  }

  private _getSolarWind(dataSolarWind: SolarWind[], instant = false): SolarWind[] | SolarWind {
    if (dataSolarWind.length === 0) {
      return [];
    }
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
  doRefresh(event: any): void {
    this._eventRefresh = event;
    this._getDataACE();
  }
}
