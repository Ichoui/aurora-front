import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cities, CodeLocation } from '../../models/cities';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoJSON, Icon, LatLng, LatLngBounds, Map, Marker, PathOptions, Popup, Rectangle, tileLayer, ZoomPanOptions, } from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../storage.service';
import { Geoposition } from '@ionic-native/geolocation';
import { map, tap } from 'rxjs/operators';
import { Geocoding } from '../../models/geocoding';
import { AuroraService } from '../../aurora.service';
import { countryNameFromCode } from '../../models/utils';
import geojsonvt from 'geojson-vt';
import { FORECAST_COLOR_GRAY, FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW, } from '../../models/colors';
import { ELocales } from '../../models/locales';
// import * as L from 'leaflet';
// import * as geojson from 'geojson';

@Component({
  selector: 'app-map-leaflet',
  templateUrl: './map-leaflet.page.html',
  styleUrls: ['./map-leaflet.page.scss'],
})
export class MapLeafletPage implements OnInit, OnDestroy {
  private _map: Map;
  private _marker: Marker;
  readonly cities = cities;
  private _locale: ELocales;
  localisation: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geoloc: Geolocation,
    private _translate: TranslateService,
    private _storageService: StorageService,
    private _auroraService: AuroraService,
  ) {}

  ngOnInit(): void {
    this._checkStorageLocation();
    this._getStorageLocale();
  }

  ngOnDestroy(): void {
    this._removeMarker();
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
      error => console.warn('Il y a un soucis de storage de position', error),
    );
  }

  private _getStorageLocale(): void {
    this._storageService.getData('locale').then(
      (locale: ELocales) => (this._locale = locale),
      error => console.warn('Il y a un soucis de storage de locale', error),
    );
  }

  /**
   * @param choice {any} Lorsque le Select est modifié, rentre dans la condition pour modifier la valeur de localisation
   * @param position {LatLng} Lorsqu'on ajoute un point sur la carte
   * Permet de pré-remplir le select avec la valeur disponible en storage si elle existe.
   * Met également la valeur en storage pour traitement tab2
   * */
  selectedLoc(choice?: any, position?: LatLng): void {
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
      .setView([lat, long], 3, mapOpt) //
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

    this._addMarker(lat, long);

    this._map.on('click', params => {
      let latLng: LatLng = params['latlng'];
      void this.selectedLoc(null, latLng);
    });
    // https://github.com/nouhouari/angular-leaflet/blob/master/package.jsonf

    this.pocGeoJson();

    // this._auroraService
    //   .getAuroraMapData$()
    //   .pipe(
    //     map(e => e.coordinates),
    //     tap((coords: number[] /*[long, lat, aurora]*/) => {
    //       // console.log(coords);
    //       // for (const coord of coords) {
    //       // if (auroraPercent >= 5) {
    //       //   const corner1 = new LatLng(lat + 1, long + 1 - 180),
    //       //     corner2 = new LatLng(lat, long - 180),
    //       //     bounds = new LatLngBounds(corner1, corner2);
    //       // new Rectangle(bounds, { color: this._mapColor(auroraPercent), opacity: 0.7, fill: true, weight: 0 }) //
    //       //   .addTo(this._map);
    //       // https://leafletjs.com/reference.html#rectangle
    //       // Raster map  / layers
    //       // https://leafletjs.com/plugins.html
    //       // we remove and add the rectangle layers here, because it throws an error if this happens in the onEachFeature function
    //       // }
    //     }),
    //   )
    //   .subscribe();
  }

  pocGeoJson() {
    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    // Voir pour mettre ceci en place
    var tileIndex = geojsonvt(collection, {
      maxZoom: 14, // max zoom to preserve detail on; can't be higher than 24
      tolerance: 3, // simplification tolerance (higher means simpler)
      extent: 4096, // tile extent (both width and height)
      buffer: 64, // tile buffer on each side
      debug: 0, // logging level (0 to disable, 1 or 2)
      lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
      promoteId: null, // name of a feature property to promote to feature.id. Cannot be used with `generateId`
      generateId: false, // whether to generate feature ids. Cannot be used with `promoteId`
      indexMaxZoom: 5, // max zoom in the initial tile index
      indexMaxPoints: 100000, // max number of points per tile in the index
    });

    let layer = new GeoJSON(collection, { style }).addTo(this._map);

    this._auroraService
      .getAuroraMapData$()
      .pipe(
        map(e => e.coordinates),
        tap((coords: number[] /*[long, lat, aurora]*/) => {
          console.log(coords);
          let i = 0;
          for (const coord of coords) {
            let long = coord[0];
            const lat = coord[1];
            const auroraPercent = coord[2];
            // On prend les valeurs paires seulement, et on leur rajoute +2 pour compenser les "trous" causés par l'impair
            // On passe ainsi d'environ 7500 à 1900 layers supplémentaire
            if (lat >= 30 || lat <= -30) {
              if (auroraPercent >= 2 && long % 2 === 0 && lat % 2 === 0) {
                if (long > 180) {
                  // Longitude 180+ dépasse de la map à droite, cela permet de revenir tout à gauche de la carte
                  long = long - 360;
                }
                const corner1 = new LatLng(lat + 2, long + 2),
                  corner2 = new LatLng(lat, long),
                  bounds = new LatLngBounds(corner1, corner2);
                layer.addLayer(
                  new Rectangle(bounds, {
                    color: mapColor(auroraPercent),
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
                // i++;
                // --------------------------------------------------------------------------------------------
                // layer.addData({
                //   type: 'Feature',
                //   properties: {
                //     color: [auroraPercent],
                //   },
                //   geometry: {
                //     type: 'Polygon',
                //     coordinates: [
                //       [
                //         [long, lat],
                //         [long, lat],
                //         [long, lat],
                //         [long, lat],
                //         [long, lat],
                //       ],
                //     ],
                //   },
                // } as GeoJSON.Feature);

                // if (i === 1) {
                // console.log(layer);
                // }
              }
            }
          }
          /*
          // WORKING!!
            layer.addData({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates
              },
            } as GeoJSON.Feature);*/

          // console.log(i);
        }),
      )
      .subscribe();
  }

  /**
   * @param lat {number}
   * @param long {number}$
   * Permet de créer un marqueur
   * */
  private _addMarker(lat, long): void {
    this._removeMarker();

    this._reverseGeocode(lat, long);

    this._marker = new Marker([lat, long], {
      draggable: false,
      icon: new Icon({
        iconSize: [25, 25],
        iconUrl: 'assets/img/marker-icon.png',
      }),
    }).addTo(this._map);
  }

  /**
   * Permet de retirer le marqueur actuel
   * */
  private _removeMarker(): void {
    if (this._marker) {
      this._marker.remove();
    }
  }

  /**
   * Géoloc l'utilisateur et place marker sur la map
   * Set en localStorage les coords
   * */
  buttonMyPosition(): void {
    this._removeMarker();
    this._geoloc
      .getCurrentPosition()
      .then((resp: Geoposition) => {
        this._addMarker(resp.coords.latitude, resp.coords.longitude);
        void this._storageService.setData('location', {
          code: 'currentLocation',
          lat: resp.coords.latitude,
          long: resp.coords.longitude,
        });
      })
      .catch(error => {
        console.warn('Error getting current location', error);
      });
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
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            let infoWindow;
            if (res?.name && res?.country) {
              infoWindow = `${res?.name}${res?.state ? ', ' + res.state : ''} - ${countryNameFromCode(
                res.country,
                this._locale,
              )}`;
            } else {
              infoWindow = this._translate.instant('global.unknown');
              res?.country
                ? (infoWindow = countryNameFromCode(res.country, this._locale))
                : (infoWindow = this._translate.instant('global.unknown'));
            }
            this._createTooltip(infoWindow, lat, long);
          },
          error: error => {
            console.error('Reverse geocode error ==> ', error);
            const infoWindow = this._translate.instant('global.unknown');
            this._createTooltip(infoWindow);
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
  private _createTooltip(infoWindow: string, lat?, lng?): void {
    const popup = new Popup({ closeButton: true, autoClose: true });
    let message;
    if (lat && lng) {
      message = `<b>${infoWindow}</b> <br /> Lat: ${lat} <br/> Long: ${lng}`;
    } else {
      message = `<b>${infoWindow}</b><br /> ${this._translate.instant('tab2.map.another')} `;
    }
    popup.setLatLng({ lat, lng }).setContent(message).addTo(this._map).openOn(this._map);
    document.querySelector('.leaflet-popup-close-button').removeAttribute('href'); // href on marker tooltip reload page if not this line...
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
