import { Component } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

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
  styleUrls: ['./informations.page.scss'],
})
export class InformationsPage {
  tabOpen: number[] = [0];
  routeData: Data;

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

  constructor(private _route: ActivatedRoute) {
    this._route.data.subscribe((v: Data) => (this.routeData = v));
  }

  visibility(index: number): void {
    if (this.tabOpen.includes(index)) {
      this.tabOpen = this.tabOpen.filter(f => f !== index);
    } else {
      this.tabOpen = [...this.tabOpen, index];
    }
  }
}
