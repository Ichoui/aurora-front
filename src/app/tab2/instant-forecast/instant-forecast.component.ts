import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ACEModule, KpCurrent, Nowcast } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { convertUnit, determineColorsOfValue } from '../../models/utils';
import { Unit } from '../../models/weather';
import { AuroraEnumColours, Bt, Bz, Density, SolarWind, Speed } from '../../models/aurorav3';

@Component({
  selector: 'app-instant-forecast',
  templateUrl: './instant-forecast.component.html',
  styleUrls: ['./instant-forecast.component.scss'],
})
export class InstantForecastComponent implements OnInit, OnChanges {
  kpCurrent: KpCurrent;

  density: Density;
  nowcast: Nowcast;
  speed: Speed;
  bz: Bz;
  bt: Bt;

  nowcastVal: number;
  AuroraEnumColours = AuroraEnumColours;

  @Input() unit: Unit;
  @Input() exDataSolarWind: ACEModule;
  @Input() solarWind: SolarWind;

  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this._auroraBackground();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.unit?.firstChange && changes?.unit?.currentValue !== changes?.unit?.previousValue) {
      this.speed = {
        ...this.speed,
        value: convertUnit(this.speed.value, this.unit),
        color: determineColorsOfValue('speed', convertUnit(this.speed.value, this.unit), this.unit),
        unit: this.unit,
      };
    }

    if (changes?.exDataSolarWind) {
      // TOdo will be removed
      const dataSolarWind = changes.exDataSolarWind.currentValue;

      this.kpCurrent = dataSolarWind['kp:current'];
      this.nowcast = dataSolarWind['nowcast:local'];
      this.nowcastVal = this.nowcast.value;
      void this._storageService.setData('nowcast', this.nowcast.value);
      void this._storageService.setData('current_kp', this.kpCurrent.value);
    }

    if (changes?.solarWind) {
      const solarWind: SolarWind =changes.solarWind.currentValue

      this.density = {
        value: solarWind.density,
        date: new Date((solarWind as SolarWind).time_tag),
        time_tag: new Date((solarWind as SolarWind).time_tag),
        color: determineColorsOfValue('density', solarWind.density),
      };

      this.bz = {
        value: solarWind.bz,
        date: new Date((solarWind as SolarWind).time_tag),
        time_tag: new Date((solarWind as SolarWind).time_tag),
        color: determineColorsOfValue('bz', solarWind.bz),
      };
      this.bt = {
        value: solarWind.bt,
        date: new Date((solarWind as SolarWind).time_tag),
        request_date: new Date((solarWind as SolarWind).time_tag),
        color: determineColorsOfValue('bt', solarWind.bt),
      };

      this.speed = {
        value: convertUnit(solarWind.speed, this.unit),
        date: new Date((solarWind as SolarWind).time_tag),
        time_tag: new Date((solarWind as SolarWind).time_tag),
        color: determineColorsOfValue('speed', convertUnit(solarWind.speed, this.unit), this.unit),
        unit: this.unit,
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
