import type { OnChanges, SimpleChanges } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, Injector, input, signal } from '@angular/core';
import type { ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import moment from 'moment';
import type { Cloudy, Currently, Daily, DailyTemp, Hourly } from '../../models/weather';
import { HourClock, IconsOWM, LottiesValues, MeasureUnits, TemperatureUnits } from '../../models/weather';

import { DecimalPipe, NgOptimizedImage, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LottieComponent } from 'ngx-lottie';
import type { CityCoords } from '../../models/cities';
import { MAIN_TEXT_COLOR, WEATHER_NEXT_HOUR_CHART_COLOR } from '../../models/colors';
import { ELocales } from '../../models/locales';
import { convertUnitTemperature, manageDates } from '../../models/utils';
import { PlaceholderChartsComponent } from '../../shared/placeholders/placeholder-charts/placeholder-charts.component';
import { PlaceholderDataComponent } from '../../shared/placeholders/placeholder-data/placeholder-data.component';
import { CalculateUvPipe } from './calculate-uv.pipe';
import { CalculateWindDegPipe } from './calculate-wind-deg.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.component.html',
  styleUrl: './meteo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    DecimalPipe,
    TranslatePipe,
    CalculateWindDegPipe,
    PlaceholderDataComponent,
    PlaceholderChartsComponent,
    CalculateUvPipe,
    PercentPipe,
    NgOptimizedImage,
    LottieComponent,
  ],
})
export class MeteoComponent implements OnChanges {
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);

  readonly coords = input<CityCoords | null>(null);
  readonly currentWeather = input<Currently | null>(null);
  readonly displayWeather = signal<Currently | null>(null);
  readonly hourlyWeather = input<Hourly[]>([]);
  readonly sevenDayWeather = input<Daily[]>([]);

  readonly locale = input(ELocales.EN);
  readonly measure = input(MeasureUnits.METRIC);
  readonly temperature = input(TemperatureUnits.CELSIUS);

  readonly tzOffset = input(0);
  readonly hourClock = input(HourClock.TWENTYFOUR);

  readonly loading = input(false);

  sunset = '';
  sunrise = '';
  currentDatetime = '';
  measureUnits = MeasureUnits;
  temperatureUnits = TemperatureUnits;
  private _nextHoursChart?: Chart<ChartType, number[], string>;

  cloudy: Cloudy[] = [];
  days: Daily[] = [];

  todayTemp: DailyTemp | null = null;
  lottieConfig = {
    path: `assets/lotties/lottie-clear-day.json`,
    autoplay: true,
    loop: true,
  };
  readonly widthCurrent = 110;
  readonly heightCurrent = 110;
  readonly dataNumbersInChart = 8;

  constructor() {
    this._destroyRef.onDestroy(() => this._nextHoursChart?.destroy());
  }

  ngOnChanges(changes: SimpleChanges): void {
    afterNextRender(
      () => {
        const weather = this.currentWeather();
        if (weather && ['currentWeather', 'coords', 'temperature', 'locale', 'hourClock', 'tzOffset'].some(key => changes[key]))
          this._todayForecast(weather);
        if (this.hourlyWeather().length && ['hourlyWeather', 'temperature', 'locale', 'hourClock', 'tzOffset'].some(key => changes[key]))
          this._nextHoursForecast(this.hourlyWeather());
        if (this.sevenDayWeather().length && ['sevenDayWeather', 'temperature', 'locale', 'hourClock', 'tzOffset'].some(key => changes[key]))
          this._sevenDayForecast(this.sevenDayWeather());
        this._cdr.markForCheck();
      },
      { injector: this._injector },
    );
  }

  private _todayForecast(currentWeather: Currently): void {
    this.displayWeather.set({
      ...currentWeather,
      temp: convertUnitTemperature(currentWeather.temp, this.temperature()),
      feels_like: convertUnitTemperature(currentWeather.feels_like, this.temperature()),
    });

    if (currentWeather.sunset === currentWeather.sunrise) {
      const polar = this._nearestSolstice();
      this.sunrise = polar;
      this.sunset = polar;
    } else {
      this.sunrise = manageDates(
        currentWeather.sunrise,
        this.hourClock() === HourClock.TWELVE ? 'hh:mm A' : 'HH[h]mm',
        this.locale(),
        this.tzOffset(),
        true,
      );
      this.sunset = manageDates(
        currentWeather.sunset,
        this.hourClock() === HourClock.TWELVE ? 'hh:mm A' : 'HH[h]mm',
        this.locale(),
        this.tzOffset(),
        true,
      );
    }

    this._lotties(this._calculateWeaterIcons(currentWeather));

    this.currentDatetime = manageDates(
      moment().unix(),
      this.hourClock() === HourClock.TWELVE ? 'dddd Do of MMMM, hh:mm A' : 'dddd DD MMMM, HH[h]mm',
      this.locale(),
      this.tzOffset(),
      true,
    );
    this._cdr.markForCheck();
  }

  private _nearestSolstice(): 'night' | 'day' {
    const today = moment();
    const currentWinterSolstice = moment([today.year(), 11, 21]);
    const currentSummerSolstice = moment([today.year(), 5, 21]);
    const lastWinterSolstice = moment([today.year() - 1, 11, 21]);
    const lastSummerSolstice = moment([today.year() - 1, 5, 21]);

    // Comparaison des différences entre les dates
    const currentDiffs = [Math.abs(currentWinterSolstice.diff(today)), Math.abs(currentSummerSolstice.diff(today))];
    const previousDiffs = [Math.abs(lastWinterSolstice.diff(today)), Math.abs(lastSummerSolstice.diff(today))];

    // Trouver l'index de la différence minimale pour l'année en cours
    const closestCurrent = currentDiffs.indexOf(Math.min(...currentDiffs));
    // Trouver l'index de la différence minimale pour l'année précédente
    const closestPrevious = previousDiffs.indexOf(Math.min(...previousDiffs));

    // Comparer les deux années pour déterminer le résultat final
    if (currentDiffs[closestCurrent] < previousDiffs[closestPrevious]) {
      return closestCurrent === 0 ? 'night' : 'day';
      // return (indexPlusProcheActuel === 0) ? solsticeHiverActuel : solsticeEteActuel;
    } else {
      return closestPrevious === 0 ? 'night' : 'day';
      // return (indexPlusProchePrecedent === 0) ? solsticeHiverPrecedent : solsticeEtePrecedent;
    }
  }

  private _nextHoursForecast(hourly: Hourly[]): void {
    this._nextHoursChart?.destroy();
    this.cloudy = [];
    const temperaturesArr = [];
    const nextHoursArr = [];
    for (const [i, hours] of hourly.entries()) {
      const hourClock = this.hourClock();
      const locale = this.locale();
      const tzOffset = this.tzOffset();
      if (temperaturesArr.length < this.dataNumbersInChart && i % 2 === 0) {
        const temp = convertUnitTemperature(Math.round(hours.temp), this.temperature());
        temperaturesArr.push(temp);
        nextHoursArr.push(manageDates(hours.dt, hourClock === HourClock.TWELVE ? 'hh A' : 'HH[h]', locale, tzOffset));
      }
      const cloudy: Cloudy = {
        percent: hours.clouds,
        time: manageDates(hours.dt, hourClock === HourClock.TWELVE ? 'hh A' : 'HH[h]', locale, tzOffset),
      };
      if (this.cloudy.length < this.dataNumbersInChart) {
        this.cloudy.push(cloudy);
      }
    }
    this._nextHoursChart = new Chart<ChartType, number[], string>('next-hours', {
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
        layout: {
          padding: {
            top: 30,
          },
        },
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
              font: () => ({ family: 'Oswald-SemiBold' }),
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

  private _sevenDayForecast(sevenDayWeather: Daily[]): void {
    this.days = [];
    sevenDayWeather.forEach((day: Daily, index) => {
      if (index === 0) {
        this.todayTemp = {
          ...day.temp,
          max: convertUnitTemperature(day.temp.max, this.temperature()),
          min: convertUnitTemperature(day.temp.min, this.temperature()),
        };
      } else {
        this.days.push({
          ...day,
          date: manageDates(day.dt, 'ddd DD', this.locale(), this.tzOffset()),
          temp: {
            ...day.temp,
            max: convertUnitTemperature(day.temp.max, this.temperature()),
            min: convertUnitTemperature(day.temp.min, this.temperature()),
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
    return LottiesValues.CLEAR_DAY;
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
      autoplay: true,
      loop: true,
    };
  }

  splitDate(date: string | moment.Moment | null | undefined): string {
    let splittedDate: string[];
    // On rentre 100% du temps dans cette condition
    if (typeof date === 'string') {
      splittedDate = date.split(' ');
      const weekDay = splittedDate[0];
      const dayDate = splittedDate[1];
      return weekDay + '<br>' + dayDate;
    }
    return '';
  }
}
