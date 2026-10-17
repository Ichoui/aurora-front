import type { KpCurrent, KpForecast, SolarCycle, SolarWind } from './aurorav3';
import type { CityCoords } from './cities';
import type { ELocales } from './locales';
import type { Currently, Daily, HourClock, Hourly, MeasureUnits, TemperatureUnits } from './weather';

export interface CachedWeather {
  dataCurrentWeather: Currently;
  dataHourly: Hourly[];
  dataSevenDay: Daily[];
  city: string;
  country: string;
  date: Date | string;
  timezoneOffset: number;
}

export interface StorageSchema {
  location: CityCoords;
  previousLocation: CityCoords;
  weather: CachedWeather;
  locale: ELocales;
  measure: MeasureUnits;
  temperature: TemperatureUnits;
  clock: HourClock;
  ACEdate: Date | string;
  solarCycle: SolarCycle[];
  solarWind: SolarWind[];
  kpForecast: KpForecast[];
  kp27day: string;
  nowcastAurora: number;
  kpCurrent: KpCurrent;
}
