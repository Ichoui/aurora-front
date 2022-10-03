import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuroraModules } from './models/aurorav2';
import { ExcludeType, Unit, Weather } from './models/weather';
import { Pole } from './shared/modal/modal.component';
import { Geocoding } from './models/geocoding';

@Injectable({
  providedIn: 'root',
})
export class AuroraService {
  constructor(private http: HttpClient) {}

  /**
   * @lat {number} longitude
   * @long {number} latitude
   * get la v2 providé par aurora.live grâce au Space Weather Prediction Center
   * https://v2.api.auroras.live/images/embed/nowcast.png
   */
  auroraLiveV2$(lat?: number, long?: number): Observable<any> {
    return this.http.post(`${environment.cors}/${environment.aurora_v2_api}`, {
      modules: [
        AuroraModules.kpcurrent,
        AuroraModules.density,
        AuroraModules.speed,
        AuroraModules.nowcastlocal,
        AuroraModules.kp27day,
        AuroraModules.kpforecast,
        AuroraModules.bz,
        AuroraModules.bt,
      ],
      common: {
        lat,
        long,
      },
    });
  }

  /**
   * @lat {number} latitude
   * @lon {number} longitude
   * @exclude {string} hourly | daily
   * @unit  {unit}
   */
  openWeatherMapForecast$(lat: number, lon: number, unit?: Unit, exclude?: ExcludeType): Observable<Weather> {
    const params = {
      appid: environment.apikey,
      lat: lat.toString(),
      lon: lon.toString(),
      lang: 'fr',
      units: unit,
      exclude,
    };
    return this.http.get<Weather>(`${environment.cors}/${environment.api_weather}`, { params });
  }

  /**
   * @pole {string} NORTH / SOUTH*
   * OVATION Model
   * Images des poles nord/sud sur les dernières 24h et entre 30 et 90mn de prévisions
   * Donnée : https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
   */
  getPoles$(pole: Pole): Observable<unknown> {
    return this.http.get(
      `${environment.cors}/https://services.swpc.noaa.gov/products/animations/ovation_${pole}_24h.json`,
    );
  }

  /**
   * @lat {number} latitude
   * @lon {number} longitude
   */

  getGeocoding$(lat: number, lon: number): Observable<Geocoding[]> {
    const params = {
      appid: environment.apikey,
      lat: lat.toString(),
      lon: lon.toString(),
    };
    return this.http.get<Geocoding[]>(`${environment.cors}/${environment.api_reverse_geocode}`, { params });
  }

  test$():Observable<any> {
    return this.http.get(`${environment.cors}/https://services.swpc.noaa.gov/json/ovation_aurora_latest.json`)
  }
}
