import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuroraService } from '../../aurora.service';
import { finalize, first, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import * as moment from 'moment';
import { HourClock, MeasureUnits } from '../../models/weather';
import { ELocales } from '../../models/locales';
import { SolarWind } from '../../models/aurorav3';

interface IPolesUrl {
  url: string;
  time_tag: string;
  speed?: number;
}
export enum Pole {
  NORTH = 'north',
  SOUTH = 'south',
}

const SWPC_URL_PREFIX = 'https://services.swpc.noaa.gov';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() ovation: boolean;
  @Input() locale: ELocales;
  @Input() measureUnit: MeasureUnits;
  @Input() hourClock: HourClock;

  @Input() cgu = false;
  @Input() canvasInput = false;

  loader: boolean = false;
  pole = Pole;

  partialTabNorth: Partial<IPolesUrl>[] = [];
  tabNorth: IPolesUrl[] = [];
  indexNorth: number = 0;

  partialTabSouth: Partial<IPolesUrl>[] = [];
  tabSouth: IPolesUrl[] = [];
  indexSouth: number = 0;
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private _modalController: ModalController, private _auroraService: AuroraService, private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.ovation) {
      // https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
      combineLatest([this.loadPoles(Pole.NORTH), this.loadPoles(Pole.SOUTH)])
        .pipe(
          switchMap(([north]) => this._auroraService.getForecastSolarwind7d$(north[0]['time_tag'])), // Here we need the first element time_tag, because on backend we slice the big solarwind array
          map(solarWind => solarWind.reverse()),
          tap(solarWind => {
            this.tabNorth = this._getElementsAvecTimeTagEquivalent(this.partialTabNorth, solarWind);
            this.tabSouth = this._getElementsAvecTimeTagEquivalent(this.partialTabSouth, solarWind);
          }),
          finalize(() => {
            this.loader = true;
            this._cdr.markForCheck();
          }),
        )
        .subscribe();
    }
  }

  /**
   Méthode pour créer un nouveau tableau avec les éléments correspondants, perfs pourrie mais bon on prend quand même !
*/
  private _getElementsAvecTimeTagEquivalent(pole: Partial<IPolesUrl>[], solar: SolarWind[]): IPolesUrl[] {
    const result: IPolesUrl[] = [];

    for (const poleElement of pole) {
      const poleTimeTag = moment.utc(poleElement.time_tag).toISOString(); // Mettre au format UTC car l'un l'est déjà, l'autre est au format GMT
      for (const solarElement of solar) {
        const solarTimeTag = moment.utc(solarElement.time_tag).toISOString();
        if (poleTimeTag === solarTimeTag) {
          result.push({
            time_tag: poleTimeTag,
            url: poleElement.url,
            speed: solarElement.speed,
          });
          break; // Sortir de la boucle une fois qu'une correspondance est trouvée
        }
      }
    }

    return result;
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
   * Récupère le service pour créer des array avec la valeur des URL avant de les croiser
   */
  loadPoles(pole: Pole): Observable<unknown> {
    return this._auroraService.getPoles$(pole).pipe(
      first(),
      tap((resp: IPolesUrl[]) => {
        if (pole === Pole.NORTH) {
          resp.forEach(snapshot => this.partialTabNorth.push({ url: SWPC_URL_PREFIX + snapshot.url, time_tag: snapshot.time_tag }));
          this.partialTabNorth.reverse();
          this.valuePolesChange(0, Pole.NORTH);
          return;
        }
        if (pole === Pole.SOUTH) {
          resp.forEach(snapshot => this.partialTabSouth.push({ url: SWPC_URL_PREFIX + snapshot.url, time_tag: snapshot.time_tag }));
          this.partialTabSouth.reverse();
          this.valuePolesChange(0, Pole.SOUTH);
          return;
        }
      }),
    );
  }
}
