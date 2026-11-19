import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import type { ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Injector,
  input,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonIcon, IonPopover, ModalController, PopoverController } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { ChartType, ScriptableContext } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { LatLngTuple, Marker } from 'leaflet';
import { icon, Map, marker, tileLayer } from 'leaflet';
import moment from 'moment';
import type { Kp27day, KpForecast, SolarCycle, SolarWind } from '../../models/aurorav3';
import { AuroraEnumColours, SolarWindTypes } from '../../models/aurorav3';
import type { CityCoords } from '../../models/cities';
import { MAIN_TEXT_COLOR, SOLARWIND_NOWTIME_BGC_CHART_COLOR, SOLARWIND_NOWTIME_CHART_COLOR } from '../../models/colors';
import { ELocales } from '../../models/locales';
import {
  colorSwitcher,
  convertUnitMeasure,
  determineColorsOfValue,
  manageDates,
  updateDataChart,
  updateGradientBackgroundChart,
} from '../../models/utils';
import { HourClock, MeasureUnits } from '../../models/weather';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PlaceholderChartsComponent } from '../../shared/placeholders/placeholder-charts/placeholder-charts.component';

const numberMaxNextHours = 12;
Chart.register(...registerables, annotationPlugin);

@Component({
  selector: 'app-forecast-auroral-activity',
  templateUrl: './forecast-auroral-activity.component.html',
  styleUrl: './forecast-auroral-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, TranslatePipe, RouterLink, IonPopover, PlaceholderChartsComponent, NgTemplateOutlet, NgOptimizedImage],
})
export class ForecastAuroralActivityComponent implements OnChanges {
  private readonly _modalController = inject(ModalController);
  private readonly _translateService = inject(TranslateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);
  private readonly _popover = inject(PopoverController);

  readonly kpForecast = input<KpForecast[]>([]);
  readonly kpForecast27 = input<Kp27day[]>([]);
  readonly solarWind = input<SolarWind[]>([]);
  readonly solarCycle = input<SolarCycle[]>([]);
  readonly measure = input(MeasureUnits.METRIC);
  readonly locale = input(ELocales.EN);
  readonly hourClock = input(HourClock.TWENTYFOUR);
  readonly loading = input(false);
  readonly mapLocation = input<CityCoords>();

  private _chartKpForecast?: Chart<ChartType, number[], string>;
  private _chartKpForecast27?: Chart<ChartType, number[], string>;
  private _chartKpDensity?: Chart<ChartType, number[], string>;
  private _chartKpSpeed?: Chart<ChartType, number[], string>;
  private _chartKpBz?: Chart<ChartType, number[], string>;
  private _chartKpBt?: Chart<ChartType, number[], string>;
  private _chartCycle?: Chart<ChartType, number[], string>;

  private _marker?: Marker;
  private _map?: Map;
  private _mapObserver?: IntersectionObserver;
  private _mapVisible = false;
  private _formattedAnnotationDate = '';
  private readonly _mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapCanvas');

  constructor() {
    afterNextRender(() => {
      this._mapObserver = new IntersectionObserver(([entry]) => {
        this._mapVisible = entry.isIntersecting;
        if (this._mapVisible) this._updateMinimap();
      });
      this._mapObserver.observe(this._mapElement().nativeElement);
    });
    this._destroyRef.onDestroy(() => {
      [
        this._chartKpForecast,
        this._chartKpForecast27,
        this._chartKpDensity,
        this._chartKpSpeed,
        this._chartKpBz,
        this._chartKpBt,
        this._chartCycle,
      ].forEach(chart => chart?.destroy());
      this._mapObserver?.disconnect();
      this._map?.remove();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    afterNextRender(
      () => {
        if (changes['mapLocation']) this._updateMinimap();
        this._formattedAnnotationDate = manageDates(+moment(), this.hourClock() === HourClock.TWENTYFOUR ? 'HH[h]mm' : 'hh:mm A');
        if (changes['kpForecast']) this._chartNextHoursForecast(this.kpForecast(), changes['kpForecast'].firstChange);
        if (changes['kpForecast27']) this._chartForecast27day(this.kpForecast27(), changes['kpForecast27'].firstChange);
        if (['solarWind', 'measure', 'hourClock'].some(key => changes[key])) this._calculateDataForChartSolarWind(this.solarWind());
        if (changes['solarCycle'] || changes['locale']) this._calculateDataForChartSolarCycle(this.solarCycle());
        this._cdr.markForCheck();
      },
      { injector: this._injector },
    );
  }

  private _updateMinimap(): void {
    const location = this.mapLocation();
    if (!location || !this._mapVisible || this._destroyRef.destroyed) return;

    const center: LatLngTuple = [location.lat, location.long];
    if (this._map) {
      this._map.invalidateSize().setView(center, 3, { animate: false });
      this._marker?.setLatLng(center);
      return;
    }

    this._map = new Map(this._mapElement().nativeElement, {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tapHold: false,
    }).setView(center, 3);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: 'map-filter',
    }).addTo(this._map);
    this._marker = marker(center, {
      interactive: false,
      keyboard: false,
      alt: '',
      icon: icon({
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        iconUrl: 'assets/img/marker-icon.png',
      }),
    }).addTo(this._map);
  }

