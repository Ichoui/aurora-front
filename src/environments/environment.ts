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
  cors: 'https://thingproxy.freeboard.io/fetch/',
  api_weather: 'https://api.openweathermap.org/data/2.5/onecall',
  api_reverse_geocode: 'https://api.openweathermap.org/geo/1.0/reverse',
  aurora_v1_api: 'https://api.auroras.live/v1',
  aurora_v2_api: 'https://v2.api.auroras.live',
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurora Chasers',
  swpc: {
    poleNorth: 'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
    poleSouth: 'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
    auroraMap: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
    solarWind: 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
    kpForecast27Days: 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
    kpForecast: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json'
  }
};
