import { OPENWHEATHER_API_KEY } from './keep';

export const environment = {
  production: true,
  cors: 'https://thingproxy.freeboard.io/fetch/', // compiled with android --> CORS not necessary ? Test
  api_weather: 'https://api.openweathermap.org/data/2.5/onecall',
  api_reverse_geocode: 'https://api.openweathermap.org/geo/1.0/reverse',
  aurora_v1_api: 'https://api.auroras.live/v1',
  aurora_v2_api: 'https://v2.api.auroras.live',
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurora Chasers',
  auroraHeaders: {
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Aurora: 'true',
  },
  swpc: {
    poleNorth: 'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
    poleSouth: 'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
    solarWind: 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
    kpForecast27Days: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    kpForecast: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
    solarCycle: 'https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json',
    ovationMap: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
  },
  customSwpc: {
    currentKp: 'instant/kp',
    solarWind: 'forecast/solarwind',
    solarCycle: 'forecast/solarcycle',
    ovationMap: 'map/ovation',
    nowcast: 'instant/nowcast',
  },
};
