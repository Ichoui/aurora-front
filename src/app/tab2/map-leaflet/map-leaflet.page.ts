import { DOCUMENT } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import type { SearchbarCustomEvent } from '@ionic/angular';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { PathOptions, ZoomPanOptions } from 'leaflet';
import { GeoJSON, Icon, LatLng, LatLngBounds, Map, Marker, Popup, Rectangle, tileLayer } from 'leaflet';
import type { Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs';
import { AuroraService } from '../../aurora.service';
import type { City, CityCoords } from '../../models/cities';
import { FORECAST_COLOR_GRAY, FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW } from '../../models/colors';
import type { Geocoding } from '../../models/geocoding';
import { ELocales } from '../../models/locales';
import { countryNameFromCode } from '../../models/utils';
import { HeaderComponent } from '../../shared/header/header.component';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-map-leaflet',
  templateUrl: './map-leaflet.page.html',
  styleUrl: './map-leaflet.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonPopover, IonIcon, HeaderComponent, RouterLink, TranslatePipe, IonSearchbar, IonItem, IonList, IonLabel],
})
export class MapLeafletPage implements OnInit, OnDestroy {
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _storageService = inject(StorageService);
  private readonly _auroraService = inject(AuroraService);
  private readonly _document = inject(DOCUMENT);

  private readonly _destroyRef = inject(DestroyRef);
  private _map?: Map;
  private _marker?: Marker;
  private _popup?: Popup;
  private _locale = ELocales.EN;
  private _searchSubscription?: Subscription;
  searchbarWidth = '';
  loadingNewLocation = false;
  citiesMatched = false;
  citiesList: City[] = [];

  ngOnInit(): void {
    this._checkStorageLocation();
    this._getStorageLocale();
  }

  ngOnDestroy(): void {
    this._searchSubscription?.unsubscribe();
    this._map?.remove();
    this._map = undefined;
  }

  /**
   * Si storage vide, set valeur à location actuelle ET valeur du select à position actuelle
   * Sinon, set valeur du select à la position indiquée dans storage
   * */
  private _checkStorageLocation(): void {
    this._storageService.getData('location').then(
      coords => {
        if (coords && !this._destroyRef.destroyed) {
          this._loadMap(coords.lat, coords.long);
        }
      },
      error => console.error('_checkStorageLocation() problem, message : ', error),
    );
  }

  private _getStorageLocale(): void {
    this._storageService.getData('locale').then(
      locale => {
        this._locale = locale ?? ELocales.EN;
      },
      error => console.error('_getStorageLocale() problem, error : ', error),
    );
  }

  handleInput(event: SearchbarCustomEvent): void {
    const search = (event.detail.value ?? '').toLowerCase();
    this._searchSubscription?.unsubscribe();
    if (search.length > 2) {
      this._searchSubscription = this._auroraService
        .getCorrespondingCities$(search)
        .pipe(
          takeUntilDestroyed(this._destroyRef),
          tap(c => {
            if (c.length !== 0) {
              this.searchbarWidth = `${event.target.getBoundingClientRect().width}px`;

              this.citiesMatched = true;
              this.citiesList = c;
              this._cdr.markForCheck();
            } else this.closeSearchbar();
          }),
        )
        .subscribe({
          error: (error: unknown) => {
            console.error('City search failed', error);
            this.closeSearchbar();
          },
        });
    } else {
      this.closeSearchbar();
    }
  }

  closeSearchbar(): void {
    this.citiesMatched = false;
    this.citiesList = [];
    this._cdr.markForCheck();
  }

  convertCoords(coords: { lat: string; long: string }): CityCoords {
    return { lat: Number(coords.lat), long: Number(coords.long) };
  }

  /**
   * @param coords {CityCoords} Coordonnées de la location
   * Ajoute la location actuelle en storage
   * Rajoute un marker physique sur la map
   * */
  selectNewLocation(coords: CityCoords): void {
    if (this.citiesMatched) {
      this.closeSearchbar();
    }
    this.loadingNewLocation = true;
    this._cdr.markForCheck();
    void this._storageService.setData('location', {
      lat: coords.lat,
      long: coords.long,
    });
    this._addMarker(coords.lat, coords.long);
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Chargement de la carte
   * */
  private _loadMap(lat: number, long: number): void {
    const mapOpt: ZoomPanOptions = {
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
      const latLng = params.latlng as LatLng;
      void this.selectNewLocation({ lat: latLng.lat, long: latLng.lng });
    });
    // https://github.com/nouhouari/angular-leaflet/blob/master/package.json

    this._auroralOval(lat, long);
  }

