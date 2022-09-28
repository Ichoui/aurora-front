import { Moment } from 'moment';
import { SelectContents } from './locales';

// https://openweathermap.org/api/one-call-api

export interface Weather {
  lat: number;
  long: number;
  timezone: string;
  timezone_offset: number;
  current: Currently;
  minutely: Minutely[];
  hourly: Hourly[];
  daily: Daily[];
}

export interface Currently {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherIcon[];
  rain: RainOneHour;
}

export interface WeatherIcon {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface RainOneHour {
  ['1h']: number;
}

export interface Minutely {
  dt: number;
  precipitation: number;
}

export interface Hourly {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherIcon[];
  pop: number;
  rain: RainOneHour;
}

export interface Daily {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: DailyTemp;
  feels_like: DailyFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherIcon[];
  clouds: number;
  pop: number;
  rain: number;
  uvi: number;
  date: string | Moment; // not from API
}

export interface DailyTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}
export interface DailyFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

// Ennuagement
export interface Cloudy {
  percent?: number;
  time?: string | Moment;
}

export enum IconsOWM {
  THUNDERSTORM = 'Thunderstorm',
  DRIZZLE = 'Drizzle',
  RAIN = 'Rain',
  SNOW = 'Snow',
  MIST = 'Mist',
  SMOKE = 'Smoke',
  HAZE = 'Haze',
  DUST = 'Dust',
  FOG = 'Fog',
  SAND = 'Sand',
  ASH = 'Ash',
  SQUALL = 'Squall',
  TORNADO = 'Tornado',
  CLEAR = 'Clear',
  CLOUDS = 'Clouds',
}

export enum LottiesValues {
  RAIN = 'rain',
  WIND = 'wind',
  THUNDERSTORM = 'thunderstorm',
  SNOW = 'snow',
  CLEAR_DAY = 'clear-day',
  CLEAR_NIGHT = 'clear-night',
  VERY_CLOUDY = 'very-cloudy',
  PARTLY_CLOUDY_DAY = 'partly-cloudy-day',
  CLOUDY_DAY = 'cloudy-day',
  PARTLY_CLOUDY_NIGHT = 'partly-cloudy-night',
  CLOUDY_NIGHT = 'cloudy-night',
  RAIN_NIGHT = 'rainly-night'
}

export enum ExcludeType {
  MINUTELY = 'minutely',
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export enum Unit {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
  KELVIN = 'kelvin',
}

export const units: SelectContents[] = [
  {
    slug: 'metric',
    label: 'tab3.settings.metric'
  },
  {
    slug: 'imperial',
    label: 'tab3.settings.imperial'
  },
  {
    slug: 'kelvin',
    label: 'tab3.settings.kelvin'
  },
];
