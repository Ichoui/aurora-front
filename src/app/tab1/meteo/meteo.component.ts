import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Coords} from '../../models/cities';
import * as moment from 'moment';
import {
  Cloudy,
  Currently,
  Daily,
  DailyTemp,
  Hourly,
  IconsOWM,
  LottiesValues,
  MeasureUnits,
  TemperatureUnits
} from '../../models/weather';
import {Chart, registerables} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {AnimationOptions} from 'ngx-lottie';
import {ELocales} from '../../models/locales';
import {StorageService} from '../../storage.service';
import {MAIN_TEXT_COLOR, WEATHER_NEXT_HOUR_CHART_COLOR} from '../../models/colors';
import {convertUnitTemperature, manageDates} from '../../models/utils';

Chart.register(...registerables);

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.component.html',
  styleUrls: ['./meteo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeteoComponent implements OnChanges {
  @Input() coords: Coords;
  @Input() currentWeather: Currently;
  @Input() hourlyWeather: Hourly[];
  @Input() sevenDayWeather: Daily[];

  @Input() locale: ELocales;
  @Input() measure: MeasureUnits;
  @Input() temperature: TemperatureUnits;

  @Input() loading = false;

  sunset: string | moment.Moment;
  sunrise: string | moment.Moment;
  currentDatetime: string | moment.Moment;
  measureUnits = MeasureUnits;
  temperatureUnits = TemperatureUnits;
  private _nextHoursChart: Chart;

  cloudy: Cloudy[] = [];
  days: Daily[] = [];

  todayTemp: DailyTemp;
  lottieConfig: AnimationOptions = {
    path: `assets/lotties/lottie-clear-day.json`,
    renderer: 'svg',
    autoplay: true,
    loop: true,
  };
  readonly widthCurrent = 110;
  readonly heightCurrent = 110;

  readonly dataNumbersInChart = 8;
  constructor(private _storageService: StorageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this._nextHoursChart?.destroy();
    if (changes?.currentWeather?.currentValue !== changes?.currentWeather?.previousValue) {
      this._todayForecast(changes.currentWeather.currentValue);
    }
    if (changes?.hourlyWeather?.currentValue !== changes?.hourlyWeather?.previousValue) {
      this._nextHoursForecast(changes.hourlyWeather.currentValue);
    }
    if (changes?.sevenDayWeather?.currentValue !== changes?.sevenDayWeather?.previousValue) {
      this._sevenDayForecast(changes.sevenDayWeather.currentValue);
    }
  }

  private _todayForecast(currentWeather: Currently) {
    this.currentWeather = {
      ...currentWeather,
      temp: convertUnitTemperature(currentWeather.temp, this.temperature),
      feels_like: convertUnitTemperature(currentWeather.feels_like, this.temperature),
    };
    this.sunset = manageDates(currentWeather.sunset, this.locale === ELocales.EN ? 'hh:mm A' : 'HH[h]mm', this.locale, true);
    this.sunrise = manageDates(currentWeather.sunrise, this.locale === ELocales.EN ? 'hh:mm A' : 'HH[h]mm', this.locale, true);
    this._lotties(this._calculateWeaterIcons(currentWeather));
    this.currentDatetime = manageDates(
      moment().unix(),
      this.locale === ELocales.EN ? 'dddd Do of MMMM, hh:mm A' : 'dddd DD MMMM, HH[h]mm',
      this.locale,
      true,
    );
  }

  private _nextHoursForecast(hourly: Hourly[]) {
    this.cloudy = [];
    let temperaturesArr = [];
    let nextHoursArr = [];
    for (const [i, hours] of hourly.entries()) {
      if (temperaturesArr.length < this.dataNumbersInChart && i % 2 === 0) {
        const temp = convertUnitTemperature(Math.round(hours.temp), this.temperature);
        temperaturesArr.push(temp);
        nextHoursArr.push(manageDates(hours.dt, this.locale === ELocales.EN ? 'hh A' : 'HH[h]', this.locale, true));
      }
      const cloudy: Cloudy = {
        percent: hours.clouds,
        time: manageDates(hours.dt, this.locale === ELocales.EN ? 'hh A' : 'HH[h]', this.locale, true),
      };
      if (this.cloudy.length < this.dataNumbersInChart) {
        this.cloudy.push(cloudy);
      }
    }
    this._nextHoursChart = new Chart('next-hours', {
      type: 'line',
      plugins: [ChartDataLabels],
      data: {
        labels: nextHoursArr,
        datasets: [
          {
            data: temperaturesArr,
            backgroundColor: [
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
            ],
            borderColor: [
              'rgba(140, 255, 234, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
              'rgba(105, 191, 175, 0.4)',
            ],
            borderWidth: 2,
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
            display: false,
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private _sevenDayForecast(sevenDayWeather: Daily[]) {
    this.days = [];
    sevenDayWeather.forEach((day: Daily, index) => {
      if (index === 0) {
        this.todayTemp = {
          ...day.temp,
          max: convertUnitTemperature(day.temp.max, this.temperature),
          min: convertUnitTemperature(day.temp.min, this.temperature),
        };
      } else {
        this.days.push({
          ...day,
          date: manageDates(day.dt, 'ddd', this.locale, true),
          temp: {
            ...day.temp,
            max: convertUnitTemperature(day.temp.max, this.temperature),
            min: convertUnitTemperature(day.temp.min, this.temperature),
          },
        });
      }
    });
  }

  /**
   * @param currentWeather {Currently}
   * Permet de calculer le lottie à afficher. Comporte des cas regroupés ou cas particulier
   * https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
   * */
  private _calculateWeaterIcons(currentWeather: Currently): LottiesValues {
    const mainIcon = currentWeather.weather[0].main;
    const idIcon = currentWeather.weather[0].id;
    const icon = currentWeather.weather[0].icon;

    let journey,
      night = false;

    if (icon.slice(-1) === 'd') {
      journey = true;
    } else if (icon.slice(-1) === 'n') {
      night = true;
    }

    switch (mainIcon) {
      case IconsOWM.DRIZZLE:
      case IconsOWM.RAIN:
        if (night) {
          return LottiesValues.RAIN_NIGHT;
        }
        return LottiesValues.RAIN;

      case IconsOWM.CLEAR:
        if (currentWeather.wind_speed >= 50) {
          return LottiesValues.WIND;
        } else {
          if (journey) {
            return LottiesValues.CLEAR_DAY;
          }

          if (night) {
            return LottiesValues.CLEAR_NIGHT;
          }
        }
        break;

      case IconsOWM.CLOUDS:
        if (idIcon === 804) {
          return LottiesValues.VERY_CLOUDY;
        }
        if (journey) {
          if (idIcon === 803) {
            return LottiesValues.PARTLY_CLOUDY_DAY;
          } else {
            return LottiesValues.CLOUDY_DAY;
          }
        }
        if (night) {
          if (idIcon === 803) {
            return LottiesValues.PARTLY_CLOUDY_NIGHT;
          } else {
            return LottiesValues.CLOUDY_NIGHT;
          }
        }
        break;

      case IconsOWM.THUNDERSTORM:
        return LottiesValues.THUNDERSTORM;

      case IconsOWM.SNOW:
        return LottiesValues.SNOW;

      default:
        if (journey) {
          return LottiesValues.CLEAR_DAY;
        }
        if (night) {
          return LottiesValues.CLEAR_NIGHT;
        }
    }
  }

  /**
  http://www.toujourspret.com/techniques/orientation/topographie/rose_vents1.gif
    */
  calculateWindDeg(deg: number): string {
    if (deg >= 337.5 && deg < 22.5) {
      return 'N';
    } else if (deg >= 22.5 && deg < 67.5) {
      return 'NE';
    } else if (deg >= 67.5 && deg < 112.5) {
      return 'E';
    } else if (deg >= 112.5 && deg < 157.5) {
      return 'SE';
    } else if (deg >= 157.5 && deg < 202.5) {
      return 'S';
    } else if (deg >= 202.5 && deg < 247.5) {
      return this.locale === ELocales.FR ? 'SO' : 'SW';
    } else if (deg >= 247.5 && deg < 292.5) {
      return this.locale === ELocales.FR ? 'O' : 'W';
    } else if (deg >= 292.5 && deg < 337.5) {
      return this.locale === ELocales.FR ? 'NO' : 'NW';
    }
  }

  calculateUV(indexUv): string {
    if (indexUv >= 0 && indexUv < 3) {
      return this.locale === ELocales.FR ? 'Faible' : 'Low';
    } else if (indexUv >= 3 && indexUv < 6) {
      return this.locale === ELocales.FR ? 'Modéré' : 'Moderate';
    } else if (indexUv >= 6 && indexUv < 8) {
      return this.locale === ELocales.FR ? 'Élevé' : 'High';
    } else if (indexUv >= 8 && indexUv < 11) {
      return this.locale === ELocales.FR ? 'Très élevé' : 'Very high';
    } else if (indexUv >= 11) {
      return this.locale === ELocales.FR ? 'Extrême' : 'Extreme';
    }
  }

  private _lotties(icon: LottiesValues): void {
    // if (icon === 'fog' || icon === 'snow' || icon === 'wind') {
    // not used atm, keep for sevenDays lotties evol
    //   this.widthCurrent = this.heightCurrent = 65;
    //   this.width7Fcst = this.height7Fcst = 35;
    // }

    this.lottieConfig = {
      path: `assets/lotties/lottie-${icon}.json`,
      // path: `assets/lotties/lottie-very-cloudy-night.json`,
      renderer: 'svg',
      autoplay: true,
      loop: true,
    };
  }
}
