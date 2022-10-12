import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ACEModule, AuroraEnumColours, KpCurrent, Nowcast } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { convertUnit, determineColorsOfValue } from '../../models/utils';
import { Unit } from '../../models/weather';
import { Bt, Bz, Density, SolarWind, Speed } from '../../models/aurorav3';

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
  @Input() dataSolarWind: ACEModule;
  @Input() dataSolarWind2: SolarWind;

  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this._auroraBackground();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.unit?.firstChange && changes?.unit?.currentValue !== changes?.unit?.previousValue) {
      this.speed = { ...this.speed, value: convertUnit(this.speed.value, this.unit), unit: this.unit };
    }
    if (changes?.dataSolarWind) {
      const dataSolarWind = changes.dataSolarWind.currentValue;

      this.kpCurrent = dataSolarWind['kp:current'];
      this.nowcast = dataSolarWind['nowcast:local'];
      this.nowcastVal = this.nowcast.value;
      void this._storageService.setData('nowcast', this.nowcast.value);
      void this._storageService.setData('current_kp', this.kpCurrent.value);
    }

    if (changes?.dataSolarWind2) {
      const keyFromFirstIndexValue = Object.values(changes.dataSolarWind2.currentValue[0]);
      const values = Object.values(changes.dataSolarWind2.currentValue[changes.dataSolarWind2.currentValue.length - 1]);
      let dataSolarWind2 = <any>{};

        // @ts-ignore
      keyFromFirstIndexValue.forEach((key, index) => dataSolarWind2[key] = values[index]);

      const wind: SolarWind = {
        density: parseFloat(dataSolarWind2.density),
        speed: parseFloat(dataSolarWind2.speed),
        bt: parseFloat(dataSolarWind2.bt),
        bz: parseFloat(dataSolarWind2.bz),
        time_tag: dataSolarWind2.time_tag,
        propagated_time_tag: dataSolarWind2.propagated_time_tag,
      };

      this.density = {
        value: wind.density,
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        time_tag: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: determineColorsOfValue('density', wind.density),
      };

      this.bz = {
        value: wind.bz,
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        time_tag: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: determineColorsOfValue('bz', wind.bz),
      };
      this.bt = {
        value: wind.bt,
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        request_date: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: determineColorsOfValue('bt', wind.bt),
      };

      this.speed = {
        value: convertUnit(wind.speed, this.unit),
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        time_tag: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: determineColorsOfValue('speed', wind.speed),
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
