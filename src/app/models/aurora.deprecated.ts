// Données sur le vent solaire
import { AuroraEnumColours } from './aurorav2';

// FIRST VERSION Aurora.live
export interface SolarWind {
  date: string;
  bz: number;
  density: number;
  speed: number;
  kp1hour: number;
  kp4hour: number;
  kp: number;
  colour: AuroraColours;
  message: string[];
}

export interface AuroraColours {
  bz: string;
  density: string;
  speed: string;
  kp1hour: string;
  kp4hour: string;
  kp: string;
}

// Probabilité de voir une aurora au Zénith
export interface AuroraZenith {
  date: string;
  calculated: Calculated;
  colour: AuroraEnumColours;
  lat: string;
  long: string;
  value: string; // to number
  message: string[];
}

export interface Calculated {
  lat: string;
  long: string;
  value: string; // to number
  colour: string;
}

/*
 * Paramètres obligatoire & facultatif
 **/
export interface ParamsACE {
  type: string;
  data: DataACE;
  lat?: number;
  long?: number;
}

export enum DataACE {
  bz = 'bz',
  speed = 'speed',
  density = 'density',
  kp = 'kp',
  kp1minute = 'kp1minute',
  threeday = 'threeday',
  twentysevenday = 'twentysevenday',
  probability = 'probability',
  all = 'all',
}
