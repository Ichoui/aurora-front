import { OPENWHEATHER_API_KEY } from './keep';

export const environment = {
  production: true,
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurora Borealis',
  auroraHeaders: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Aurora: 'true',
  },
  // host: 'https://us-central1-aurora-proxy-be7c0.cloudfunctions.net/aurora/',
  host: 'http://localhost:5000/aurora-proxy-be7c0/us-central1/aurora/',
  openweatherapi: {
    geocode: 'geocode',
    weather: 'weather',
  },
  swpc: {
    currentKp: 'instant/kp',
    solarWind: 'forecast/solarwind',
    solarCycle: 'forecast/solarcycle',
    ovationMap: 'map/ovation',
    nowcast: 'instant/nowcast',
    poleNorth: 'map/polenorth',
    poleSouth: 'map/polesouth',
    kpForecast27Days: 'forecast/twentysevendays',
    kpForecast: 'forecast/kp',
  },
};
