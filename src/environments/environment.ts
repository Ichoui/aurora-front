// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { OPENWHEATHER_API_KEY } from './keep';
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error'; // Included with Angular CLI.

// https://nordicapis.com/10-free-to-use-cors-proxies/
export const environment = {
  production: false,
  // host: 'https://us-central1-aurora-proxy-be7c0.cloudfunctions.net/aurora/',
  host: 'http://localhost:5000/aurora-proxy-be7c0/us-central1/aurora/',
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurora - Northern Lights',
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
  ex: {
    // cors: 'https://thingproxy.freeboard.io/fetch/',
    // cors: 'https://aurora-proxy-be7c0.web.app/fetch/',
    // cors: 'https://aurora-proxy-be7c0.web.app/aurora/',
    // cors: 'http://localhost:3945/aurora/',
    api_weather: 'https://api.openweathermap.org/data/2.5/onecall',
    api_reverse_geocode: 'https://api.openweathermap.org/geo/1.0/reverse',
    aurora_v1_api: 'https://api.auroras.live/v1',
    aurora_v2_api: 'https://v2.api.auroras.live',
    exswpc: {
      // poleNorth: 'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
      // poleSouth: 'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
      // kpForecast27Days: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
      // kpForecast: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
      // solarWind: 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
      // solarCycle: 'https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json',
      // ovationMap: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
    },
  },
};
