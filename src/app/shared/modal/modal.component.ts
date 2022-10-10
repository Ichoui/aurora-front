import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuroraService } from '../../aurora.service';
import { first } from 'rxjs/operators';

export interface IPolesUrl {
  url: string;
}
export enum Pole {
  NORTH = 'north',
  SOUTH = 'south',
}

export const SWPC_URL_PREFIX = 'https://services.swpc.noaa.gov/';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() northPole: string;

  @Input() southPole: string;

  @Input() cgu = false;
  @Input() canvasInput = false;

  pole = Pole;

  tabNorth = [];
  minNorth = 0;
  maxNorth = 0;
  valueNorth = 0;
  datetimeNorth = [];
  hourNorth = '';
  dateNorth = '';

  tabSouth = [];
  minSouth = 0;
  maxSouth = 0;
  valueSouth = 0;
  datetimeSouth = [];
  hourSouth = '';
  dateSouth = '';

  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private _modalController: ModalController, private _auroraService: AuroraService) {}

  ngOnInit() {
    if (this.northPole && this.southPole) {
      this.loadPoles(Pole.NORTH);
      this.loadPoles(Pole.SOUTH);
      this.tabNorth.push(this.northPole);
      this.tabSouth.push(this.southPole);
    }
  }

  close(): void {
    void this._modalController.dismiss(null, 'cancel');
  }

  /**
   * @e {event}
   * @pole {string}
   * Calcule lorsqu'on bouge l'item ion-range l'image à afficher en fonction de la valeur
   * Même chose pour le timing en dessous de l'image
   */
  valuePolesChange(e, pole: Pole): void {
    pole === Pole.NORTH ? (this.valueNorth = e.detail.value) : (this.valueSouth = e.detail.value);
    if (this.datetimeNorth.length > 0 && pole === Pole.NORTH) {
      this.hourNorth = this.datetimeNorth[e.detail.value][0];
      this.dateNorth = this.datetimeNorth[e.detail.value][1];
      return;
    }
    if (this.datetimeSouth.length > 0 && pole === Pole.SOUTH) {
      this.hourSouth = this.datetimeSouth[e.detail.value][0];
      this.dateSouth = this.datetimeSouth[e.detail.value][1];
      return;
    }
  }

  /**
   * @pole {Pole} north / south
   * Récupére le service pour afficher pole north / south
   * Découpe en segment l'url pour récupérer la date et l'heure avant formattage
   */
  loadPoles(pole: Pole): void {
    this._auroraService
      .getPoles$(pole)
      .pipe(first())
      .subscribe((resp: IPolesUrl[]) => {
        if (pole === Pole.NORTH) {
          this.maxNorth = resp.length;
          this.tabNorth = [];
          resp.forEach(snapshot => this.tabNorth.push(SWPC_URL_PREFIX + snapshot.url));
          this.tabNorth.forEach(e => {
            this.splitDatetime(e, pole);
          });
          this.tabNorth.reverse();
        }
        if (pole === Pole.SOUTH) {
          this.maxSouth = resp.length;
          this.tabSouth = [];
          resp.forEach(snapshot => this.tabSouth.push(SWPC_URL_PREFIX + snapshot.url));
          this.tabSouth.forEach(e => {
            this.splitDatetime(e, pole);
          });
          this.tabSouth.reverse();
          return;
        }
      });
  }

  /**
   * @dateToSplit {string} url de type SWPC_URL_PREFIX + images/animations/ovation-south/ovation/images/swpc_aurora_map_s_20191205_2205.jpg
   * @pole {string} North / South
   * Découpe l'url de chaque image contenu dans le callback de chaque pole
   */
  splitDatetime(dateToSplit: string, pole?: Pole): void {
    const fullUrl = dateToSplit.split('/');
    const segmentUrl = fullUrl[9];
    if (segmentUrl) {
      const segmentedSegment = segmentUrl.split('_');
      const date = segmentedSegment[4];
      const hourNotFormatted = segmentedSegment[5];
      const hour = hourNotFormatted.split('.');
      this.formattedDatetime(date, hour[0], pole);
    }
  }

  /**
   * @date {string} format yyyymmdd
   * @hour {string} format hhmm
   * @pole {string} north / south
   * Formatte la date et l'heure pour un affichage clean, à partir d'une string récupérée sur le nom de chaque image
   */
  formattedDatetime(date: string, hour: string, pole: Pole): void {
    const segmentDate = date.split('');
    const day = segmentDate[6] + segmentDate[7];
    const month = segmentDate[4] + segmentDate[5];

    const segmentHour = hour.split('');
    const hr = segmentHour[0] + segmentHour[1];
    const min = segmentHour[2] + segmentHour[3];

    if (pole === Pole.NORTH) {
      const dateNorth = day + '/' + month;
      const hourNorth = hr + ':' + min;
      this.datetimeNorth.push([hourNorth + ' - ', dateNorth]);
      return;
    }

    if (pole === Pole.SOUTH) {
      const dateSouth = day + '/' + month;
      const hourSouth = hr + ':' + min;
      this.datetimeSouth.push([hourSouth + ' - ', dateSouth]);
      return;
    }
  }
}
