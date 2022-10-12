import { Unit } from './weather';
import { AuroraEnumColours } from './aurorav2';

export interface SolarWind {
  time_tag?: string;
  speed?: number;
  density?: number;
  temperature?: number;
  bx?: number;
  by?: number;
  bz?: number;
  bt?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  propagated_time_tag?: string;
}

export interface Speed {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  time_tag: Date;
  unit?: Unit; // Ajouté à la main par nécessité pour mph ou km/h
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
