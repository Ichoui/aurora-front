import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['../informations.page.scss'],
  standalone: true,
  imports: [IonCardHeader, IonCard, IonIcon, TranslateModule, IonCardContent, NgForOf, NgIf],
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
