import { Bt, Bz, Density, Kp27day, Speed } from './aurorav3';

export interface Aurora {
  modules: AuroraModules[];
  common: {
    lat: number;
    long: number;
  };
}

export enum AuroraModules {
  common = 'common',
  nowcastlocal = 'nowcast:local',
  nowcasthighest = 'nowcast:highest',
  kpcurrent = 'kp:current',
  kp3hour = 'kp:kp3hour',
  kp3day = 'kp:kp3day',
  kp27day = 'kp:27day',
  kpforecast = 'kp:forecast',
  speed = 'speed',
  density = 'density',
  bt = 'bt',
  bz = 'bz',
}

export enum AuroraEnumColours {
  green = 'green',
  yellow = 'yellow',
  orange = 'orange',
  red = 'red',
}

export interface KpCurrent {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  request_date: Date;
}



export interface KpForecast {
  value: number;
  color: AuroraEnumColours;
  date: Date;
  request_date: Date;
  current: boolean;
}

export interface Nowcast {
  value: number;
  lat: number;
  long: number;
  color: AuroraEnumColours;
  date: Date;
  request_date: Date;
}

export interface ACEModule {
  bt: Bt;
  bz: Bz;
  density: Density;
  ['kp:27day']: Kp27day[];
  ['kp:current']: KpCurrent;
  ['kp:forecast']: KpForecast[];
  ['nowcast:local']: Nowcast;
  speed: Speed;
}
