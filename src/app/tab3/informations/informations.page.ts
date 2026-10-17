import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Data } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { IonCard, IonCardContent, IonCardHeader, IonContent } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { CardComponent } from './card/card.component';

interface InfoBlocks {
  id: number;
  block: string;
  value: string;
  classList?: string;
  list?: string[];
  extra?: string;
  annecdotes?: string[];
}

@Component({
  selector: 'app-informations',
  templateUrl: './informations.page.html',
  styleUrl: './informations.page.scss',
  imports: [TranslatePipe, HeaderComponent, IonContent, RouterLink, IonCard, IonCardHeader, IonCardContent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { id: 'informations' },
})
export class InformationsPage implements ViewWillEnter, ViewWillLeave {
  private readonly _route = inject(ActivatedRoute);
  private readonly _cdr = inject(ChangeDetectorRef);

  private readonly _document = inject(DOCUMENT);
  private _scrollTimer?: ReturnType<typeof setTimeout>;

  tabOpen: number[] = [0];
  routeData: Data = {};

  cardId = '';
  private readonly _destroyRef = inject(DestroyRef);

  firstblockCard: InfoBlocks[] = [
    { id: 1, block: 'firstblock', value: 'perception' },
    { id: 2, block: 'firstblock', value: 'how' },
    { id: 3, block: 'firstblock', value: 'forecast' },
    { id: 4, block: 'firstblock', value: 'capricious' },
    { id: 5, block: 'firstblock', value: 'colors' },
    { id: 6, block: 'firstblock', value: 'where' },
    { id: 7, block: 'firstblock', value: 'corona' },
    { id: 8, block: 'firstblock', value: 'steve' },
    {
      id: 9,
      block: 'firstblock',
      value: 'legends',
      classList: 'countries',
      list: ['alaska', 'canada', 'sami', 'finlande', 'france'],
      extra: 'conclusion',
    },
    { id: 10, block: 'firstblock', value: 'annecdotes', classList: 'annecdotes', annecdotes: ['une', 'deux', 'trois', 'quatre', 'cinq', 'six'] },
  ];

  secondblockCard: InfoBlocks[] = [
    { id: 11, block: 'secondblock', value: 'kp' },
    { id: 12, block: 'secondblock', value: 'solarWind' },
    { id: 13, block: 'secondblock', value: 'cmi' },
    { id: 14, block: 'secondblock', value: 'solarCycle' },
  ];

  helpcenterCard: InfoBlocks[] = [
    { id: 15, block: 'helpcenter', value: 'help' },
    { id: 16, block: 'helpcenter', value: 'noSwpcData' },
    { id: 17, block: 'helpcenter', value: 'suggest' },
  ];

  constructor() {
    this._route.data.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((v: Data) => {
      this.routeData = v;
      this._cdr.markForCheck();
    });
    this._destroyRef.onDestroy(() => {
      if (this._scrollTimer) clearTimeout(this._scrollTimer);
    });
  }

  /**
   * On regénère la vue à chaque fois qu'on vient sur la page, afin de pouvoir ouvrir & scroll jusqu'à l'ancre choisie
   * */
  ionViewWillEnter(): void {
    const cardId = this._route.snapshot.queryParamMap.get('cardId');
    if (cardId) {
      this.tabOpen = [];
      this.cardId = cardId;
      this.scroll();
    }
    this._cdr.markForCheck();
  }

  /*
   * Annule le défilement différé en quittant la vue mise en cache par Ionic
   * */
  ionViewWillLeave(): void {
    if (this._scrollTimer) clearTimeout(this._scrollTimer);
  }

  scroll(): void {
    this.visibility(Number(this.cardId));
    if (this._scrollTimer) clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(() => {
      const elmnt = this._document.getElementById(this.cardId);
      elmnt?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      // Workaround; viewportScroll not working properly atm...
      this._cdr.markForCheck();
    }, 250);
  }

  visibility(index: number): void {
    if (this.tabOpen.includes(index)) {
      this.tabOpen = this.tabOpen.filter(f => f !== index);
    } else {
      this.tabOpen = [...this.tabOpen, index];
    }
  }
}
