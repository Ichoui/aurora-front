import type { OnInit } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import type { AnimationItem } from 'lottie-web';
import { LottieComponent, type AnimationOptions } from 'ngx-lottie';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrl: 'tabs.page.scss',
  // Keep Ionic's cached outlet reachable during change detection.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, TranslatePipe, RouterLink, LottieComponent],
})
export class TabsPage implements OnInit {
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _injector = inject(Injector);
  readonly auroraLogo = viewChild<unknown, ElementRef<HTMLElement>>('auroraLogo', { read: ElementRef });

  lottieConfigWeather: AnimationOptions = { path: 'assets/lotties/lottie-partly-cloudy-day.json', autoplay: true, loop: true };
  lottieConfigSettings: AnimationOptions = { path: 'assets/lotties/lottie-settings.json', autoplay: true, loop: true };
  readonly activeRoute = signal<number | null>(null);

  ngOnInit(): void {
    this._interval();
    this.underlineCurrentTab();
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(event => this.underlineCurrentTab(undefined, event.urlAfterRedirects));
  }

  animationCreated(animationItem: AnimationItem): void {
    animationItem.setSpeed(0.4);
  }

  /** Barre colorée sous l'onglet actif. */
  underlineCurrentTab(index?: number, pathObs?: string): void {
    const path = pathObs ?? this._router.url;
    if (path.startsWith('/tabs/tab1') || index === 1) this.activeRoute.set(1);
    else if (path.startsWith('/tabs/tab2') || index === 2) this.activeRoute.set(null);
    else if (path.startsWith('/tabs/tab3') || index === 3) this.activeRoute.set(3);
  }

  /** Attend le rendu du bouton ; le débordement du logo est géré par son shadow part CSS. */
  private _interval(): void {
    afterNextRender(
      () => {
        this.auroraLogo()?.nativeElement.classList.add('aurora-logo');
      },
      { injector: this._injector },
    );
  }
}
