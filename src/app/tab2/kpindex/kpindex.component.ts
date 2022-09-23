import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuroraEnumColours, Density, KpCurrent, Nowcast, Speed } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-kpindex',
  templateUrl: './kpindex.component.html',
  styleUrls: ['./kpindex.component.scss'],
})
export class KpindexComponent implements OnInit {
  dataModuleACE = new BehaviorSubject<any>(null);

  density: Density;
  kpCurrent: KpCurrent;
  speed: Speed;
  nowcast: Nowcast;
  bz: Nowcast;
  bt: Nowcast;

  nowcastVal: number
  AuroraEnumColours = AuroraEnumColours;

  @Input()
  set moduleACEInput(value: any) {
    this.dataModuleACE.next(value);
  }

  get moduleACEInput() {
    return this.dataModuleACE.getValue();
  }

  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this.auroraBackground();
    this.solarWindData();
  }

  /**
   * Fait scintiller les étoiles en background
   * */
  auroraBackground(): void {
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
  solarWindData(): void {
    this.dataModuleACE.pipe(tap((ace) => {
      this.density = ace.density;
      this.kpCurrent = ace['kp:current'];
      this.speed = ace.speed;
      this.bz = ace.bt;
      this.bt = ace.bz;
      this.nowcast = ace['nowcast:local'];
      this.nowcastVal = this.nowcast.value;
      void this._storageService.setData('nowcast', this.nowcast.value)
      void this._storageService.setData('current_kp', this.kpCurrent.value)
    })).subscribe();
  }
}
