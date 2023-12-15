import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuroraService } from '../../aurora.service';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { manageDates } from '../../models/utils';
import { HourClock } from '../../models/weather';

interface IPolesUrl {
  url: string;
  time_tag: string;
}
export enum Pole {
  NORTH = 'north',
  SOUTH = 'south',
}

const SWPC_URL_PREFIX = 'https://services.swpc.noaa.gov/';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() ovation: boolean;
  @Input() locale: string;
  @Input() hourClock: HourClock;

  @Input() cgu = false;
  @Input() canvasInput = false;
  loader = false;

  pole = Pole;

  tabNorth = [];
  minNorth = 0;
  maxNorth = 0;
  indexNorth = 0;

  tabSouth = [];
  minSouth = 0;
  maxSouth = 0;
  indexSouth = 0;

  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private _modalController: ModalController, private _auroraService: AuroraService, private _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.ovation) {
      // https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
      this.loadPoles(Pole.NORTH);
      this.loadPoles(Pole.SOUTH);
    }
  }

  close(): void {
    void this._modalController.dismiss(null, 'cancel');
  }

  /**
   * @index {number} Index de l'image dans le tableau
   * @pole {string}
   * Calcule lorsqu'on bouge l'item ion-range l'image à afficher en fonction de la valeur
   */
  valuePolesChange(index: number, pole: Pole): void {
    pole === Pole.NORTH ? (this.indexNorth = index) : (this.indexSouth = index);
  }

  /**
   * @pole {Pole} north / south
   * Récupére le service pour afficher pole north / south
   */
  loadPoles(pole: Pole): void {
    // TODO loader quand l'API met du temps à se load
    this._auroraService
      .getPoles$(pole)
      .pipe(first())
      .subscribe((resp: IPolesUrl[]) => {
        if (pole === Pole.NORTH) {
          this.maxNorth = resp.length;
          resp.forEach(snapshot => {
            this.tabNorth.push({ url: SWPC_URL_PREFIX + snapshot.url, time: snapshot.time_tag });
          });
          this.tabNorth.reverse();
          this.valuePolesChange(0, Pole.NORTH);
        }
        if (pole === Pole.SOUTH) {
          this.maxSouth = resp.length;
          resp.forEach(snapshot => this.tabSouth.push({ url: SWPC_URL_PREFIX + snapshot.url, time: snapshot.time_tag }));
          this.tabSouth.reverse();
          this.valuePolesChange(0, Pole.SOUTH);
          return;
        }
        this.loader = true;
        this._cdr.markForCheck();
      });
  }

  momentDate(date: string): string {
    return moment(date).locale(this.locale).format('dddd');
  }

  // est-ce que hour est en UTC ou non ?
  momentHour(hour: string): string | moment.Moment {
    // TODO est-ce qu'on a besoin de this.locale ici ? Sinon remonter la chaine et le supprimer où c'est nécessaire
    // console.log(moment(hour));
    // console.log(hour);
    // console.log(moment.utc(hour).local().format('HH:mm'));
    // vérifier les dates UTC

    // loop sur console.log ?????
    // console.log(this.hourClock);
    manageDates(hour, this.hourClock === HourClock.TWENTYFOUR ? 'HH[h]mm' : 'hh:mm A');
    return moment
      .utc(hour)
      .local()
      .format(this.hourClock === HourClock.TWENTYFOUR ? 'HH[h]mm' : 'hh:mm A');
  }
}
