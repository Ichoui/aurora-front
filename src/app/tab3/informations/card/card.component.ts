import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonCard, IonCardContent, IonCardHeader, IonIcon } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: '../informations.page.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonCardHeader, IonCard, IonIcon, TranslatePipe, IonCardContent],
})
export class CardComponent {
  readonly visibility = input.required<{
    index: number;
    tabOpen: number[];
  }>();
  readonly block = input.required<string>();
  readonly value = input.required<string>();
  readonly classList = input<string>();
  readonly list = input<string[]>();
  readonly annecdotes = input<string[]>();
  readonly extra = input<string>();

  isOpen(): boolean {
    return this.visibility().tabOpen.includes(this.visibility().index);
  }
}
