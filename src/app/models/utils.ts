import { HttpParams } from '@angular/common/http';
import { Unit } from './weather';

/**
 * @param source objet typé qui doit être converti en HttpParams pour une requete API
 * Permet de convertir
 * */
export class UtilsService {
    static buildQueryParams(source: Object): HttpParams {
        let target: HttpParams = new HttpParams();
        Object.keys(source).forEach((key: string) => {
            const value: string | number | boolean | Date = source[key];
            if ((typeof value !== 'undefined') && (value !== null)) {
                target = target.append(key, value.toString());
            }
        });
        return target;
    }
}

export function countryNameFromCode(code: string): string {
    return code;
}

export function convertUnit(nb: number, unit: Unit): number {
    switch (unit) {
        case Unit.IMPERIAL:
            return Math.round((nb / 1.609)*100)/100; // pour arrondir à 2 chiffres
        default:
            return nb;
    }
}

