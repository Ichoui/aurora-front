import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cities, CodeLocation } from '../../models/cities';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Icon, LatLng, LatLngBounds, LatLngBoundsExpression, LatLngTuple, Map, Marker, Popup, Rectangle, tileLayer, ZoomPanOptions, } from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../storage.service';
import { Geoposition } from '@ionic-native/geolocation';
import { map, tap } from 'rxjs/operators';
import { Geocoding } from '../../models/geocoding';
import { AuroraService } from '../../aurora.service';
import { countryNameFromCode } from '../../models/utils';

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.page.html',
  styleUrls: ['./location-map.page.scss'],
})
export class LocationMapPage implements OnInit, OnDestroy {
  private _map: Map;
  private _marker: Marker;
  readonly cities = cities;
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
    this._checkStorageLoc();
  }

  ngOnDestroy(): void {
    this._removeMarker();
  }

  /**
   * Si storage vide, set valeur à location actuelle ET valeur du select à position actuelle
   * Sinon, set valeur du select à la position indiquée dans storage
   * */
  private _checkStorageLoc(): void {
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

  /**
   * @param choice {any} Lorsque le Select est modifié, rentre dans la condition pour modifier la valeur de localisation
   * @param position {LatLng} Lorsqu'on ajoute un point sur la carte
   * Permet de pré-remplir le select avec la valeur disponible en storage si elle existe.
   * Met également la valeur en storage pour traitement tab3
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
    this._map = new Map('map_canvas_select').setView([lat, long], 3, mapOpt);
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' <div style="font-size: 1em">&copy;<a href="https://www.openstreetmap.org/copyright">OSM</a></div>',
    }).addTo(this._map);

    this._addMarker(lat, long);

    this._map.on('click', params => {
      let latLng: LatLng = params['latlng'];
      void this.selectedLoc(null, latLng);
    });

    this._auroraService
      .getAuroraMapData$()
      .pipe(
        map(e => e.coordinates),
        tap((coords: number[] /*[long, lat, aurora]*/) => {
          for (const coord of coords) {
            if (coord[2] >= 5) {
              const corner1 = new LatLng(coord[1] + 1, coord[0] + 1 - 180),
                corner2 = new LatLng(coord[1], coord[0] - 180),
                bounds = new LatLngBounds(corner1, corner2);
              new Rectangle(bounds, { color: this._mapColor(coord[2]), opacity: 0.7, fill: true, weight: 0 }) //
                .addTo(this._map);
              // https://leafletjs.com/reference.html#rectangle

              // Raster map  / layers
              // https://leafletjs.com/plugins.html
            }
          }
        }),
      )
      .subscribe();

    // const corner1 = [54.9999, 54.0];
    // const corner2 = [54.0, 54.9999];
    const corner1: LatLngTuple = [54.99, 54.0];
    const corner2: LatLngTuple = [54.0, 54.99];
    const bounds: LatLngBoundsExpression = [corner1, corner2];
    // new Rectangle(bounds, { color: this._mapColor(44), weight: 1 }).addTo(this._map);

    const corner12: LatLngTuple = [55.99, 55.0];
    const corner22: LatLngTuple = [55.0, 55.99];
    const bounds2: LatLngBoundsExpression = [corner12, corner22];

    // Haut droit LAT 45.12 3.16
    // Haut gauche LAT 45.1 LONG 1.48
    // Bas droit LAT 44.15 LONG 3.1
    // Bas gauche LAT 44.22 LONG 1.5
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
              infoWindow = `${res?.name}${res?.state ? ', ' + res.state : ''} - ${countryNameFromCode(res.country)}`;
            } else {
              infoWindow = this._translate.instant('global.unknown');
              res?.country
                ? (infoWindow = countryNameFromCode(res.country))
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
      message = `<b>${infoWindow}</b><br /> ${this._translate.instant('tab3.map.another')} `;
    }
    popup.setLatLng({ lat, lng }).setContent(message).addTo(this._map).openOn(this._map);
    document.querySelector('.leaflet-popup-close-button').removeAttribute('href'); // href on marker tooltip reload page if not this line...
  }

  private _mapColor(index: number): string {
    let color;
    if (index < 10) {
      color = 'gray';
    } else if (index >= 10 && index < 20) {
      color = 'green';
    } else if (index >= 20 && index < 30) {
      color = 'yellow';
    } else if (index >= 30 && index < 40) {
      color = 'orange';
    } else if (index >= 40 && index < 60) {
      color = 'red';
    } else if (index >= 60 && index < 40) {
      color = 'purple';
    }
    return color;
  }
}
