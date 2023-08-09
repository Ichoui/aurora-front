import { OPENWHEATHER_API_KEY } from './keep';

export const environment = {
  production: true,
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurorapp - Northern Lights',
  auroraHeaders: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Aurora: 'true',
  },
  host: 'https://aurora-p5yvpp3fuq-uc.a.run.app/aurora/',
  openweatherapi: {
    geocode: 'geocode',
    weather: 'weather',
  },
  swpc: {
    all: 'swpc',
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
