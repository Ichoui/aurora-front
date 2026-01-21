import { Pipe, PipeTransform } from '@angular/core';
import { forecastLeadTime } from '../../models/utils';
import { MeasureUnits } from '../../models/weather';

@Pipe({
  name: 'forecastLeadTime',
})
export class ForecastLeadTimePipe implements PipeTransform {
  transform(speed: number, measure: MeasureUnits): number {
    const time = Math.round(forecastLeadTime(speed, measure));
    return !isNaN(time) ? time : null;
  }
}
