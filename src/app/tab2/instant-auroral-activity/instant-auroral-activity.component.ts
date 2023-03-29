import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StorageService } from '../../storage.service';
import { convertUnitMeasure, determineColorsOfValue, roundTwoNumbers } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';
import { AuroraEnumColours, Bt, Bz, Density, KpCurrent, SolarWind, SolarWindTypes, Speed } from '../../models/aurorav3';

@Component({
  selector: 'app-instant-auroral-activity',
  templateUrl: './instant-auroral-activity.component.html',
  styleUrls: ['./instant-auroral-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstantAuroralActivityComponent implements OnInit, OnChanges {
  density: Density;
  speed: Speed;
  bz: Bz;
  bt: Bt;
  AuroraEnumColours = AuroraEnumColours;

  random = () => (Math.floor(Math.random() * 3) + 2) // max is 3, so 0 1 2 3, and add 2 for each

  @Input() measureUnit: MeasureUnits;
  @Input() solarWind: SolarWind;
  @Input() nowcastAurora: number;
  @Input() kpCurrent: KpCurrent;
  @Input() loading = false;

  constructor(private _storageService: StorageService, private _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this._auroraBackground();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.measureUnit?.firstChange && changes?.measureUnit?.currentValue !== changes?.measureUnit?.previousValue) {
      this.speed = {
        ...this.speed,
        value: convertUnitMeasure(this.speed?.value, this.measureUnit),
        color: determineColorsOfValue(SolarWindTypes.SPEED, convertUnitMeasure(this.speed?.value, this.measureUnit), this.measureUnit),
        unit: this.measureUnit,
      };
    }

    if (changes?.kpCurrent?.currentValue) {
      const kpCurrent = changes.kpCurrent.currentValue;
      this.kpCurrent = {
        kpIndex: !isNaN(kpCurrent.k_index) ? roundTwoNumbers(kpCurrent.k_index) : null,
        timeTag: kpCurrent.time_tag,
        color: determineColorsOfValue('kp', roundTwoNumbers(kpCurrent.k_index)),
      };
    }

    if (changes?.solarWind?.currentValue) {
      const solarWind: SolarWind = changes.solarWind.currentValue;
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
        value: convertUnitMeasure(solarWind.speed, this.measureUnit),
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue(SolarWindTypes.SPEED, convertUnitMeasure(solarWind.speed, this.measureUnit), this.measureUnit),
        unit: this.measureUnit,
      };
    }
    this._cdr.markForCheck()
  }

  /**
   * Fait scintiller les étoiles en background
   * */
  private _auroraBackground(): void {
    const reset = e => {
      e.target.className = 'star';
      setTimeout(() => {
        e.target.className = 'star star--animated';
      }, 0);
    };
    const stars = document.querySelectorAll('.star');
    for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener('animationend', reset);
    }
  }
}
