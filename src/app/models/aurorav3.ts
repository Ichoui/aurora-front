import { MeasureUnits } from './weather';

export interface SolarWind {
  time_tag?: string;
  speed?: number;
  density?: number;
  bz?: number;
  bt?: number;
  propagated_time_tag?: string;
  temperature?: number; // not used
  bx?: number; // Not used
  by?: number; // Not used
  vx?: number; // Not used
  vy?: number; // Not used
  vz?: number; // Not used
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
  'time-tag': string; // "2022-04"
  predicted_ssn: number;
  high_ssn: number;
  low_ssn: number;
  'predicted_f10.7': number;
  'high_f10.7': number;
  'low_f10.7': number;
}
