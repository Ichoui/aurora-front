import { Component } from '@angular/core';
import { ELocales, Locales, SelectContents } from '../../models/locales';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Unit, units } from '../../models/weather';
import { StorageService } from '../../storage.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  kpindex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  notifications = false;
  notifKp;

  locale = ELocales.FR;
  readonly locales: SelectContents[] = Locales;

  unit = Unit.METRIC;
  readonly units: SelectContents[] = units;

  constructor(
    private _storageService: StorageService,
    private _router: Router,
    private _navController: NavController,
    private _modalController: ModalController,
    private _translateService: TranslateService,
  ) {}

  /**
   * Invoqué à chaque retour sur la page
   * */
  ionViewWillEnter() {
    this._getLocale();
    this._getUnit();
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
  setLocale(event) {
    this.locale = event.detail.value;
    this._translateService.use(this.locale);
    void this._storageService.setData('locale', this.locale);
  }

  /**
   * Sélection de l'unité Imperiale ou Métrique
   * */
  setUnit(event): void {
    this.unit = event.detail.value;
    void this._storageService.setData('unit', this.unit);
  }

  private _getLocale(): void {
    this._storageService.getData('locale').then((locale: ELocales) => {
      this._translateService.use(locale);
      this.locale = locale;
    });
  }

  private _getUnit(): void {
    this._storageService.getData('unit').then((unit: Unit) => {
      this.unit = unit;
    });
  }

  /**
   * @param url {string} Url navigable
   * Demande à l'utilisateur d'ouvrir dans l'application au choix le lien
   **/
  openUrl(url: string): void {
    void Browser.open({ url });
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
