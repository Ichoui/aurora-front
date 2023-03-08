import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StorageService } from '../../storage.service';
import { convertUnitMeasure, determineColorsOfValue, roundTwoNumbers } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';
import { AuroraEnumColours, Bt, Bz, Density, KpCurrent, SolarWind, Speed } from '../../models/aurorav3';

@Component({
  selector: 'app-instant-auroral-activity',
  templateUrl: './instant-auroral-activity.component.html',
  styleUrls: ['./instant-auroral-activity.component.scss'],
})
export class InstantAuroralActivityComponent implements OnInit, OnChanges {
  density: Density;
  speed: Speed;
  bz: Bz;
  bt: Bt;
  AuroraEnumColours = AuroraEnumColours;

  @Input() measureUnit: MeasureUnits;
  @Input() solarWind: SolarWind;
  @Input() nowcastAurora: number;
  @Input() kpCurrent: KpCurrent;

  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this._auroraBackground();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.unit?.firstChange && changes?.unit?.currentValue !== changes?.unit?.previousValue) {
      this.speed = {
        ...this.speed,
        value: convertUnitMeasure(this.speed.value, this.measureUnit),
        color: determineColorsOfValue('speed', convertUnitMeasure(this.speed.value, this.measureUnit), this.measureUnit),
        unit: this.measureUnit,
      };
    }

    if (changes?.kpCurrent) {
      const kpCurrent = changes.kpCurrent.currentValue;
      this.kpCurrent = {
        k_index: !isNaN(kpCurrent.k_index) ? roundTwoNumbers(kpCurrent.k_index) : null,
        time_tag: kpCurrent.time_tag,
        color: determineColorsOfValue('kp', roundTwoNumbers(kpCurrent.k_index)),
      };
    }

    if (changes?.solarWind) {
      const solarWind: SolarWind = changes.solarWind.currentValue;
      this.density = {
        value: !isNaN(solarWind.density) ? solarWind.density : null,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue('density', solarWind.density),
      };
      this.bz = {
        value: !isNaN(solarWind.bz) ? solarWind.bz : null,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue('bz', solarWind.bz),
      };
      this.bt = {
        value: !isNaN(solarWind.bt) ? solarWind.bt : null,
        date: new Date(solarWind.time_tag),
        request_date: new Date(solarWind.time_tag),
        color: determineColorsOfValue('bt', solarWind.bt),
      };

      this.speed = {
        value: !isNaN(solarWind.speed) ? convertUnitMeasure(solarWind.speed, this.measureUnit) : null,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue('speed', convertUnitMeasure(solarWind.speed, this.measureUnit), this.measureUnit),
        unit: this.measureUnit,
      };
    }
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