  async showPoles(): Promise<void> {
    const modal = await this._modalController.create({
      component: ModalComponent,
      componentProps: {
        ovation: true,
        locale: this.locale(),
        hourClock: this.hourClock(),
        measureUnit: this.measure(),
      },
    });
    return await modal.present();
  }

  navigateToDoc(cardId: number, path: string): void {
    this._popover.dismiss().then(() => this._router.navigate(['tabs', 'tab2', path], { queryParams: { cardId } }));
  }

  private _chartNextHoursForecast(forecast: KpForecast[], firstChange = false): void {
    const nextHoursForecast = [];
    const nextHoursDate = [];
    const nextHoursColors = [];
    for (const unit of forecast) {
      const utcOffsetInMinutes = moment().utcOffset();
      if (nextHoursForecast.length < numberMaxNextHours) {
        nextHoursDate.push(moment.utc(unit.timeTag).add(utcOffsetInMinutes, 'minutes').local().format('HH') + 'h');
        nextHoursForecast.push(unit.kpIndex);
        const color = unit.kpIndex >= 6 ? AuroraEnumColours.red : (unit.color ?? determineColorsOfValue('kp', unit.kpIndex));
        nextHoursColors.push(colorSwitcher(color));
      }
    }
    if (firstChange || !this._chartKpForecast) {
      // 14 values
      this._chartKpForecast = ForecastAuroralActivityComponent._chartKp('kpnexthours', nextHoursDate, nextHoursForecast, nextHoursColors);
    } else {
      updateDataChart(this._chartKpForecast, nextHoursDate, [nextHoursForecast], nextHoursColors);
    }
  }

  private _chartForecast27day(forecast: Kp27day[], firstChange = false): void {
    const forecastValue = [];
    const forecastDate = [];
    const forecastColors = [];
    for (const unit of forecast) {
      forecastDate.push(unit.timeTag);
      forecastValue.push(unit.kpIndex);
      const color = unit.kpIndex >= 6 ? AuroraEnumColours.red : unit.color;
      forecastColors.push(colorSwitcher(color));
    }
    if (firstChange || !this._chartKpForecast27) {
      // 14 values
      this._chartKpForecast27 = ForecastAuroralActivityComponent._chartKp('kpforecast', forecastDate, forecastValue, forecastColors);
    } else {
      updateDataChart(this._chartKpForecast27, forecastDate, [forecastValue], forecastColors);
    }
  }

