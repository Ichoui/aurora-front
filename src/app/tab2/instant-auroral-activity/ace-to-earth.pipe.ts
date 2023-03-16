import { Pipe, PipeTransform } from '@angular/core';
import { timeACEtoEarth } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';

@Pipe({
  name: 'aceToEarth',
})
export class AceToEarthPipe implements PipeTransform {
  transform(speed: number, measure: MeasureUnits): number {
    return Math.round(timeACEtoEarth(speed, measure));
  }
}
