import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuroraModules } from './models/aurorav2';
import { ExcludeType, MeasureUnits, Weather } from './models/weather';
import { Pole } from './shared/modal/modal.component';
import { Geocoding } from './models/geocoding';
import { KpForecast, SolarWind } from './models/aurorav3';
import { fromFetch } from 'rxjs/fetch';
import { switchMap } from 'rxjs/operators';
import { ELocales } from './models/locales';

@Injectable({
  providedIn: 'root',
})
export class AuroraService {
  constructor(private _http: HttpClient) {}

  /**
   * @lat {number} longitude
   * @long {number} latitude
   * get la v2 providé par aurora.live grâce au Space Weather Prediction Center
   * https://v2.api.auroras.live/images/embed/nowcast.png
   */
  auroraLiveV2$(lat?: number, long?: number): Observable<any> {
    return this._http.post(`${environment.cors}${environment.aurora_v2_api}`, {
      modules: [
        AuroraModules.kpcurrent,
        AuroraModules.nowcastlocal,
        // AuroraModules.kpforecast,
        // AuroraModules.density,
        // AuroraModules.speed,
        // AuroraModules.kp27day,
        // AuroraModules.bz,
        // AuroraModules.bt,
      ],
      common: {
        lat,
        long,
      },
    });
  }

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
    return this._http.get<Weather>(`${environment.cors}${environment.api_weather}`, { params });
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
    return this._http.get<Geocoding[]>(`${environment.cors}${environment.api_reverse_geocode}`, { params });
  }

  /*
   * Solar wind values
   * Density Speed Bt Bz
   * time_tag is UTC formaty
   * https://www.swpc.noaa.gov/products/real-time-solar-wind --> Other API here, who confirms that I use the correct one API
   * */
  getSolarWind$(): Observable<SolarWind[]> {
    return this._http.get<SolarWind[]>(`${environment.cors}${environment.swpc.solarWind}`);
  }

  /*
   * KP Forecast 27 days
   * file .txt
   * */
  getKpForecast27Days$() {
    return fromFetch(`${environment.cors}${environment.swpc.kpForecast27Days}`).pipe(
      switchMap((res: Response) => res.text()),
    );
  }

  /*
   * KP Forecast next 3 days
   * */
  getKpForecast$(): Observable<KpForecast[]> {
    return this._http.get<KpForecast[]>(`${environment.cors}${environment.swpc.kpForecast}`);
  }

  /**
   * @pole {string} NORTH / SOUTH*
   * OVATION Model
   * Images des poles nord/sud sur les dernières 24h et entre 30 et 90mn de prévisions
   * Donnée : https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
   */
  getPoles$(pole: Pole): Observable<unknown> {
    return this._http.get(
      `${environment.cors}${pole === Pole.NORTH ? environment.swpc.poleNorth : environment.swpc.poleSouth}`,
    );
  }

  getAuroraMapData$(): Observable<any> {
    return this._http.get(`${environment.cors}${environment.swpc.auroraMap}`);
  }
}
