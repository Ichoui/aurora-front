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
import type { Marker, ZoomPanOptions } from 'leaflet';
import { icon, LatLng, Map, marker, tileLayer } from 'leaflet';
import moment from 'moment';
import type { Kp27day, KpForecast, SolarCycle, SolarWind } from '../../models/aurorav3';
import { AuroraEnumColours, SolarWindTypes } from '../../models/aurorav3';
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
import { StorageService } from '../../storage.service';

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
  private readonly _storageService = inject(StorageService);
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

  private _chartKpForecast?: Chart<ChartType, number[], string>;
  private _chartKpForecast27?: Chart<ChartType, number[], string>;
  private _chartKpDensity?: Chart<ChartType, number[], string>;
  private _chartKpSpeed?: Chart<ChartType, number[], string>;
  private _chartKpBz?: Chart<ChartType, number[], string>;
  private _chartKpBt?: Chart<ChartType, number[], string>;
  private _chartCycle?: Chart<ChartType, number[], string>;

  private _marker?: Marker;
  private _map?: Map;
  private _formattedAnnotationDate = '';
  readonly mapElement = viewChild<ElementRef<HTMLDivElement>>('map_canvas');

  constructor() {
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
      this._map?.remove();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    afterNextRender(
      () => {
        this.minimapLocation();
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

  /**
   *  On récupère la localisation pour initialiser la map.
   * Charge également la map avec les lat/long envoyée depuis la page popup (Marker et Ville Préselectionnées)
   * */
  minimapLocation(): void {
    this._storageService.getData('location').then(coords => {
      if (coords && !this._destroyRef.destroyed) {
        this._mapInit(coords.lat, coords.long);
      }
    });
  }

  /**
   * @param lat
   * @param long
   * Création de la map
   * */
  private _mapInit(lat: number, long: number): void {
    if (!this._map) {
      const canvas = this.mapElement()?.nativeElement;
      if (!canvas) return;
      this._map = new Map(canvas);
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { className: 'map-filter' }).addTo(this._map);
    }
    const mapOpt: ZoomPanOptions = {
      animate: true,
    };

    this._map.setView([lat, long], 3, mapOpt);
    this._addMarker(lat, long);

    this._map.dragging.disable();
    this._map.zoomControl.remove();
    this._map.doubleClickZoom.disable();
    this._map.scrollWheelZoom.disable();
    this._map.attributionControl.remove();
  }

  /**
   * @param lat
   * @param long
   * Création d'un marker sur la map
   * */
  private _addMarker(lat: number, long: number): void {
    if (!this._map) return;
    if (!this._marker) {
      this._marker = marker([lat, long], {
        icon: icon({
          iconSize: [25, 25],
          iconUrl: 'assets/img/marker-icon.png',
        }),
      }).addTo(this._map);
    } else {
      this._marker.setLatLng(new LatLng(lat, long));
    }
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
    this._popover.dismiss().then(() => this._router.navigate(['tabs', 'tab3', path], { queryParams: { cardId } }));
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
