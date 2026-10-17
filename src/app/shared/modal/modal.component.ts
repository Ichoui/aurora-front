import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { RangeCustomEvent } from '@ionic/angular';
import { IonButton, IonButtons, IonContent, IonIcon, IonPopover, IonRange, IonTitle, IonToolbar, ModalController } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import moment from 'moment';
import type { Observable } from 'rxjs';
import { combineLatest, finalize, first, map, switchMap, tap } from 'rxjs';
import { AuroraService } from '../../aurora.service';
import type { SolarWindSpeed } from '../../models/aurorav3';
import { Pole } from '../../models/aurorav3';
import { ELocales } from '../../models/locales';
import { HourClock, MeasureUnits } from '../../models/weather';
import { MomentDatePipe } from './moment-date.pipe';
import { MomentHourPipe } from './moment-hour.pipe';

interface IPolesUrl {
  url: string;
  time_tag: string;
  speed?: number;
}

const SWPC_URL_PREFIX = 'https://services.swpc.noaa.gov';

@Component({
  selector: 'app-modal',
  imports: [IonContent, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon, IonPopover, IonRange, TranslatePipe, MomentHourPipe, MomentDatePipe],
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit {
  private readonly _modalController = inject(ModalController);
  private readonly _auroraService = inject(AuroraService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);

  readonly ovation = input(false);
  readonly locale = input(ELocales.EN);
  readonly measureUnit = input(MeasureUnits.METRIC);
  readonly hourClock = input(HourClock.TWENTYFOUR);

  readonly cgu = input(false);
  readonly canvasInput = input(false);

  loader: boolean = false;
  pole = Pole;

  partialTabNorth: IPolesUrl[] = [];
  tabNorth: IPolesUrl[] = [];
  indexNorth: number = 0;

  partialTabSouth: IPolesUrl[] = [];
  tabSouth: IPolesUrl[] = [];
  indexSouth: number = 0;

  ngOnInit(): void {
    if (this.ovation()) {
      // https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
      combineLatest([this.loadPoles(Pole.NORTH), this.loadPoles(Pole.SOUTH)])
        .pipe(
          switchMap(([north]) => this._auroraService.getForecastSolarwind7d$(north[0]?.time_tag ?? '')),
          map(solarWind => solarWind.reverse()),
          tap(solarWind => {
            this.tabNorth = this._getElementsAvecTimeTagEquivalent(this.partialTabNorth, solarWind);
            this.tabSouth = this._getElementsAvecTimeTagEquivalent(this.partialTabSouth, solarWind);
          }),
          finalize(() => {
            this.loader = true;
            this._cdr.markForCheck();
          }),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe({
          error: (error: unknown) => {
            console.error('Request failed', error);
          },
        });
    }
  }

  /**
   Méthode pour créer un nouveau tableau avec les éléments correspondants, perfs pourrie mais bon on prend quand même !
*/
  private _getElementsAvecTimeTagEquivalent(pole: IPolesUrl[], solar: SolarWindSpeed[]): IPolesUrl[] {
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
   * @index {event} Index de l'image dans le tableau
   * @pole {string}
   * Calcule lorsqu'on bouge l'item ion-range l'image à afficher en fonction de la valeur
   */
  valuePolesChange(event: RangeCustomEvent | null, pole: Pole, index = 0): void {
    const value = event?.detail.value;
    const nextIndex = typeof value === 'number' ? value : index;
    if (pole === Pole.NORTH) this.indexNorth = nextIndex;
    else this.indexSouth = nextIndex;
  }

  /**
   * @pole {Pole} north / south
   * Récupère le service pour créer des array avec la valeur des URL avant de les croiser
   */
  loadPoles(pole: Pole): Observable<IPolesUrl[]> {
    return this._auroraService.getPoles$(pole).pipe(
      first(),
      tap((resp: IPolesUrl[]) => {
        if (pole === Pole.NORTH) {
          resp.forEach(snapshot => this.partialTabNorth.push({ url: SWPC_URL_PREFIX + snapshot.url, time_tag: snapshot.time_tag }));
          this.partialTabNorth.reverse();
          this.valuePolesChange(null, Pole.NORTH, 0);
          return;
        }
        if (pole === Pole.SOUTH) {
          resp.forEach(snapshot => this.partialTabSouth.push({ url: SWPC_URL_PREFIX + snapshot.url, time_tag: snapshot.time_tag }));
          this.partialTabSouth.reverse();
          this.valuePolesChange(null, Pole.SOUTH, 0);
          return;
        }
      }),
    );
  }
}
