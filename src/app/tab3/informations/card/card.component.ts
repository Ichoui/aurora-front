import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['../informations.page.scss'],
})
export class CardComponent {
  @Input() block: string;
  @Input() value: string;
  @Input() classList: string;
  @Input() list: string[];
  @Input() extra: string;
}
