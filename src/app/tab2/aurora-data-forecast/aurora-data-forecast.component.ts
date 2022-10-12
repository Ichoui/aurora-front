import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AuroraEnumColours, KpForecast } from '../../models/aurorav2';
import * as moment from 'moment';
import { colorSwitcher } from '../../models/utils';
import { MAIN_TEXT_COLOR, WEATHER_NEXT_HOUR_CHART_COLOR } from '../../models/colors';
import { CodeLocation, Coords } from '../../models/cities';
import { StorageService } from '../../storage.service';
import { Geoposition } from '@ionic-native/geolocation';
import { icon, Map, Marker, marker, tileLayer, ZoomPanOptions } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Kp27day } from '../../models/aurorav3';
import { OnViewWillEnter } from '../../models/ionic';
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

  chartKpForecast: Chart;
  chartKpForecast27: Chart;

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
    if (changes?.kpForecast?.currentValue !== changes?.kpForecast?.previousValue) {
      this._chartNextHoursForecast(changes.kpForecast.currentValue);
    }

    if (changes?.kpForecast27?.currentValue !== changes?.kpForecast27?.previousValue) {
      this._chartForecast27day(changes.kpForecast27.currentValue);
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
    let i = 0;
    forecast.forEach(unit => {
      if (nextHoursForecast.length < numberMaxNextHours) {
        nextHoursDate.push(moment(unit.date).format('HH:mm'));
        nextHoursForecast.push(unit.value);
        if (unit.value >= 6) {
          unit.color = AuroraEnumColours.red;
        }
        nextHoursColors.push(colorSwitcher(unit.color));
      }
      i++;
    });
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
    let i = 0;
    forecast.forEach(unit => {
      if (forecastValue.length < numberMax27Forecast && i % 2 === 0) {
        forecastDate.push(moment(unit.date).format('DD/MM'));
        forecastValue.push(unit.value);
        if (unit.value >= 6) {
          unit.color = AuroraEnumColours.red;
        }
        forecastColors.push(colorSwitcher(unit.color));
      }
      i++;
    });
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
}
