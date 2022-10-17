import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import { colorSwitcher, determineColorsOfValue } from '../../models/utils';
import { MAIN_TEXT_COLOR, WEATHER_NEXT_HOUR_CHART_COLOR } from '../../models/colors';
import { CodeLocation, Coords } from '../../models/cities';
import { StorageService } from '../../storage.service';
import { Geoposition } from '@ionic-native/geolocation';
import { icon, Map, Marker, marker, tileLayer, ZoomPanOptions } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AuroraEnumColours, Kp27day, KpForecast, SolarWind } from '../../models/aurorav3';
import { OnViewWillEnter } from '../../models/ionic';
import { ELocales } from '../../models/locales';
import { Unit } from '../../models/weather';
// import 'moment/locale/fr';

const numberMax27Forecast = 14;
const numberMaxNextHours = 10;
Chart.register(...registerables);

@Component({
  selector: 'app-aurora-data-forecast',
  templateUrl: './aurora-data-forecast.component.html',
  styleUrls: ['./aurora-data-forecast.component.scss'],
})
export class AuroraDataForecastComponent implements OnChanges, OnInit, OnViewWillEnter {
  @Input() kpForecast: KpForecast[];
  @Input() kpForecast27: Kp27day[];
  @Input() solarWind: SolarWind[];
  @Input() unit: Unit;

  chartKpForecast: Chart;
  chartKpForecast27: Chart;
  chartKpDensity: Chart;
  chartKpSpeed: Chart;
  chartKpBz: Chart;
  chartKpBt: Chart;

  private _locale: ELocales;
  private _marker: Marker;
  private _coords: Coords = {} as any;
  private _map: Map;
  @ViewChild('map_canvas', { static: false }) mapElement: ElementRef;

  constructor(
    private _modalController: ModalController,
    private _storageService: StorageService,
    private _geoloc: Geolocation,
  ) {}

  ngOnInit(): void {
    this.minimapLocation();
    this._storageService.getData('locale').then((l: ELocales) => (this._locale = l));
    console.log('ef');
  }

  /**
   * Invoqué à chaque retour sur la page
   * */
  ionViewWillEnter() {
    this.minimapLocation();
    console.log('ef');
    // TODO on rentre pas ici wtf ça recharge pas le pin de la map !
  }

