import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../../shared/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import * as Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Kp27day, KpForecast } from '../../models/aurorav2';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import 'moment/locale/fr';

const numberMax27Forecast = 14;
const numberMaxNextHours = 10;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements OnInit {
  kpForecast$ = new BehaviorSubject<KpForecast[]>(null);
  kpForecast27$ = new BehaviorSubject<Kp27day[]>(null);

  @Input()
  set kpForecastInput(value: KpForecast[]) {
    this.kpForecast$.next(value);
  }

  get kpForecastInput() {
    return this.kpForecast$.getValue();
  }

  @Input()
  set kpForecast27Input(value: Kp27day[]) {
    this.kpForecast27$.next(value);
  }

  get kpForecast27Input() {
    return this.kpForecast27$.getValue();
  }

  constructor(private modalController: ModalController, private translateService: TranslateService) {}

  ngOnInit() {
    this.chartNextHoursForecast();
    this.chartForecast27day();
  }

  async showMap() {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        map: 'https://v2.api.auroras.live/images/embed/nowcast.png',
        titleMap: this.translateService.instant('tab2.maps.worldmap'),
      },
    });
    return await modal.present();
  }

  async showOvations() {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        ovation1: 'https://v2.api.auroras.live/images/ovation-north.jpg',
        ovationTitle1: this.translateService.instant('tab2.maps.ovation.north'),
        ovation2: 'https://v2.api.auroras.live/images/ovation-south.jpg',
        ovationTitle2: this.translateService.instant('tab2.maps.ovation.south'),
      },
    });
    return await modal.present();
  }

  chartNextHoursForecast(): void {
    const nextHoursForecast = [];
    const nextHoursDate = [];
    const nextHoursColors = [];
    this.kpForecast$.subscribe(res => {
      let i = 0;
      res.forEach(unit => {
        if (nextHoursForecast.length < numberMaxNextHours) {
          nextHoursDate.push(moment(unit.date).format('HH:mm'));
          nextHoursForecast.push(unit.value);
          nextHoursColors.push(this.colorSwitcher(unit.color));
        }
        i++;
      });
    });
    // TODO ici et en bas
    // 14 values
    // new Chart('kpnexthours', {
    //   type: 'bar',
    //   plugins: [ChartDataLabels],
    //   data: {
    //     labels: nextHoursDate,
    //     datasets: [
    //       {
    //         data: nextHoursForecast,
    //         backgroundColor: nextHoursColors,
    //         borderColor: nextHoursColors,
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    //   options: {
    //     responsive: true,
    //     plugins: {
    //       datalabels: {
    //         anchor: 'end',
    //         align: 'end',
    //         color: '#8cffea',
    //         font: {
    //           family: 'Oswald-SemiBold',
    //           size: 15,
    //         },
    //       },
    //     },
    //     legend: {
    //       display: false,
    //     },
    //     scales: {
    //       xAxes: [
    //         {
    //           gridLines: {
    //             display: false,
    //           },
    //           ticks: {
    //             fontColor: '#949494',
    //             fontFamily: 'Oswald-SemiBold',
    //           },
    //         },
    //       ],
    //       yAxes: [
    //         {
    //           display: false,
    //           ticks: {
    //             min: 0,
    //           },
    //           gridLines: {
    //             display: false,
    //           },
    //         },
    //       ],
    //     },
    //     layout: {
    //       padding: {
    //         top: 30,
    //       },
    //     },
    //     tooltips: {
    //       enabled: false,
    //     },
    //   },
    // });
  }

  chartForecast27day(): void {
    const forecastValue = [];
    const forecastDate = [];
    const forecastColors = [];
    this.kpForecast27$.subscribe(res => {
      let i = 0;
      res.forEach(unit => {
        if (forecastValue.length < numberMax27Forecast && i % 2 === 0) {
          forecastDate.push(moment(unit.date).format('DD/MM'));
          forecastValue.push(unit.value);
          forecastColors.push(this.colorSwitcher(unit.color));
        }
        i++;
      });
    });
    // 14 values
    // new Chart('kpforecast', {
    //   type: 'bar',
    //   plugins: [ChartDataLabels],
    //   data: {
    //     labels: forecastDate,
    //     datasets: [
    //       {
    //         data: forecastValue,
    //         backgroundColor: forecastColors,
    //         borderColor: forecastColors,
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    //   options: {
    //     responsive: true,
    //     plugins: {
    //       datalabels: {
    //         anchor: 'end',
    //         align: 'end',
    //         color: '#8cffea',
    //         font: {
    //           family: 'Oswald-SemiBold',
    //           size: 15,
    //         },
    //       },
    //     },
    //     legend: {
    //       display: false,
    //     },
    //     scales: {
    //       xAxes: [
    //         {
    //           gridLines: {
    //             display: false,
    //           },
    //           ticks: {
    //             fontColor: '#949494',
    //             fontFamily: 'Oswald-SemiBold',
    //           },
    //         },
    //       ],
    //       yAxes: [
    //         {
    //           display: false,
    //           ticks: {
    //             min: 0,
    //           },
    //           gridLines: {
    //             display: false,
    //           },
    //         },
    //       ],
    //     },
    //     layout: {
    //       padding: {
    //         top: 30,
    //       },
    //     },
    //     tooltips: {
    //       enabled: false,
    //     },
    //   },
    // });
  }

  colorSwitcher(color): string {
    switch (color) {
      case 'green':
        color = '#2cc990';
        break;
      case 'yellow':
        color = '#eee657';
        break;
      case 'orange':
        color = '#fcb941';
        break;
      case 'red':
        color = '#fc6042';
        break;
    }
    return color;
  }
}
