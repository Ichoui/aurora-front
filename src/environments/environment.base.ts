import { OPENWHEATHER_API_KEY } from './keep';

export const envBase = {
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurorapp - Northern Lights',
  auroraHeaders: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Aurora: 'true',
  },
  openweatherapi: {
    geocode: 'geocode',
    weather: 'weather',
  },
  cities: 'cities',
  notifications: {
    register: 'push/register',
  },
  swpc: {
    all: 'swpc',
    currentKp: 'instant/kp',
    solarWind1h: 'forecast/solarwind1h',
    solarWind7d: 'forecast/solarwind7d',
    solarCycle: 'forecast/solarcycle',
    ovationMap: 'map/ovation',
    nowcast: 'instant/nowcast',
    poleNorth: 'map/polenorth',
    poleSouth: 'map/polesouth',
    kpForecast27Days: 'forecast/twentysevendays',
    kpForecast: 'forecast/kp',
  },
};
