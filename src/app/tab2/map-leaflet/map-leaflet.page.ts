import type { ElementRef, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import type { SearchbarCustomEvent, ViewDidEnter, ViewWillLeave } from '@ionic/angular';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonPopover, IonSearchbar } from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import type { LayerGroup, TileLayer } from 'leaflet';
import { Icon, layerGroup, Map, Marker, rectangle, tileLayer } from 'leaflet';
import { Subscription, timeout } from 'rxjs';
import { AuroraService } from '../../aurora.service';
import type { City, LocationSelection } from '../../models/cities';
import { FORECAST_COLOR_GRAY, FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW } from '../../models/colors';
import { countryNameFromCode } from '../../models/utils';
import { ELocales } from '../../models/locales';
import { HeaderComponent } from '../../shared/header/header.component';
import { StorageService } from '../../storage.service';

const LEVELS = [
  { label: '≤8%', color: FORECAST_COLOR_GRAY },
  { label: '<20%', color: FORECAST_COLOR_GREEN },
  { label: '<35%', color: FORECAST_COLOR_YELLOW },
  { label: '<50%', color: FORECAST_COLOR_ORANGE },
  { label: '≥50%', color: FORECAST_COLOR_RED },
];

function ovalColor(value: number): string {
  if (value <= 8) return FORECAST_COLOR_GRAY;
  if (value < 20) return FORECAST_COLOR_GREEN;
  if (value < 35) return FORECAST_COLOR_YELLOW;
  if (value < 50) return FORECAST_COLOR_ORANGE;
  return FORECAST_COLOR_RED;
}

@Component({
  selector: 'app-map-leaflet',
  templateUrl: './map-leaflet.page.html',
  styleUrl: './map-leaflet.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonPopover, IonIcon, HeaderComponent, TranslatePipe, IonSearchbar, IonItem, IonList, IonLabel],
})
export class MapLeafletPage implements ViewDidEnter, ViewWillLeave, OnDestroy {
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _storage = inject(StorageService);
  private readonly _aurora = inject(AuroraService);
  private readonly _mapElement = viewChild.required<ElementRef<HTMLDivElement>>('mapElement');
  private _map?: Map;
  private _tiles?: TileLayer;
  private _oval?: LayerGroup;
  private _marker?: Marker;
  private _searchRequest?: Subscription;
  private _ovalRequest?: Subscription;
  private _pointRequests = new Subscription();
  private _selectionVersion = 0;
  private _viewVersion = 0;
  private _saved?: LocationSelection;

  readonly levels = LEVELS;
  cities: City[] = [];
  searchState: 'idle' | 'pending' | 'empty' | 'error' = 'idle';
  selected?: LocationSelection;
  probability: number | null = null;
  locating = false;
  saving = false;
  editing = false;
  tilesFailed = false;
  ovalState: 'pending' | 'ready' | 'error' = 'pending';
  nowcastState: 'pending' | 'ready' | 'error' = 'pending';
  geocodeFailed = false;
  actionError: 'gps' | 'storage' | '' = '';

  ionViewDidEnter(): void {
    const view = ++this._viewVersion;
    void this._storage
      .getLocation()
      .then(location => {
        if (view !== this._viewVersion) return;
        this._saved = location;
        if (!this._map) this._loadMap(location);
        this._map?.invalidateSize();
        this._showLocation(location, false);
      })
      .catch(() => {
        if (view !== this._viewVersion) return;
        this.actionError = 'storage';
        this._cdr.markForCheck();
      });
  }

  ionViewWillLeave(): void {
    this._viewVersion++;
    this._selectionVersion++;
    this.locating = false;
    this.closeSearch();
    this._pointRequests.unsubscribe();
  }

  ngOnDestroy(): void {
    this.ionViewWillLeave();
    this._ovalRequest?.unsubscribe();
    this._map?.remove();
  }

  handleInput(event: SearchbarCustomEvent): void {
    const query = (event.detail.value ?? '').trim();
    this.closeSearch();
    if (query.length < 3) return;
    this.searchState = 'pending';
    this._searchRequest = this._aurora
      .getCorrespondingCities$(query)
      .pipe(timeout(12_000))
      .subscribe({
        next: cities => {
          this.cities = cities;
          this.searchState = cities.length ? 'idle' : 'empty';
          this._cdr.markForCheck();
        },
        error: () => {
          this.searchState = 'error';
          this._cdr.markForCheck();
        },
      });
  }

  closeSearch(): void {
    this._searchRequest?.unsubscribe();
    this.cities = [];
    this.searchState = 'idle';
    this._cdr.markForCheck();
  }

  selectCity(city: City): void {
    const country = countryNameFromCode(city.countryCode, this._locale());
    this._showLocation({ lat: Number(city.lat), long: Number(city.long), source: 'city', label: country ? `${city.name}, ${country}` : city.name });
  }

