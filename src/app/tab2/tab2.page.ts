import type { HttpErrorResponse } from '@angular/common/http';
import type { ElementRef, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, viewChild } from '@angular/core';
import type { RefresherCustomEvent, ViewWillEnter } from '@ionic/angular';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Subscription } from 'rxjs';
import type { SwiperContainer } from 'swiper/element';
import { AuroraService } from '../aurora.service';
import type { Kp27day, KpCurrent, KpForecast, SolarCycle, SolarWind, SwpcData } from '../models/aurorav3';
import type { LocationSelection } from '../models/cities';
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

  private readonly _swiper = viewChild<ElementRef<SwiperContainer>>('activitySwiper');
  private _requests = new Subscription();
  private _requestVersion = 0;
  private _eventRefresh?: RefresherCustomEvent;

  loading = true;
  loadSwiper = false;
  location?: LocationSelection;
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
  nowcastUpdatedAt?: number;
  nowcastLoading = true;
  dataToast: ToastError | null = null;

  ngOnDestroy(): void {
    this._requestVersion++;
    this._requests.unsubscribe();
    this._completeRefresh();
  }

  ionViewWillEnter(): void {
    this.loadSwiper = true;
    this._swiper()?.nativeElement.swiper?.slideTo(0, 0);
    this._cdr.markForCheck();
    void this._loadActivity();
  }

  get updateTime(): string {
    return this.nowcastUpdatedAt
      ? new Intl.DateTimeFormat(this.locale, { hour: 'numeric', minute: '2-digit', hour12: this.hourClock === HourClock.TWELVE }).format(
          this.nowcastUpdatedAt,
        )
      : '';
  }

  get nowcastStale(): boolean {
    return this.nowcastUpdatedAt !== undefined && Date.now() - this.nowcastUpdatedAt > 10 * 60_000;
  }

  private async _loadActivity(force = false): Promise<void> {
    const version = ++this._requestVersion;
    this._requests.unsubscribe();
    this._requests = new Subscription();
    this.dataToast = null;

    try {
      const [location, measure, locale, clock, activityDate, solarCycle, solarWind, kpForecast, outlook, kpCurrent, localNowcast] = await Promise.all(
        [
          this._storageService.getLocation(),
          this._storageService.getData('measure'),
          this._storageService.getData('locale'),
          this._storageService.getData('clock'),
          this._storageService.getData('ACEdate'),
          this._storageService.getData('solarCycle'),
          this._storageService.getData('solarWind'),
          this._storageService.getData('kpForecast'),
          this._storageService.getData('kp27day'),
          this._storageService.getData('kpCurrent'),
          this._storageService.getData('localNowcast'),
        ],
      );
      if (version !== this._requestVersion) return;

      this.location = location;
      this.measure = measure ?? MeasureUnits.METRIC;
      this.locale = locale ?? ELocales.EN;
      this.hourClock = clock ?? HourClock.TWENTYFOUR;
      this._showActivity(solarCycle ?? [], solarWind ?? [], kpForecast ?? [], outlook ?? '', kpCurrent);
      this.loading = !activityDate;

      const cached = localNowcast?.coords.lat === location.lat && localNowcast.coords.long === location.long ? localNowcast : null;
      this.nowcastAurora = cached?.probability ?? null;
      this.nowcastUpdatedAt = cached?.updatedAt;
      this.nowcastLoading = !cached;
      if (force || !cached || this.nowcastStale) this._fetchNowcast(location);

      if (force || !activityDate || moment().diff(moment(activityDate), 'minutes') >= 10) {
        this._fetchActivity(location);
      } else {
        this._completeRefresh();
      }
    } catch (error) {
      if (version !== this._requestVersion) return;
      this.loading = false;
      this.nowcastLoading = false;
      this._completeRefresh();
      this.dataToast = { message: this._translate.instant('global.error.storage'), status: error instanceof Error ? error.name : '' };
    }
    this._cdr.markForCheck();
  }

  private _showActivity(
    solarCycle: SolarCycle[],
    solarWind: SolarWind[],
    kpForecast: KpForecast[],
    outlook: string,
    kpCurrent: KpCurrent | null,
  ): void {
    this.solarCycle = solarCycle;
    this.solarWindInstant = this._getSolarWind(solarWind, true);
    this.solarWind = this._getSolarWind(solarWind);
    this.kpForecast = this._getKpForecast(kpForecast);
    this.kpForecast27days = this._getKpForecast27day(outlook);
    this.kpCurrent = kpCurrent;
  }

  private _fetchActivity(location: LocationSelection): void {
    this._requests.add(
      this._auroraService.getAllSwpcDatas$(location.lat, location.long).subscribe({
        next: (data: SwpcData) => {
          this._showActivity(data.forecastSolarCycle, data.forecastSolarWind, data.forecastKp, data.forecastTwentySevenDays, data.instantKp);
          this.loading = false;
          this._completeRefresh();
          this._cdr.markForCheck();
          void Promise.all([
            this._storageService.setData('kpCurrent', data.instantKp),
            this._storageService.setData('solarCycle', data.forecastSolarCycle),
            this._storageService.setData('solarWind', data.forecastSolarWind),
            this._storageService.setData('kpForecast', data.forecastKp),
            this._storageService.setData('kp27day', data.forecastTwentySevenDays),
          ])
            .then(() => this._storageService.setData('ACEdate', new Date()))
            .catch((error: unknown) => console.warn('Activity cache unavailable', error));
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this._completeRefresh();
          this.dataToast = { message: this._translate.instant('global.error.solarwind'), status: error.status };
          this._cdr.markForCheck();
        },
      }),
    );
  }

  private _fetchNowcast({ lat, long }: LocationSelection): void {
    this._requests.add(
      this._auroraService.getNowcast$(lat, long).subscribe({
        next: ({ nowcast }) => {
          const updatedAt = Date.now();
          this.nowcastAurora = nowcast;
          this.nowcastUpdatedAt = updatedAt;
          this.nowcastLoading = false;
          this._cdr.markForCheck();
          void this._storageService
            .setData('localNowcast', { coords: { lat, long }, probability: nowcast, updatedAt })
            .catch((error: unknown) => console.warn('Nowcast cache unavailable', error));
        },
        error: () => {
          this.nowcastLoading = false;
          this._cdr.markForCheck();
        },
      }),
    );
  }

  private _completeRefresh(): void {
    void this._eventRefresh?.target.complete();
    this._eventRefresh = undefined;
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
    void this._loadActivity(true);
  }
}
