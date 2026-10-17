import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import type { HttpErrorResponse } from '@angular/common/http';
import type { RefresherCustomEvent, ViewWillEnter } from '@ionic/angular';
import moment from 'moment';
import { combineLatest, from, map, switchMap, tap } from 'rxjs';
import { AuroraService } from '../aurora.service';
import type { Kp27day, KpCurrent, KpForecast, SolarCycle, SolarWind, SwpcData } from '../models/aurorav3';
import type { CityCoords } from '../models/cities';
import { ELocales } from '../models/locales';
import { determineColorsOfValue } from '../models/utils';
import { HourClock, MeasureUnits } from '../models/weather';
import { HeaderComponent } from '../shared/header/header.component';
import type { ToastError } from '../shared/toast/toast.component';
import { ToastComponent } from '../shared/toast/toast.component';
import { StorageService } from '../storage.service';
import { ForecastAuroralActivityComponent } from './forecast-auroral-activity/forecast-auroral-activity.component';
import { InstantAuroralActivityComponent } from './instant-auroral-activity/instant-auroral-activity.component';

@Component({
  selector: 'app-tab2',
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    TranslatePipe,
    HeaderComponent,
    ToastComponent,
    InstantAuroralActivityComponent,
    ForecastAuroralActivityComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: 'tab2.page.html',
  styleUrl: 'tab2.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab2Page implements ViewWillEnter, OnDestroy {
  private readonly _storageService = inject(StorageService);
  private readonly _auroraService = inject(AuroraService);
  private readonly _translate = inject(TranslateService);
  private readonly _cdr = inject(ChangeDetectorRef);

  loading = true;
  loadSwiper = false;

  coords: CityCoords | null = null;
  // Data inputs
  kpForecast: KpForecast[] = [];
  kpForecast27days: Kp27day[] = [];
  measure = MeasureUnits.METRIC;
  locale = ELocales.EN;
  hourClock = HourClock.TWENTYFOUR;
  solarWindInstant: SolarWind | null = null;
  solarWind: SolarWind[] = [];
  solarCycle: SolarCycle[] = [];
  kpCurrent: KpCurrent | null = null;
  nowcastAurora: number | null = null;

  dataToast: ToastError | null = null;

  private readonly _destroyRef = inject(DestroyRef);
  private _eventRefresh?: RefresherCustomEvent;

  ngOnDestroy(): void {
    void this._eventRefresh?.target.complete();
  }

  ionViewWillEnter(): void {
    this.loadSwiper = true;
    this._cdr.markForCheck();

    combineLatest([
      from(this._storageService.getData('measure')),
      from(this._storageService.getData('locale')),
      from(this._storageService.getData('clock')),
    ])
      .pipe(
        tap(([measure, locale, clock]) => {
          this.measure = measure ?? MeasureUnits.METRIC;
          this.locale = locale ?? ELocales.EN;
          this.hourClock = clock ?? HourClock.TWENTYFOUR;
        }),
        switchMap(() => combineLatest([from(this._storageService.getData('ACEdate')), from(this._storageService.getData('location'))])),
        map(([ACEdate, location]) => [ACEdate ? moment().diff(moment(ACEdate), 'minutes') > 10 : true, location] as const),
        tap(([moreThanFiveMinutes, coords]) => {
          if (!coords) return;
          if (moreThanFiveMinutes) {
            // Avoid to load the page every time the user access to tab2, waiting 5 mins
            this._getExistingLocalisation(coords.lat, coords.long);
          } else {
            this._getACEDataFromStorage();
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  private _getACEDataFromStorage(): void {
    combineLatest([
      from(this._storageService.getData('location')),
      from(this._storageService.getData('solarCycle')),
      from(this._storageService.getData('solarWind')),
      from(this._storageService.getData('kpForecast')),
      from(this._storageService.getData('kp27day')),
      from(this._storageService.getData('nowcastAurora')),
      from(this._storageService.getData('kpCurrent')),
      from(this._storageService.getData('clock')),
    ])
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap({
          next: ([coords, solarCycle, solarWind, kpForecast, kp27day, nowcastAurora, kpCurrent, clock]) => {
            this.coords = coords;
            this.solarCycle = solarCycle ?? [];
            this.solarWindInstant = this._getSolarWind(solarWind ?? [], true);
            this.solarWind = this._getSolarWind(solarWind ?? []);
            this.kpForecast = this._getKpForecast(kpForecast ?? []);
            this.kpForecast27days = this._getKpForecast27day(kp27day ?? '');
            this.nowcastAurora = nowcastAurora;
            this.kpCurrent = kpCurrent;
            this.hourClock = clock ?? HourClock.TWENTYFOUR;

            this.loading = false;
            this._cdr.markForCheck();
          },
          error: error => {
            console.error('_getACEDataFromStorage() error, message : ', error.error);
            this.dataToast = {
              message: this._translate.instant('global.error.storage'),
              status: error.status,
            };

            this._cdr.markForCheck();
          },
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Set les coords avec celles existante en localStorage (déjà eu accès tab3 et marker placé ou géolocalisé)
   * */
  private _getExistingLocalisation(lat: number, long: number): void {
    this.coords = {
      lat,
      long,
    };
    this._getDataACE();
  }

  /**
   * Récupère les données ACE de vent solaire, nowcast et kp
   * */
  private _getDataACE(): void {
    if (!this.coords) return;
    this._auroraService
      .getAllSwpcDatas$(this.coords.lat, this.coords.long)
      .pipe(
        tap({
          next: (value: SwpcData) => {
            this.kpCurrent = value.instantKp;
            void this._storageService.setData('kpCurrent', value.instantKp);
            this.solarCycle = value.forecastSolarCycle;
            this.solarWindInstant = this._getSolarWind(value.forecastSolarWind, true);
            this.solarWind = this._getSolarWind(value.forecastSolarWind);
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

        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });

    this._auroraService
      .getAuroraMapData$(this.coords.lat, this.coords.long)
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

        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  private _getSolarWind(dataSolarWind: SolarWind[], instant: true): SolarWind | null;
  private _getSolarWind(dataSolarWind: SolarWind[], instant?: false): SolarWind[];
  private _getSolarWind(dataSolarWind: SolarWind[], instant = false): SolarWind[] | SolarWind | null {
    if (dataSolarWind.length === 0) {
      return instant ? null : [];
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
    const lineObject: Kp27day[] = [];
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
  doRefresh(event: RefresherCustomEvent): void {
    this._eventRefresh = event;
    this._getDataACE();
  }
}
