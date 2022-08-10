import { OPENWHEATHER_API_KEY } from "./keep";

export const environment = {
  production: true,
  cors: 'https://thingproxy.freeboard.io/fetch',
  api_weather: 'https://api.openweathermap.org/data/2.5/onecall',
  aurora_v1_api: 'https://api.auroras.live/v1',
  aurora_v2_api: 'https://v2.api.auroras.live',
  apikey: OPENWHEATHER_API_KEY,
  application_name: 'Aurora - Northern Light',
};
