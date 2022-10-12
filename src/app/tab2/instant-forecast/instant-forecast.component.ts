import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ACEModule, AuroraEnumColours, KpCurrent, Nowcast } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { convertUnit } from '../../models/utils';
import { Unit } from '../../models/weather';
import { Bt, Bz, Density, SolarWind, Speed } from '../../models/aurorav3';

@Component({
  selector: 'app-kpindex',
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
      // console.log(changes.dataSolarWind2.currentValue);
      const keyFromFirstIndexValue = Object.values(changes.dataSolarWind2.currentValue[0]);
      const values = Object.values(changes.dataSolarWind2.currentValue[changes.dataSolarWind2.currentValue.length - 1]);
      let dataSolarWind2 = <any>{};

      keyFromFirstIndexValue.forEach((key, index) => {
        // @ts-ignore
        dataSolarWind2[key] = values[index];
      });

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
        color: this._determineColorOfValue('density', wind.density),
      };

      this.bz = {
        value: wind.bz,
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        time_tag: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: this._determineColorOfValue('bz', wind.bz),
      };
      this.bt = {
        value: wind.bt,
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        request_date: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: this._determineColorOfValue('bt', wind.bt),
      };

      this.speed = {
        value: convertUnit(wind.speed, this.unit),
        date: new Date((dataSolarWind2 as SolarWind).time_tag),
        time_tag: new Date((dataSolarWind2 as SolarWind).time_tag),
        color: this._determineColorOfValue('speed', wind.speed),
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

  // http://auroraslive.io/#/api/v1/introduction
  private _determineColorOfValue(data: 'bz' | 'density' | 'speed' | 'bt' | 'kp', value: number): AuroraEnumColours {
    if (!value) {
      // return AuroraEnumColours.no_data;
    }
    switch (data) {
      case 'density':
        if (value >= 15) {
          return AuroraEnumColours.red;
        } else if (value >= 10 && value < 15) {
          return AuroraEnumColours.orange;
        } else if (value >= 4 && value < 10) {
          return AuroraEnumColours.yellow;
        } else if (value < 4) {
          return AuroraEnumColours.green;
        }
        break;
      case 'speed':
        if (value >= 700) {
          return AuroraEnumColours.red;
        } else if (value >= 500 && value < 700) {
          return AuroraEnumColours.orange;
        } else if (value >= 350 && value < 500) {
          return AuroraEnumColours.yellow;
        } else if (value < 350) {
          return AuroraEnumColours.green;
        }
        break;
      case 'bz':
        if (value <= -15) {
          return AuroraEnumColours.red;
        } else if (value > -15 || value <= -10) {
          return AuroraEnumColours.orange;
        } else if (value > -10 || value < 0) {
          return AuroraEnumColours.yellow;
        } else if (value >= 10) {
          return AuroraEnumColours.green;
        }
        break;
      case 'bt':
        if (value > 30) {
          return AuroraEnumColours.red;
        } else if (value < 30 && value >= 20) {
          return AuroraEnumColours.orange;
        } else if (value < 20 && value >= 10) {
          return AuroraEnumColours.yellow;
        } else if (value < 10) {
          return AuroraEnumColours.green;
        }
        break;
      case 'kp':
        if (value >= 6) {
          return AuroraEnumColours.red;
        } else if (value === 5) {
          return AuroraEnumColours.orange;
        } else if (value === 3 || value === 4) {
          return AuroraEnumColours.yellow;
        } else if (value < 3) {
          return AuroraEnumColours.green;
        }
        break;
    }
  }
}
