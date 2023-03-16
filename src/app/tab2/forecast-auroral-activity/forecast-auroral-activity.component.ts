import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Chart, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import {
  colorSwitcher,
  convertUnitMeasure,
  determineColorsOfValue,
  manageDates,
  updateDataChart,
  updateGradientBackgroundChart,
} from '../../models/utils';
import { MAIN_TEXT_COLOR, PRIMARY_COLOR, WEATHER_NEXT_HOUR_CHART_COLOR } from '../../models/colors';
import { CodeLocation, Coords } from '../../models/cities';
import { StorageService } from '../../storage.service';
import { Geoposition } from '@ionic-native/geolocation';
import { icon, LatLng, Map, Marker, marker, tileLayer, ZoomPanOptions } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuroraEnumColours, Kp27day, KpForecast, SolarCycle, SolarWind, SolarWindTypes } from '../../models/aurorav3';
import { ELocales } from '../../models/locales';
import { MeasureUnits } from '../../models/weather';
import { TranslateService } from '@ngx-translate/core';

const numberMax27Forecast = 14;
const numberMaxNextHours = 12;
Chart.register(...registerables);

@Component({
  selector: 'app-forecast-auroral-activity',
  templateUrl: './forecast-auroral-activity.component.html',
  styleUrls: ['./forecast-auroral-activity.component.scss'],
})
export class ForecastAuroralActivityComponent implements OnChanges {
  @Input() kpForecast: KpForecast[];
  @Input() kpForecast27: Kp27day[];
  @Input() solarWind: SolarWind[];
  @Input() solarCycle: SolarCycle[];
  @Input() measure: MeasureUnits;
  @Input() locale: ELocales;

  private _chartKpForecast: Chart<ChartType, string[]>;
  private _chartKpForecast27: Chart<ChartType, string[]>;
  private _chartKpDensity: Chart<ChartType, string[]>;
  private _chartKpSpeed: Chart<ChartType, string[]>;
  private _chartKpBz: Chart<ChartType, string[]>;
  private _chartKpBt: Chart<ChartType, string[]>;
  private _chartCycle: Chart<ChartType, string[]>;

  private _marker: Marker;
  private _coords: Coords = {} as any;
  private _map: Map;
  @ViewChild('map_canvas', { static: false }) mapElement: ElementRef;

  constructor(
    private _modalController: ModalController,
    private _storageService: StorageService,
    private _geoloc: Geolocation,
    private _translateService: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    this.minimapLocation(); // Here to reload map at each change of location

    if (changes?.kpForecast?.currentValue !== changes?.kpForecast?.previousValue) {
      const firstChange = changes?.kpForecast?.firstChange;
      this._chartNextHoursForecast(changes.kpForecast.currentValue, firstChange);
    }

    if (changes?.kpForecast27?.currentValue !== changes?.kpForecast27?.previousValue) {
      const firstChange = changes?.kpForecast27?.firstChange;
      this._chartForecast27day(changes.kpForecast27.currentValue, firstChange);
    }

    if (changes?.solarWind?.currentValue !== changes?.solarWind?.previousValue) {
      this._calculateDataForChartSolarWind(changes.solarWind.currentValue);
    }

    if (changes?.solarCycle?.currentValue !== changes?.solarCycle?.previousValue) {
      this._calculateDataForChartSolarCycle(changes.solarCycle.currentValue);
    }
  }

  /**
   *  Si la localisation n'a jamais été remplie, on set avec "currentLocation" && on localise l'utilisateur pour la minimap
   *  Sinon si la page a déjà été chargée une fois, on ne fait qu'ajouter un marker à la map
   * Sinon charge la map avec les lat/long envoyée depuis la page popup (Marker et Ville Préselectionnées)
   * */
  minimapLocation() {
    // localisation format json ? {code: 'currentlocation', lat: 41.1, long: 10.41} --> pas besoin de call à chaque fois lat et long comme ça...
    this._storageService.getData('location').then((codeLocation: CodeLocation) => {
      if (!codeLocation) {
        this._userLocalisation();
      } else {
        this._mapInit(codeLocation.lat, codeLocation.long);
      }
    });
  }

  /**
   * localise l'utilisateur et lance l'affichage de la map
   * */
  private _userLocalisation() {
    this._geoloc
      .getCurrentPosition()
      .then((resp: Geoposition) => {
        this._coords = resp.coords;
        this._mapInit(this._coords.latitude, this._coords.longitude);
        void this._storageService.setData('location', {
          code: 'currentLocation',
          lat: this._coords.latitude,
          long: this._coords.longitude,
        });
      })
      .catch(error => {
        console.warn('Error getting location', error);
      });
  }

