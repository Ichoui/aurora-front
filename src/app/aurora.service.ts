import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ExcludeType, MeasureUnits, Weather } from './models/weather';
import { Pole } from './shared/modal/modal.component';
import { Geocoding } from './models/geocoding';
import { SolarWind, SwpcData } from './models/aurorav3';
import { ELocales } from './models/locales';
import { deleteFalsy } from './models/utils';
import { City } from './models/cities';

@Injectable({
  providedIn: 'root',
})
export class AuroraService {
  constructor(private _http: HttpClient) {}

  /**
   * Choix tranché : on envoie le système français (métrique et langues), de sorte à ne récupérer que des valeurs en km/h et des celsius.
   * Il faut obligatoirement les remplacer à la main via du code
   * @lat {number} latitude
   * @lon {number} longitude
   * @exclude {string} hourly | daily
   */
  openWeatherMapForecast$(lat: number, lon: number, lang: ELocales, exclude?: ExcludeType): Observable<Weather> {
    const params = {
      appid: environment.apikey,
      lat: lat.toString(),
      lon: lon.toString(),
      lang,
      units: MeasureUnits.METRIC,
      exclude,
    };
    return this._http.get<Weather>(`${environment.host}${environment.openweatherapi.weather}`, { params });
  }

  /**
   * @lat {number} latitude
   * @lon {number} longitude
   * Reverse localisation grâce à la latitude et la longitude fournies
   */
  getGeocoding$(lat: number, lon: number): Observable<Geocoding[]> {
    const params = {
      appid: environment.apikey,
      lat: lat.toString(),
      lon: lon.toString(),
    };
    return this._http.get<Geocoding[]>(`${environment.host}${environment.openweatherapi.geocode}`, { params });
  }

  getAllSwpcDatas$(lat?: number, long?: number): Observable<SwpcData> {
    return this._http.post<SwpcData>(`${environment.host}${environment.swpc.all}`, { lat, long });
  }

  /**
   * @pole {string} NORTH / SOUTH*
   * OVATION Model
   * Images des poles nord/sud sur les dernières 24h et entre 30 et 90mn de prévisions
   * Donnée : https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
   */
  getPoles$(pole: Pole): Observable<unknown> {
    return this._http.get(`${environment.host}${pole === Pole.NORTH ? environment.swpc.poleNorth : environment.swpc.poleSouth}`);
  }

  getAuroraMapData$(lat?: number, long?: number): Observable<any | number> {
    const params = deleteFalsy({ lat, long });
    return this._http.get(`${environment.host}${environment.swpc.ovationMap}`, { params });
  }

  getNowcast$(lat: number, lng: number): Observable<{ nowcast: number }> {
    return this._http.post<{ nowcast: number }>(`${environment.host}${environment.swpc.nowcast}`, { lat, lng });
  }

  getForecastSolarwind7d$(firstDate: string): Observable<SolarWind[]> {
    const params = deleteFalsy({ firstDate });
    return this._http.get<SolarWind[]>(`${environment.host}${environment.swpc.solarWind7d}`, { params });
  }

  getCorrespondingCities$(search: string): Observable<City[]> {
    const params = deleteFalsy({ search });
    return this._http.get<City[]>(`${environment.host}${environment.city}`, { params });
  }
}