  ngOnChanges(changes: SimpleChanges) {
    this.chartKpForecast?.destroy();
    this.chartKpForecast27?.destroy();
    this.chartKpDensity?.destroy();
    this.chartKpSpeed?.destroy();
    this.chartKpBz?.destroy();
    this.chartKpBt?.destroy();

    if (changes?.kpForecast?.currentValue !== changes?.kpForecast?.previousValue) {
      this._chartNextHoursForecast(changes.kpForecast.currentValue);
    }

    if (changes?.kpForecast27?.currentValue !== changes?.kpForecast27?.previousValue) {
      this._chartForecast27day(changes.kpForecast27.currentValue);
    }
    if (changes?.solarWind?.currentValue !== changes?.solarWind?.previousValue) {
      const firstChange = changes?.solarWind?.firstChange;
      this._calculateDataForChartSolarWind(changes.solarWind.currentValue, firstChange);
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
    if (this._map) {
      this._map.remove();
    }
    const mapOpt: ZoomPanOptions = {
      noMoveStart: false,
      animate: false,
    };

    this._map = new Map('map_canvas').setView([lat, long], 4, mapOpt);

    this._addMarker(lat, long);

    this._map.dragging.disable();
    this._map.zoomControl.remove();

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        ' <div style="font-size: 12px; text-align:right;">&copy;<a href="https://www.openstreetmap.org/copyright">OSM</a></div>',
    }).addTo(this._map);
  }

  /**
   * @param lat
   * @param long
   * Création d'un marker sur la map
   * */
  private _addMarker(lat: any, long: any) {
    if (this._marker) {
      this._marker.remove();
    }
    this._marker = marker([lat, long], {
      icon: icon({
        iconSize: [25, 25],
        iconUrl: 'assets/img/marker-icon.png',
      }),
    }).addTo(this._map);
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

  private _chartNextHoursForecast(forecast: KpForecast[]): void {
    const nextHoursForecast = [];
    const nextHoursDate = [];
    const nextHoursColors = [];
    for (const unit of forecast) {
      if (nextHoursForecast.length < numberMaxNextHours) {
        nextHoursDate.push(moment(unit.date).format('HH') + 'h');
        nextHoursForecast.push(unit.value);
        if (unit.value >= 6) {
          unit.color = AuroraEnumColours.red;
        }
        nextHoursColors.push(colorSwitcher(unit.color));
      }
    }
    // 14 values
    this.chartKpForecast = new Chart('kpnexthours', {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: nextHoursDate,
        datasets: [
          {
            data: nextHoursForecast,
            backgroundColor: nextHoursColors,
            borderColor: nextHoursColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: WEATHER_NEXT_HOUR_CHART_COLOR,
            font: {
              family: 'Oswald-SemiBold',
              size: 15,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: MAIN_TEXT_COLOR,
              font: (ctx, options) => ({ family: 'Oswald-SemiBold' }),
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
          padding: {
            top: 30,
          },
        },
      },
    });
  }

  private _chartForecast27day(forecast: Kp27day[]): void {
    const forecastValue = [];
    const forecastDate = [];
    const forecastColors = [];
    for (const [i, unit] of forecast.entries()) {
      if (forecastValue.length < numberMax27Forecast && i % 2 === 0) {
        forecastDate.push(moment(unit.date).format('DD/MM'));
        forecastValue.push(unit.value);
        if (unit.value >= 6) {
          unit.color = AuroraEnumColours.red;
        }
        forecastColors.push(colorSwitcher(unit.color));
      }
    }
    // 14 values
    this.chartKpForecast27 = new Chart('kpforecast', {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: forecastDate,
        datasets: [
          {
            data: forecastValue,
            backgroundColor: forecastColors,
            borderColor: forecastColors,
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
              size: 15,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: MAIN_TEXT_COLOR,
              font: (ctx, options) => ({ family: 'Oswald-SemiBold' }),
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
          padding: {
            top: 30,
          },
        },
      },
    });
  }

  private _calculateDataForChartSolarWind(forecast: SolarWind[], firstChange: boolean): void {
    const bzForecast = {
      value: [],
      color: [],
    };
    const btForecast = {
      value: [],
      color: [],
    };
    const densityForecast = {
      value: [],
      color: [],
    };
    const speedForecast = {
      value: [],
      color: [],
    };
    const solarWindDate = [];

    console.log(forecast);
    for (const [i, unit] of forecast.entries()) {
      if (i % 5 === 0) {
        if (i % 2 === 0) {
          solarWindDate.push(moment(unit.propagated_time_tag).format(this._locale === ELocales.FR ? 'HH:mm' : 'hh:mm'));
        }
        densityForecast.value.push(unit.density);
        densityForecast.color.push(colorSwitcher(determineColorsOfValue('density', unit.density)));

        bzForecast.value.push(unit.bz);
        bzForecast.color.push(colorSwitcher(determineColorsOfValue('bz', unit.bz)));
        console.log(unit.bz);
        console.log(bzForecast);

        btForecast.value.push(unit.bt);
        btForecast.color.push(colorSwitcher(determineColorsOfValue('bt', unit.bt)));

        speedForecast.value.push(unit.speed);
        speedForecast.color.push(colorSwitcher(determineColorsOfValue('speed', unit.speed, this.unit)));

      }
    }

    console.log(solarWindDate);
    console.log(densityForecast);

    if (firstChange) {
      this.chartKpDensity = this._chartSolarWind(
        'density',
        solarWindDate,
        densityForecast.value,
        densityForecast.color,
      );
      this.chartKpSpeed = this._chartSolarWind('speed', solarWindDate, speedForecast.value, speedForecast.color);
      this.chartKpBz = this._chartSolarWind('bz', solarWindDate, bzForecast.value, bzForecast.color);
      this.chartKpBt = this._chartSolarWind('bt', solarWindDate, btForecast.value, btForecast.color);
    } else {
      // Update data only !
    }
  }

  private _chartSolarWind(
    type: 'bz' | 'bt' | 'speed' | 'density',
    labels: string[],
    data: string[],
    colors: string[],
  ): any {
    console.log(colors);
    return new Chart(type, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
            pointBorderWidth: 3,
            pointHitRadius: 10,
            pointHoverBackgroundColor: WEATHER_NEXT_HOUR_CHART_COLOR,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          datalabels: {
            align: 'end',
            color: WEATHER_NEXT_HOUR_CHART_COLOR,
            font: {
              family: 'Oswald-SemiBold',
              size: 15,
            },
            formatter(value) {
              return value + '°';
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: MAIN_TEXT_COLOR,
              font: (ctx, options) => ({ family: 'Oswald-SemiBold' }),
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
        layout: {
          padding: {
            top: 30,
          },
        },
      },
    });
  }
}
