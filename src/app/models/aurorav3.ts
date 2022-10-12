import { Unit } from './weather';
import { AuroraEnumColours } from './aurorav2';

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

export interface Kp27day {
  value: number;
  color: AuroraEnumColours;
  date: Date;
}