  private static _chartKp(
    type: 'kpforecast' | 'kpnexthours',
    labels: string[],
    data: number[],
    colors: (string | undefined)[],
  ): Chart<ChartType, number[], string> {
    return new Chart<ChartType, number[], string>(type, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: SOLARWIND_NOWTIME_CHART_COLOR,
            font: {
              family: 'Oswald-SemiBold',
              size: 13,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 90, // No rotation of label for each tick of X axe
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-SemiBold' }),
            },
          },
          y: {
            min: 0,
            display: false,
            grid: {
              display: false,
            },
          },
        },
        layout: {
          padding: { top: 30 },
        },
      },
    });
  }

  /* les heures contenues dans solarWind ne sont pas toujours correctes, parfois on a 13h17 13h18 13h20 avec des sauts.
    Ce qui implique qu'on ne peut pas afficher l'heure actuelle sur les graphiques de vent solaire. On arrondie alors avec le temps le plus proche grâce à cette fonction
  **/
  private _nearestHourFn(formattedAnnotationDate: string, labels: string[]): string | undefined {
    if (labels.length === 0) {
      return;
    }
    return labels?.reduce((prev, curr) => {
      const currentDiff = Math.abs(moment(formattedAnnotationDate, 'HH:mm').diff(moment(curr, 'HH:mm'))); // Différence entre heure actuelle et cible
      const prevDiff = Math.abs(moment(formattedAnnotationDate, 'HH:mm').diff(moment(prev, 'HH:mm'))); // Différence entre heure précédente et cible

      return currentDiff < prevDiff ? curr : prev; // Renvoie le temps le plus proche
    });
  }

  private _calculateDataForChartSolarWind(forecast: SolarWind[]): void {
    const bzForecast = [],
      speedForecast = [],
      btForecast = [],
      densityForecast = [],
      solarWindDate = [];

    for (const unit of forecast) {
      solarWindDate.push(manageDates(unit.propagated_time_tag, this.hourClock() === HourClock.TWENTYFOUR ? 'HH[h]mm' : 'hh:mm A'));
      densityForecast.push(unit.density);
      bzForecast.push(unit.bz);
      btForecast.push(unit.bt);
      speedForecast.push(convertUnitMeasure(unit.speed, this.measure()));
    }
    const hour = { nearest: this._nearestHourFn(this._formattedAnnotationDate, solarWindDate), real: this._formattedAnnotationDate };
    this._chartKpDensity?.destroy();
    this._chartKpSpeed?.destroy();
    this._chartKpBz?.destroy();
    this._chartKpBt?.destroy();
    this._chartKpDensity = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.DENSITY, solarWindDate, densityForecast, hour);
    this._chartKpSpeed = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.SPEED, solarWindDate, speedForecast, hour, this.measure());
    this._chartKpBz = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.BZ, solarWindDate, bzForecast, hour);
    this._chartKpBt = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.BT, solarWindDate, btForecast, hour);
  }

  private _calculateDataForChartSolarCycle(solarCycles: SolarCycle[]): void {
    const solarCycleDate = [];
    const predictedF10 = [];
    const predictedSsn = [];
    const colorSsn = colorSwitcher(AuroraEnumColours.red);
    const colorF10 = colorSwitcher(AuroraEnumColours.green);

    for (const cycle of solarCycles) {
      predictedF10.push(cycle.predictedSolarFlux);
      predictedSsn.push(cycle.predictedSsn);
      solarCycleDate.push(cycle.timeTag);
    }
    this._chartCycle?.destroy();
    this._chartCycle = this._chartSolarCycle(solarCycleDate, predictedSsn, predictedF10, colorSsn, colorF10);
  }

  // https://www.chartjs.org/docs/latest/charts/line.html#point-styling
  private static _chartSolarWind(
    type: SolarWindTypes,
    labels: string[],
    data: number[],
    formattedHour: { real: string; nearest: string | undefined },
    measure?: MeasureUnits,
  ): Chart<ChartType, number[], string> | undefined {
    if (data.length === 0) {
      return undefined;
    }
    return new Chart<ChartType, number[], string>(type, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data,
            backgroundColor: (context: ScriptableContext<'line'>) => updateGradientBackgroundChart(context, type, data, measure),
            pointBackgroundColor: (context: ScriptableContext<'line'>) => determineColorsOfValue(type, data[context.dataIndex], measure),
            borderColor: colorSwitcher(determineColorsOfValue(type, type !== SolarWindTypes.BZ ? Math.max(...data) : Math.min(...data), measure)),
            borderWidth: 1,
            pointRadius: 1.5,
            fill: 'origin',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                drawTime: 'afterDatasetsDraw',
                value: formattedHour.nearest, // On doit trouver le plus proche label si pas de correspondance.....
                scaleID: 'x',
                label: {
                  display: true,
                  content: ['🕘' + formattedHour.real],
                  backgroundColor: SOLARWIND_NOWTIME_BGC_CHART_COLOR,
                  position: 'start',
                  rotation: 90,
                  padding: 2,
                  font: () => ({ family: 'Oswald-Regular', size: 11 }),
                },
                borderColor: SOLARWIND_NOWTIME_CHART_COLOR,
                borderWidth: 2,
              },
            },
          },
          legend: { display: false },
          filler: {
            propagate: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 25, // more padding between each tick of X axe
              maxRotation: 0, // No rotation of label for each tick of X axe
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-Regular' }),
            },
          },
          y: {
            suggestedMin: type === SolarWindTypes.BZ ? -15 : undefined,
            suggestedMax: type === SolarWindTypes.BZ ? 15 : undefined,
            grid: {
              display: true,
              color: '#f3f3f333',
            },
            ticks: {
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-Regular' }),
            },
          },
        },
      },
    });
  }

  private _chartSolarCycle(
    labels: string[],
    dataSsn: number[],
    dataF10: number[],
    colorsSsn: string,
    colorsF10: string,
  ): Chart<ChartType, number[], string> {
    return new Chart<ChartType, number[], string>('cycle', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this._translateService.instant('tab2.forecast.cycle.ssn'), //'Sunspot number',
            data: dataSsn,
            backgroundColor: colorsSsn,
            borderColor: colorsSsn,
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: this._translateService.instant('tab2.forecast.cycle.sfu'), //'Solar Flux units',
            data: dataF10,
            backgroundColor: colorsF10,
            borderColor: colorsF10,
            borderWidth: 1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-Regular' }),
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 15, // more padding between each tick of X axe
              maxRotation: 90, // No rotation of label for each tick of X axe
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-Regular' }),
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: MAIN_TEXT_COLOR,
              font: () => ({ family: 'Oswald-Regular', size: 12 }),
            },
          },
        },
      },
    });
  }
}