  async useGps(): Promise<void> {
    if (this.locating || this.saving || !this._map) return;
    const version = ++this._selectionVersion;
    this.locating = true;
    this.actionError = '';
    try {
      const { coords } = await Geolocation.getCurrentPosition({ timeout: 8000, maximumAge: 60_000 });
      if (version !== this._selectionVersion) return;
      this._showLocation({ lat: coords.latitude, long: coords.longitude, source: 'gps' });
    } catch {
      if (version === this._selectionVersion) this.actionError = 'gps';
    } finally {
      if (version === this._selectionVersion) {
        this.locating = false;
        this._cdr.markForCheck();
      }
    }
  }

  async confirmLocation(): Promise<void> {
    if (!this.selected || this.saving || this.locating) return;
    const location = this.selected;
    const view = this._viewVersion;
    this.saving = true;
    this.actionError = '';
    try {
      await this._storage.setData('location', location);
      if (view !== this._viewVersion) return;
      this._saved = location;
      this.editing = false;
    } catch {
      if (view === this._viewVersion) this.actionError = 'storage';
    } finally {
      this.saving = false;
      this._cdr.markForCheck();
    }
  }

  cancelPreview(): void {
    if (this._saved && !this.saving) this._showLocation(this._saved, false, true);
  }

  retryTiles(): void {
    this.tilesFailed = false;
    this._tiles?.redraw();
  }

  loadOval(): void {
    if (!this._oval) return;
    this._ovalRequest?.unsubscribe();
    this.ovalState = 'pending';
    this._ovalRequest = this._aurora
      .getAuroraMapData$()
      .pipe(timeout(20_000))
      .subscribe({
        next: points => {
          this._oval?.clearLayers();
          for (const [long, lat, value] of points) {
            this._oval?.addLayer(
              rectangle(
                [
                  [lat, long],
                  [Math.min(90, lat + 2), Math.min(180, long + 2)],
                ],
                { fillColor: ovalColor(value), fillOpacity: 0.6, stroke: false, interactive: false },
              ),
            );
          }
          this.ovalState = 'ready';
          this._cdr.markForCheck();
        },
        error: () => {
          this.ovalState = 'error';
          this._cdr.markForCheck();
        },
      });
  }

  retryLocationData(): void {
    if (this.selected && !this.saving && !this.locating) this._showLocation(this.selected, this.editing, false);
  }

  private _loadMap(location: LocationSelection): void {
    this._map = new Map(this._mapElement().nativeElement, {
      attributionControl: true,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
    }).setView([location.lat, location.long], 2);
    this._tiles = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: 'map-filter',
      noWrap: true,
      minZoom: 1,
    })
      .on('tileerror', () => {
        this.tilesFailed = true;
        this._cdr.markForCheck();
      })
      .addTo(this._map);
    this._oval = layerGroup().addTo(this._map);
    this._marker = new Marker([location.lat, location.long], {
      interactive: false,
      keyboard: false,
      icon: new Icon({ iconSize: [25, 25], iconAnchor: [12, 25], iconUrl: 'assets/img/marker-icon.png' }),
    }).addTo(this._map);
    this._map.on('click', event => {
      const { lat, lng } = event.latlng.wrap();
      this._showLocation({ lat, long: lng, source: 'map' }, true, false);
    });
    this.loadOval();
  }

  private _showLocation(location: LocationSelection, editing = true, recenter = editing): void {
    if (editing && this.saving) return;
    this._selectionVersion++;
    this.locating = false;
    this.actionError = '';
    this.closeSearch();
    this._pointRequests.unsubscribe();
    this._pointRequests = new Subscription();
    this.selected = location;
    this.editing = editing;
    this.probability = null;
    this.nowcastState = 'pending';
    this.geocodeFailed = false;
    this._marker?.setLatLng([location.lat, location.long]);
    if (recenter) this._map?.panTo([location.lat, location.long]);

    if (!location.label) {
      this._pointRequests.add(
        this._aurora
          .getGeocoding$(location.lat, location.long)
          .pipe(timeout(12_000))
          .subscribe({
            next: ([place]) => {
              if (place?.name) {
                const country = countryNameFromCode(place.country, this._locale());
                this.selected = { ...location, label: country ? `${place.name}, ${country}` : place.name };
                this._cdr.markForCheck();
              }
            },
            error: () => {
              this.geocodeFailed = true;
              this._cdr.markForCheck();
            },
          }),
      );
    }

    this._pointRequests.add(
      this._aurora
        .getNowcast$(location.lat, location.long)
        .pipe(timeout(12_000))
        .subscribe({
          next: ({ nowcast }) => {
            this.probability = nowcast;
            this.nowcastState = 'ready';
            this._cdr.markForCheck();
          },
          error: () => {
            this.nowcastState = 'error';
            this._cdr.markForCheck();
          },
        }),
    );
    this._cdr.markForCheck();
  }

  private _locale(): ELocales {
    return this._translate.getCurrentLang() === ELocales.FR ? ELocales.FR : ELocales.EN;
  }
}
