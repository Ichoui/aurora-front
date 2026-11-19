import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import type { AnimationItem } from 'lottie-web';
import { type AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrl: 'tabs.page.scss',
  // Keep Ionic's cached outlet reachable during change detection.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, LottieComponent, TranslatePipe],
})
export class TabsPage {
  readonly weatherAnimation: AnimationOptions = { path: 'assets/lotties/lottie-partly-cloudy-day.json', autoplay: true, loop: true };
  readonly settingsAnimation: AnimationOptions = { path: 'assets/lotties/lottie-settings.json', autoplay: true, loop: true };

  setSettingsAnimationSpeed(animation: AnimationItem): void {
    animation.setSpeed(0.4);
  }
}
