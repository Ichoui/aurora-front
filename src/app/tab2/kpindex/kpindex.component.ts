import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ACEModule, AuroraEnumColours, Bt, Bz, Density, KpCurrent, Nowcast, Speed } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { convertUnit } from '../../models/utils';
import { Unit } from '../../models/weather';

@Component({
  selector: 'app-kpindex',
  templateUrl: './kpindex.component.html',
  styleUrls: ['./kpindex.component.scss'],
})
export class KpindexComponent implements OnInit, OnChanges {
  density: Density;
  kpCurrent: KpCurrent;
  speed: Speed;
  nowcast: Nowcast;
  bz: Bz;
  bt: Bt;

  nowcastVal: number;
  AuroraEnumColours = AuroraEnumColours;

  @Input() unit: Unit;
  @Input() dataSolarWind: ACEModule;

  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this._auroraBackground();
    this.solarWindData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes?.unit?.firstChange && changes?.unit?.currentValue !== changes?.unit?.previousValue) {
      this.speed = { ...this.speed, value: convertUnit(this.speed.value, this.unit), unit: this.unit };
    }
    if (changes?.dataSolarWind) {
      const dataSolarWind = changes.dataSolarWind.currentValue;
      this.density = dataSolarWind.density;
      this.kpCurrent = dataSolarWind['kp:current'];
      this.speed = {
        ...dataSolarWind.speed,
        value: convertUnit(dataSolarWind.speed.value, this.unit),
        unit: this.unit,
      };
      this.bz = dataSolarWind.bz;
      this.bt = dataSolarWind.bt;
      this.nowcast = dataSolarWind['nowcast:local'];
      this.nowcastVal = this.nowcast.value;
      void this._storageService.setData('nowcast', this.nowcast.value);
      void this._storageService.setData('current_kp', this.kpCurrent.value);
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

  /**
   * Observable permettant de récupérer les données des vents solaires
   * */
  solarWindData(): void {}
}
