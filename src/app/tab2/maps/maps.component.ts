import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AuroraEnumColours, Kp27day, KpForecast } from '../../models/aurorav2';
import * as moment from 'moment';
import { colorSwitcher } from '../../models/utils';
// import 'moment/locale/fr';

const numberMax27Forecast = 14;
const numberMaxNextHours = 10;
Chart.register(...registerables);

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements OnChanges {
  @Input() kpForecast: KpForecast[];
  @Input() kpForecast27: Kp27day[];

  chartKpForecast: Chart;
  chartKpForecast27: Chart;

  constructor(private modalController: ModalController, private translateService: TranslateService) {}

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

  async showMap(): Promise<void> {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        map: 'https://v2.api.auroras.live/images/embed/nowcast.png',
      },
    });
    return await modal.present();
  }

  async showPoles(): Promise<void> {
    const modal = await this.modalController.create({
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
            color: '#8cffea',
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
              color: '#949494',
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
            color: '#8cffea',
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
              color: '#949494',
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
