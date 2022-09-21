import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { AuroraEnumColours, Density, KpCurrent, Nowcast, Speed } from '../../models/aurorav2';

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

  nowcastVal: {}; // paramètre pour translate module
  AuroraEnumColours = AuroraEnumColours;

  @Input()
  set moduleACEInput(value: any) {
    this.dataModuleACE.next(value);
  }

  get moduleACEInput() {
    return this.dataModuleACE.getValue();
  }

  // constructor(private storage: Storage) {}

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
    this.dataModuleACE.subscribe(ace => {
      this.density = ace.density;
      this.kpCurrent = ace['kp:current'];
      this.speed = ace.speed;
      this.bz = ace.bt;
      this.bt = ace.bz;
      this.nowcast = ace['nowcast:local'];
      this.nowcastVal = { value: this.nowcast.value };
      console.log(ace);
      // this.storage.set('nowcast', this.nowcast.value);
      // this.storage.set('current_kp', this.kpCurrent.value);
    });
  }
}
