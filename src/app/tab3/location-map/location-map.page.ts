import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cities, CodeLocation } from '../../models/cities';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { icon, LatLng, Map, marker, Marker, tileLayer, ZoomPanOptions } from 'leaflet';
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
    ) {
    }

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
    }

    /**
     * @param lat {number}
     * @param long {number}
     * Permet de créer un marqueur
     * */
    private _addMarker(lat, long): void {
        this._removeMarker();

        this._reverseGeocode(lat, long);

        this._marker = marker([lat, long], {
            draggable: false,

            icon: icon({
                iconSize: [45, 45],
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
                console.log(resp);
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
                        console.log(res);
                        let infoWindow;
                        if (res?.name && res?.country) {
                            infoWindow = `${res?.name}${res?.state ? ', ' + res.state : ''} - ${countryNameFromCode(res.country)}`;
                        } else {
                            infoWindow = this._translate.instant('global.unknown');
                            res.country
                                ? (infoWindow = countryNameFromCode(res.country))
                                : (infoWindow = this._translate.instant('global.unknown'));
                        }
                        this._createTooltip(infoWindow, lat, long);
                    },
                    error: error => {
                        // (error: HttpErrorResponse)
                        console.log(error);
                        console.warn('Reverse geocode error ==> ', error);
                        console.error('Error localisation', error);
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
     * @param long {number}
     * Affiche le tooltip
     * */
    private _createTooltip(infoWindow: string, lat?, long?): void {
        if (lat && long) {
            this._marker
                .bindPopup(`<b>${infoWindow}</b> <br /> Lat: ${lat} <br/> Long: ${long}`, {closeOnClick: true})
                .openPopup();
        } else {
            this._marker.bindPopup(`<b>${infoWindow}</b><br /> ${this._translate.instant('tab3.map.another')} `).openPopup();
        }
    }
}
