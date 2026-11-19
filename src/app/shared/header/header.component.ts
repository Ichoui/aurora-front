import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonToolbar } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, IonToolbar, IonHeader, IonBackButton, IonButtons, TranslatePipe],
})
export class HeaderComponent {
  readonly titre = input('');
  readonly backUrl = input<string>();
}
