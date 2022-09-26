import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { ACEModule, AuroraEnumColours, Bt, Bz, Density, KpCurrent, Nowcast, Speed } from '../../models/aurorav2';
import { StorageService } from '../../storage.service';
import { first, pairwise, switchMap, tap } from 'rxjs/operators';
import { convertUnit } from '../../models/utils';
import { Unit } from '../../models/weather';

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
    bz: Bz;
    bt: Bt;

    nowcastVal: number;
    AuroraEnumColours = AuroraEnumColours;

    @Input()
    set moduleACEInput(value: any) {
        this.dataModuleACE.next(value);
    }

    get moduleACEInput() {
        return this.dataModuleACE.getValue();
    }

    constructor(private _storageService: StorageService) {
    }

    ngOnInit() {
        this.auroraBackground();
        this.solarWindData();
        from(this._storageService.getData('unit')).pipe(pairwise(), tap(([prev, curr]) => {
            console.log(prev);
            console.log(curr);
        })).subscribe(console.log);

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
        combineLatest([this.dataModuleACE, this._storageService.getData('unit')]).pipe(first(), tap(([ace, unit]: [ACEModule, Unit]) => {
            console.log(ace);
            console.log(unit);
            this.density = ace.density;
            this.kpCurrent = ace['kp:current'];
            this.speed = {...ace.speed, value: convertUnit(ace.speed.value, unit), unit};
            this.bz = ace.bz;
            this.bt = ace.bt;
            this.nowcast = ace['nowcast:local'];
            this.nowcastVal = this.nowcast.value;
            void this._storageService.setData('nowcast', this.nowcast.value);
            void this._storageService.setData('current_kp', this.kpCurrent.value);
        })).subscribe();
    }
}
