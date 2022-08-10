import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { icon, Map, Marker, marker, tileLayer, ZoomPanOptions } from 'leaflet';
import { CodeLocalisation, Coords } from '../../models/cities';
import { Languages, SelectContents } from '../../models/languages';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../shared/modal/modal.component';
// import { Browser } from '@capacitor/core'; // TODO
import { Unit, units } from '../../models/weather';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  kpindex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  localisation: string;
  notifications = false;
  notifKp;

  marker: Marker;
  coords: Coords = {} as any;
  map: Map;

  language = 'fr';
  languages: SelectContents[] = Languages;

  unit: Unit = Unit.METRIC;
  units: SelectContents[] = units;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('map_canvas', { static: false }) mapElement: ElementRef;

  constructor(
    private _storage: Storage,
    private _router: Router,
    private _geoloc: Geolocation,
    private _navController: NavController,
    private _modalController: ModalController,
    private _translateService: TranslateService
  ) {}

  /**
   * Invoqué au premier chargement de la page
   * */
  ngOnInit() {
    this.minimapLocation();
  }

  /**
   * Invoqué à chaque retour sur la page
   * */
  ionViewWillEnter() {
    this.minimapLocation();
    this.getLanguage();
    this.getUnit();
    // this.storageNotif();
  }

  /**
   *  Si la localisation n'a jamais été remplie, on set avec "currentLocation" && on localise l'utilisateur pour la minimap
   *  Sinon si la page a déjà été chargée une fois, on ne fait qu'ajouter un marker à la map
   * Sinon charge la map avec les lat/long envoyée depuis la page popup (Marker et Ville Préselectionnées)
   * */
  minimapLocation() {
    // localisation format json ? {code: 'currentlocation', lat: 41.1, long: 10.41} --> pas besoin de call à chaque fois lat et long comme ça...
    this._storage.get('localisation').then((codeLocation: CodeLocalisation) => {
      if (!codeLocation) {
        this.userLocalisation();
      } else {
        this.mapInit(codeLocation.lat, codeLocation.long);
      }
    });
  }

  /**
   * localise l'utilisateur et lance l'affichage de la map
   * */
  userLocalisation() {
    this._geoloc
      .getCurrentPosition()
      .then(resp => {
        this.coords = resp.coords;
        this.mapInit(this.coords.latitude, this.coords.longitude);
        this._storage.set('localisation', {
          code: 'currentLocation',
          lat: this.coords.latitude,
          long: this.coords.longitude,
        });
      })
      .catch(error => {
        console.warn('Error getting location', error);
      });
  }

  /**
   * @param lat
   * @param long
   * Création de la map
   * */
  mapInit(lat: any, long: any): void {
    if (this.map) { this.map.remove(); }
    const mapOpt: ZoomPanOptions = {
      noMoveStart: false,
      animate: false,
    };

    this.map = new Map('map_canvas').setView([lat, long], 10, mapOpt);

    this.addMarker(lat, long);

    this.map.dragging.disable();
    this.map.zoomControl.remove();

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' <div style="font-size: 1em">&copy;<a href="https://www.openstreetmap.org/copyright">OSM</a></div>',
    }).addTo(this.map);
  }

  /**
   * @param lat
   * @param long
   * Création d'un marker sur la map
   * */
  addMarker(lat: any, long: any) {
    if (this.marker) this.marker.remove();
    this.marker = marker([lat, long], {
      icon: icon({
        iconSize: [25, 25],
        iconUrl: 'assets/img/marker-icon.png',
        shadowUrl: 'assets/img/marker-shadow.png',
      }),
    }).addTo(this.map);
  }

  async CGU() {
    const modal = await this._modalController.create({
      component: ModalComponent,
      componentProps: {
        cgu: true,
      },
    });
    return await modal.present();
  }

  /**
   * Sélection de la langue à utiliser et update du storage
   * */
  setLanguage(event) {
    this.language = event.detail.value;
    this._translateService.use(this.language);
    this._storage.set('language', this.language);
  }

  /**
   * Sélection de l'unité Imperiale ou Métrique
   * */
  setUnit(event): void {
    this.unit = event.detail.value;
    this._storage.set('unit', this.unit);
  }

  getLanguage(): void {
    this._storage.get('language').then(lg => {
      this._translateService.use(lg);
      this.language = lg;
    });
  }

  getUnit(): void {
    this._storage.get('unit').then(unit => {
      this.unit = unit;
    });
  }

  /**
   * @param url {string} Url navigable
   * Demande à l'utilisateur d'ouvrir dans l'application au choix le lien
   **/
  openUrl(url: string): void {
    // Browser.open({ url }); // TODO
  }

  // need backend
  // storageNotif(): void {
  //   this.storage.get("notifications_active").then(
  //     (notif) => {
  //       this.notifications = notif;
  //       if (notif) this.storageKP();
  //     },
  //     (error) => console.warn("Problème de récupération notification", error)
  //   );
  // }

  // storageKP(): void {
  //   this.storage.get("kp_notif").then(
  //     (kp) => {
  //       this.notifKp = kp;
  //     },
  //     (error) => console.warn("Problème de récupération notification", error)
  //   );
  // }

  // activeNotif(e): void {
  //   this.notifications = e.detail.checked;
  //   this.storage.set("notifications_active", this.notifications);
  // }

  // selectedKp(choice?: any): void {
  //   if (choice) {
  //     this.notifKp = choice.detail.value;
  //     this.storage.set("kp_notif", this.notifKp);
  //   }
  // }
}