  private _auroralOval(latCurrent: number, longCurrent: number): void {
    if (!this._map) return;
    const collection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    const layer = new GeoJSON(collection, { style }).addTo(this._map);

    this._auroraService
      .getAuroraMapData$()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap(coords => {
          let length = coords.length;
          while (--length) {
            const long = coords[length][0];
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
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
  }

  /**
   * @param lat {number}
   * @param long {number}
   * Permet de créer un marqueur
   * */
  private _addMarker(lat: number, long: number): void {
    if (!this._map) return;
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
  async buttonMyPosition(): Promise<void> {
    this.loadingNewLocation = true;
    try {
      const { coords } = await Geolocation.getCurrentPosition();
      if (this._destroyRef.destroyed) return;
      this._addMarker(coords.latitude, coords.longitude);
      await this._storageService.setData('location', { lat: coords.latitude, long: coords.longitude });
    } catch (error: unknown) {
      console.error('buttonMyPosition(): Geolocation error', error);
      this.loadingNewLocation = false;
    } finally {
      if (!this._destroyRef.destroyed) this._cdr.markForCheck();
    }
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
        takeUntilDestroyed(this._destroyRef),
        map((res: Geocoding[]) => res[0]),
        tap({
          next: (res: Geocoding) => {
            let infoWindow: string;
            if (res?.name && res?.country) {
              infoWindow = `${res?.name} - ${countryNameFromCode(res.country, this._locale)}`;
            } else {
              infoWindow = res?.country ? countryNameFromCode(res.country, this._locale) : this._translate.instant('global.unknown');
            }
            this._prepareTooltip(infoWindow, lat, long);
          },
          error: error => {
            console.error('_reverseGeocode() problem, message : ', error);
            const infoWindow = this._translate.instant('global.unknown');
            this._prepareTooltip(infoWindow, lat, long);
          },
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          console.error('Request failed', error);
        },
      });
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
    if (lat !== undefined && lng !== undefined) {
      this._auroraService
        .getNowcast$(lat, lng)
        .pipe(
          first(),
          takeUntilDestroyed(this._destroyRef),
          tap(e => this._createTooltip(infoWindow, e['nowcast'], lat, lng)),
        )
        .subscribe({
          error: (error: unknown) => {
            console.error('Request failed', error);
          },
        });
    } else {
      // Empty tooltip because no lat & long
      this._createTooltip(infoWindow);
    }
  }

  private _createTooltip(infoWindow: string, nowcast?: number, lat?: number, lng?: number): void {
    if (!this._map || !this._popup) return;
    const position = lat !== undefined && lng !== undefined ? new LatLng(lat, lng) : this._marker?.getLatLng();
    if (!position) return;
    const message = this._document.createElement('div');
    const title = this._document.createElement('b');
    title.textContent = infoWindow;
    message.append(title, this._document.createElement('br'));
    if (lat !== undefined && lng !== undefined) {
      const probability = typeof nowcast === 'number' ? `${nowcast}%` : this._translate.instant('tab2.forecast.unknown');
      message.append(
        `Lat: ${lat}`,
        this._document.createElement('br'),
        `Long: ${lng}`,
        this._document.createElement('br'),
        `Chances: ${probability}`,
      );
    } else {
      message.append(this._translate.instant('tab2.forecast.another') as string);
    }
    this._popup.setLatLng(position).setContent(message).openOn(this._map);
    if (nowcast !== undefined) void this._storageService.setData('nowcastAurora', nowcast);
    this._popup.getElement()?.querySelector('.leaflet-popup-close-button')?.removeAttribute('href');
    this.loadingNewLocation = false;
    this._cdr.markForCheck();
  }

  protected readonly LatLng = LatLng;
}

function mapColor(index: number): string {
  let color = FORECAST_COLOR_GRAY;
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

function style(feature?: Feature<Geometry, { color: number }>): PathOptions {
  return {
    fill: true,
    stroke: false,
    fillColor: mapColor(feature?.properties.color ?? 0),
    opacity: 1,
    color: mapColor(feature?.properties.color ?? 0),
    fillOpacity: 0.6,
  };
}