  /**
   * @param lat
   * @param long
   * Création de la map
   * */
  private _mapInit(lat: any, long: any): void {
    if (!this._map) {
      this._map = new Map('map_canvas');
    }
    const mapOpt: ZoomPanOptions = {
      animate: true,
    };

    this._map.setView([lat, long], 4, mapOpt);
    this._addMarker(lat, long);

    this._map.dragging.disable();
    this._map.zoomControl.remove();
    this._map.attributionControl.remove();

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'map-filter',
    }).addTo(this._map);
  }

  /**
   * @param lat
   * @param long
   * Création d'un marker sur la map
   * */
  private _addMarker(lat: any, long: any) {
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
        northPole: 'https://v2.api.auroras.live/images/ovation-north.jpg',
        southPole: 'https://v2.api.auroras.live/images/ovation-south.jpg',
      },
    });
    return await modal.present();
  }

  private _chartNextHoursForecast(forecast: KpForecast[], firstChange = false): void {
    const nextHoursForecast = [];
    const nextHoursDate = [];
    const nextHoursColors = [];
    for (const unit of forecast) {
      if (nextHoursForecast.length < numberMaxNextHours) {
        nextHoursDate.push(moment(unit.timeTag).format('HH') + 'h');
        nextHoursForecast.push(unit.kpIndex);
        if (unit.kpIndex >= 6) {
          unit.color = AuroraEnumColours.red;
        }
        nextHoursColors.push(colorSwitcher(unit.color));
      }
    }
    if (firstChange) {
      // 14 values
      this._chartKpForecast = this._chartKp('kpnexthours', nextHoursDate, nextHoursForecast, nextHoursColors);
    } else {
      updateDataChart(this._chartKpForecast, nextHoursDate, [nextHoursForecast], nextHoursColors);
    }
  }

  private _chartForecast27day(forecast: Kp27day[], firstChange = false): void {
    const forecastValue = [];
    const forecastDate = [];
    const forecastColors = [];
    for (const [i, unit] of forecast.entries()) {
      // if (forecastValue.length < numberMax27Forecast && i % 2 === 0) {
      forecastDate.push(unit.timeTag);
      forecastValue.push(unit.kpIndex);
      if (unit.kpIndex >= 6) {
        unit.color = AuroraEnumColours.red;
      }
      forecastColors.push(colorSwitcher(unit.color));
      // }
    }

    if (firstChange) {
      // 14 values
      this._chartKpForecast27 = this._chartKp('kpforecast', forecastDate, forecastValue, forecastColors);
    } else {
      updateDataChart(this._chartKpForecast27, forecastDate, [forecastValue], forecastColors);
    }
  }

  private _chartKp(type: 'kpforecast' | 'kpnexthours', labels: string[], data: string[], colors: string[]): Chart<ChartType, string[]> {
    return new Chart(type, {
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
            color: WEATHER_NEXT_HOUR_CHART_COLOR,
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

  private _calculateDataForChartSolarWind(forecast: SolarWind[]): void {
    const bzForecast = [],
      speedForecast = [],
      btForecast = [],
      densityForecast = [],
      solarWindDate = [];

    for (const unit of forecast) {
      solarWindDate.push(manageDates(unit.time_tag, this.locale === ELocales.FR ? 'HH[h]mm' : 'hh:mm A'));

      densityForecast.push(unit.density);
      bzForecast.push(unit.bz);
      btForecast.push(unit.bt);
      speedForecast.push(convertUnitMeasure(unit.speed, this.measure));
    }

    this._chartKpDensity?.destroy();
    this._chartKpSpeed?.destroy();
    this._chartKpBz?.destroy();
    this._chartKpBt?.destroy();
    this._chartKpDensity = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.DENSITY, solarWindDate, densityForecast);
    this._chartKpSpeed = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.SPEED, solarWindDate, speedForecast, this.measure);
    this._chartKpBz = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.BZ, solarWindDate, bzForecast);
    this._chartKpBt = ForecastAuroralActivityComponent._chartSolarWind(SolarWindTypes.BT, solarWindDate, btForecast);
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
  private static _chartSolarWind(type: SolarWindTypes, labels: string[], data: number[], measure?: MeasureUnits): Chart<ChartType, string[]> {
    return new Chart(type, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: data as any[],
            backgroundColor: context => updateGradientBackgroundChart(context, type, data, measure),
            pointBackgroundColor: context => determineColorsOfValue(type, data[context.dataIndex], measure),
            borderColor: colorSwitcher(determineColorsOfValue(type, Math.max(...data), measure)),
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

  private _chartSolarCycle(labels: string[], dataSsn: string[], dataF10: string[], colorsSsn: string, colorsF10: string): Chart<ChartType, string[]> {
    return new Chart('cycle', {
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
