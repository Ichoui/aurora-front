import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['../informations.page.scss'],
})
export class CardComponent {
  @Input() visibility: { index: number; tabOpen: number[] };
  @Input() block: string;
  @Input() value: string;
  @Input() classList?: string;
  @Input() list?: string[];
  @Input() annecdotes?: string[];
  @Input() extra?: string;

  isOpen(): boolean {
    return this.visibility.tabOpen.includes(this.visibility.index);
  }
}
