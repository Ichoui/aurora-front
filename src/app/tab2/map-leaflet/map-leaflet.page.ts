import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { cities, City, CodeLocation } from '../../models/cities';
import { Content, GeoJSON, Icon, LatLng, LatLngBounds, Layer, Map, Marker, PathOptions, Popup, Rectangle, tileLayer, ZoomPanOptions } from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../storage.service';
import { first, map, takeUntil, tap } from 'rxjs/operators';
import { Geocoding } from '../../models/geocoding';
import { AuroraService } from '../../aurora.service';
import { countryNameFromCode } from '../../models/utils';
import { FORECAST_COLOR_GRAY, FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW } from '../../models/colors';
import { ELocales } from '../../models/locales';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-map-leaflet',
  templateUrl: './map-leaflet.page.html',
  styleUrls: ['./map-leaflet.page.scss'],
})
export class MapLeafletPage implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  private _map: Map;
  private _marker: Marker;
  private _popup: Popup;
  readonly cities: City[] = cities;
  private _locale: ELocales;
  localisation: string;
  loadingNewLocation = false;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _translate: TranslateService,
    private _storageService: StorageService,
    private _auroraService: AuroraService,
  ) {}

  ngOnInit(): void {
    this._checkStorageLocation();
    this._getStorageLocale();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Si storage vide, set valeur à location actuelle ET valeur du select à position actuelle
   * Sinon, set valeur du select à la position indiquée dans storage
   * */
  private _checkStorageLocation(): void {
    this._storageService.getData('location').then(
      (codeLocation: CodeLocation) => {
        if (codeLocation) {
          this.localisation = codeLocation.code;
          this._loadMap(codeLocation.lat, codeLocation.long);
        }
      },
      error => console.error('_checkStorageLocation() problem, message : ', error),
    );
  }

  private _getStorageLocale(): void {
    this._storageService.getData('locale').then(
      (locale: ELocales) => (this._locale = locale),
      error => console.error('_getStorageLocale() problem, error : ', error),
    );
  }

  /**
   * @param choice {any} Lorsque le Select est modifié, rentre dans la condition pour modifier la valeur de localisation
   * @param position {LatLng} Lorsqu'on ajoute un point sur la carte
   * Permet de pré-remplir le select avec la valeur disponible en storage si elle existe.
   * Met également la valeur en storage pour traitement tab2
   * */
  selectNewLocation(choice?: any, position?: LatLng): void {
    this.loadingNewLocation = true;
    if (choice) {
      this.localisation = choice.detail.value;
      const city = cities.find(res => res.code === choice.detail.value);
      if (city) {
        void this._storageService.setData('location', {
          code: this.localisation,
          lat: city.latitude,
          long: city.longitude,
        });
        this._addMarker(city.latitude, city.longitude);
      }
    } else {
      this.localisation = 'marker';
      void this._storageService.setData('location', {
        code: 'marker',
        lat: position.lat,
        long: position.lng,
      });
      this._addMarker(position.lat, position.lng);
    }
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Chargement de la carte
   * */
  private _loadMap(lat: number, long: number): void {
    let mapOpt: ZoomPanOptions = {
      animate: true,
      duration: 1.2,
    };

    this._map = new Map('map_canvas_select') //
      .setView([lat, long], 2, mapOpt) //
      .setMaxBounds([
        [-90, -180],
        [90, 180],
      ]);
    this._map.attributionControl.remove();
    const tileLayer1 = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'map-filter',
      noWrap: true,
      minZoom: 1,
    });

    this._map.addLayer(tileLayer1);

    this._map.on('click', params => {
      let latLng: LatLng = params['latlng'];
      void this.selectNewLocation(null, latLng);
    });
    // https://github.com/nouhouari/angular-leaflet/blob/master/package.json

    this._auroralOval(lat, long);
  }

  private _auroralOval(latCurrent: number, longCurrent: number) {
    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    let layer = new GeoJSON(collection, { style }).addTo(this._map);

    this._auroraService
      .getAuroraMapData$()
      .pipe(
        takeUntil(this._destroy$),
        tap((coords: number[] /*[long, lat, aurora]*/) => {
          let length = coords.length;
          // if (long === Math.round(longCurrent) && lat === Math.round(latCurrent)) {
          //   void this._storageService.setData('nowcastAurora', nowcastAurora);
          // }
          while (--length) {
            let long = coords[length][0];
            const lat = coords[length][1];
            const nowcastAurora = coords[length][2];
            const corner1 = new LatLng(lat + 2, long + 2),
              corner2 = new LatLng(lat, long),
              bounds = new LatLngBounds(corner1, corner2);
            layer.addLayer(
              new Rectangle(bounds, {
                color: mapColor(nowcastAurora),
                fill: true,
                weight: 0,
                opacity: 0,
                fillOpacity: 0.6,
                stroke: false,
                interactive: false,
                smoothFactor: 2,
              } as PathOptions),
              // https://leafletjs.com/reference.html#path explanations about options
            );
          }
        }),
        tap(() => this._addMarker(latCurrent, longCurrent)),
      )
      .subscribe();
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Permet de créer un marqueur
   * */
  private _addMarker(lat: any, long: any) {
    if (!this._marker) {
      this._marker = new Marker([lat, long], {
        draggable: false,
        icon: new Icon({
          iconSize: [25, 25],
          iconUrl: 'assets/img/marker-icon.png',
        }),
      }).addTo(this._map);
    } else {
      this._marker.setLatLng(new LatLng(lat, long));
    }
    this._reverseGeocode(lat, long);
  }

  /**
   * Géoloc l'utilisateur et place marker sur la map
   * Set en localStorage les coords
   * */
  // TODO should : doit rester ici, mais code possiblement à revoir
  async buttonMyPosition(): Promise<void> {
    this.loadingNewLocation = true;
    await Geolocation.getCurrentPosition()
      .then((resp: GeolocationPosition) => {
        this._addMarker(resp.coords.latitude, resp.coords.longitude);
        void this._storageService.setData('location', {
          code: 'currentLocation',
          lat: resp.coords.latitude,
          long: resp.coords.longitude,
        });
      })
      .catch(error => console.error('buttonMyPosition() : problem, message : ', error));
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Afficher dans le tooltip l'emplacement du clic
   * */
  private _reverseGeocode(lat: number, long: number): void {
    this._auroraService
      .getGeocoding$(lat, long)
      .pipe(
        takeUntil(this._destroy$),
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            let infoWindow: string;
            if (res?.name && res?.country) {
              infoWindow = `${res?.name}${res?.state ? ', ' + res.state : ''} - ${countryNameFromCode(res.country, this._locale)}`;
            } else {
              infoWindow = this._translate.instant('global.unknown');
              res?.country ? (infoWindow = countryNameFromCode(res.country, this._locale)) : (infoWindow = this._translate.instant('global.unknown'));
            }
            this._prepareTooltip(infoWindow, lat, long);
          },
          error: error => {
            console.error('_reverseGeocode() problem, message : ', error);
            const infoWindow = this._translate.instant('global.unknown');
            this._prepareTooltip(infoWindow);
          },
        }),
      )
      .subscribe();
  }

  /**
   * @param infoWindow {string}
   * @param lat {number}
   * @param lng
   * Affiche le tooltip
   * */
  private _prepareTooltip(infoWindow: string, lat?: number, lng?: number): void {
    if (!this._popup) {
      this._popup = new Popup({ closeButton: true, autoClose: true });
    }
    if (lat && lng) {
      this._auroraService
        .getNowcast$(lat, lng)
        .pipe(
          first(),
          tap(e => this._createTooltip(infoWindow, e['nowcast'], lat, lng)),
        )
        .subscribe();
    } else {
      // Empty tooltip because no lat & long
      this._createTooltip(infoWindow);
    }
  }

  private _createTooltip(infoWindow: string, nowcast?: unknown, lat?: number, lng?: number) {
    let message: Content | ((source: Layer) => Content);
    if (lat && lng) {
      message = `<b>${infoWindow}</b> <br /> Lat: ${lat} <br/> Long: ${lng} <br/> Chances: ${
        typeof nowcast === 'number' ? nowcast + '%' : this._translate.instant('tab2.forecast.unknown')
      }`;
    } else {
      message = `<b>${infoWindow}</b><br /> ${this._translate.instant('tab2.forecast.another')} `;
    }
    this._popup.setLatLng({ lat, lng }).setContent(message).addTo(this._map).openOn(this._map);
    void this._storageService.setData('nowcastAurora', nowcast);
    document.querySelector('.leaflet-popup-close-button').removeAttribute('href'); // href on marker tooltip reload page if not this line...
    this.loadingNewLocation = false;
    this._cdr.markForCheck();
  }
}

function mapColor(index: number): string {
  let color;
  if (index <= 8) {
    color = FORECAST_COLOR_GRAY;
  } else if (index > 8 && index < 20) {
    color = FORECAST_COLOR_GREEN;
  } else if (index >= 20 && index < 35) {
    color = FORECAST_COLOR_YELLOW;
  } else if (index >= 35 && index < 50) {
    color = FORECAST_COLOR_ORANGE;
  } else if (index >= 50) {
    color = FORECAST_COLOR_RED;
  }
  return color;
}

function style(feature: { properties: { color: number } }): PathOptions {
  return {
    fill: true,
    stroke: false,
    fillColor: mapColor(feature.properties.color),
    opacity: 1,
    color: mapColor(feature.properties.color),
    fillOpacity: 0.6,
  };
}
