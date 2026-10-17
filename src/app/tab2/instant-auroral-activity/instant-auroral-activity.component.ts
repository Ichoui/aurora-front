import { NgClass, NgTemplateOutlet } from '@angular/common';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, ElementRef, inject, Injector, input } from '@angular/core';
import { Router } from '@angular/router';
import { IonPopover, PopoverController } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import type { Bt, Bz, Density, KpCurrent, SolarWind, Speed } from '../../models/aurorav3';
import { AuroraEnumColours, SolarWindTypes } from '../../models/aurorav3';
import { convertUnitMeasure, determineColorsOfValue, roundTwoNumbers } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';
import { PlaceholderDataComponent } from '../../shared/placeholders/placeholder-data/placeholder-data.component';
import { ForecastLeadTimePipe } from './forecast-lead-time.pipe';

@Component({
  selector: 'app-instant-auroral-activity',
  templateUrl: './instant-auroral-activity.component.html',
  styleUrl: './instant-auroral-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IonPopover, NgTemplateOutlet, NgClass, PlaceholderDataComponent, ForecastLeadTimePipe],
})
export class InstantAuroralActivityComponent implements OnInit, OnChanges {
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _router = inject(Router);
  private readonly _popover = inject(PopoverController);

  density: Density | null = null;
  speed: Speed | null = null;
  bz: Bz | null = null;
  bt: Bt | null = null;
  AuroraEnumColours = AuroraEnumColours;

  readonly measureUnit = input(MeasureUnits.METRIC);
  readonly solarWind = input<SolarWind | null>(null);
  readonly nowcastAurora = input<number | null>(null);
  readonly kpCurrent = input<KpCurrent | null>(null);
  readonly currentKp = computed(() => {
    const kp = this.kpCurrent();
    if (!kp) return null;
    const value = kp.k_index ?? kp.kpIndex;
    return {
      kpIndex: value != null && Number.isFinite(value) ? roundTwoNumbers(value) : null,
      timeTag: kp.time_tag ?? kp.timeTag,
      color: determineColorsOfValue('kp', roundTwoNumbers(value)),
    };
  });
  readonly loading = input(false);

  ngOnInit(): void {
    this._auroraBackground();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.speed && !changes['measureUnit']?.firstChange && changes['measureUnit']?.currentValue !== changes['measureUnit']?.previousValue) {
      this.speed = {
        ...this.speed,
        value: convertUnitMeasure(this.speed?.value, this.measureUnit()),
        color: determineColorsOfValue(SolarWindTypes.SPEED, convertUnitMeasure(this.speed?.value, this.measureUnit()), this.measureUnit()),
        unit: this.measureUnit(),
      };
    }

    const solarWind = this.solarWind();
    if (solarWind && changes['solarWind']) {
      this.density = {
        value: solarWind.density,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue(SolarWindTypes.DENSITY, solarWind.density),
      };
      this.bz = {
        value: solarWind.bz,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue(SolarWindTypes.BZ, solarWind.bz),
      };
      this.bt = {
        value: solarWind.bt,
        date: new Date(solarWind.time_tag),
        request_date: new Date(solarWind.time_tag),
        color: determineColorsOfValue(SolarWindTypes.BT, solarWind.bt),
      };
      this.speed = {
        value: convertUnitMeasure(solarWind.speed, this.measureUnit()),
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue(SolarWindTypes.SPEED, convertUnitMeasure(solarWind.speed, this.measureUnit()), this.measureUnit()),
        unit: this.measureUnit(),
      };
    }
    this._cdr.markForCheck();
  }

  documentation(cardId: number, path: string): void {
    this._popover.dismiss().then(() => {
      return this._router.navigate(['tabs', 'tab3', path], { queryParams: { cardId } });
    });
  }

  /**
   * Fait scintiller les étoiles en background
   * */
  private _auroraBackground(): void {
    afterNextRender(
      () => {
        const stars = this._element.nativeElement.querySelectorAll<HTMLElement>('.star');
        for (const star of stars) star.style.animationIterationCount = 'infinite';
      },
      { injector: this._injector },
    );
  }
}
