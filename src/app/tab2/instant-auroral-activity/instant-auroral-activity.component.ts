import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ACEModule, KpCurrent } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { convertUnitMeasure, determineColorsOfValue } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';
import { AuroraEnumColours, Bt, Bz, Density, SolarWind, Speed } from '../../models/aurorav3';

@Component({
  selector: 'app-instant-auroral-activity',
  templateUrl: './instant-auroral-activity.component.html',
  styleUrls: ['./instant-auroral-activity.component.scss'],
})
export class InstantAuroralActivityComponent implements OnInit, OnChanges {
  kpCurrent: KpCurrent;
  density: Density;
  speed: Speed;
  bz: Bz;
  bt: Bt;
  AuroraEnumColours = AuroraEnumColours;

  // nowcastVal: number; // todo will be removed
  @Input() exDataSolarWind: ACEModule; // todo will be removed
  @Input() measureUnit: MeasureUnits;
  @Input() solarWind: SolarWind;
  @Input() nowcastAurora: number;

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

    if (changes?.exDataSolarWind) {
      // TOdo will be removed
      const dataSolarWind = changes.exDataSolarWind.currentValue;

      this.kpCurrent = dataSolarWind['kp:current'];
      // this.nowcast = dataSolarWind['nowcast:local'];
      // this.nowcastVal = this.nowcast.value;
      // void this._storageService.setData('nowcast', this.nowcast.value);
      void this._storageService.setData('current_kp', this.kpCurrent.value);
    }

    if (changes?.solarWind) {
      const solarWind: SolarWind = changes.solarWind.currentValue;

      this.density = {
        value: solarWind.density,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue('density', solarWind.density),
      };

      console.log('bz ', solarWind.bz);
      console.log('bt ', solarWind.bt);
      this.bz = {
        value: solarWind?.bz ?? 0,
        date: new Date(solarWind.time_tag),
        time_tag: new Date(solarWind.time_tag),
        color: determineColorsOfValue('bz', solarWind.bz),
      };
      this.bt = {
        value: solarWind?.bt ?? 0,
        date: new Date(solarWind.time_tag),
        request_date: new Date(solarWind.time_tag),
        color: determineColorsOfValue('bt', solarWind.bt),
      };

      this.speed = {
        value: convertUnitMeasure(solarWind.speed, this.measureUnit),
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
    const reset = function (e) {
      e.target.className = 'star';
      setTimeout(function () {
        e.target.className = 'star star--animated';
      }, 0);
    };
    const stars = document.querySelectorAll('.star');
    for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener('animationend', reset);
    }
  }
}
