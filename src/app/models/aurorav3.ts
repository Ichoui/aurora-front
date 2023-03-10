import { MeasureUnits } from './weather';

export interface SolarWind {
  time_tag?: string;
  speed?: number;
  density?: number;
  bz?: number;
  bt?: number;
  propagated_time_tag?: string;
}

export enum AuroraEnumColours {
  green = 'green',
  yellow = 'yellow',
  orange = 'orange',
  red = 'red',
}

export interface Speed {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  time_tag: Date;
  unit?: MeasureUnits; // Ajouté à la main par nécessité pour mph ou km/h
}

export interface Density {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  time_tag: Date;
}

export interface Bz {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  time_tag: Date;
}
export interface Bt {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  request_date: Date;
}

export interface Kp27day {
  value: number;
  color: AuroraEnumColours;
  date: Date;
}

export interface KpForecast {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  predicted: 'predicted' | 'estimated' | 'observed';
}

export interface SolarCycle {
  timeTag: string; // "2022-04"
  predictedSsn: number;
  predictedSolarFlux: number;
}

export interface KpCurrent {
  time_tag: string; // 2022-11-21T21:30:00 UTC
  k_index: number;
  color?: AuroraEnumColours; // Set in client side base on kpIndex value
}

export interface SwpcData {
  forecastSolarCycle: SolarCycle[],
  forecastSolarWind: SolarWind[],
  forecastKp: KpForecast[],
  forecastTwentySevenDays: string,
  instantKp: KpCurrent,
  nowcast: number;
}
