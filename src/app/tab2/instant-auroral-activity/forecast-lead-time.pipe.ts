import type { PipeTransform } from '@angular/core';
import { Injectable, Pipe } from '@angular/core';
import { forecastLeadTime } from '../../models/utils';
import type { MeasureUnits } from '../../models/weather';

@Pipe({
  name: 'forecastLeadTime',
})
@Injectable({ providedIn: 'root' })
export class ForecastLeadTimePipe implements PipeTransform {
  transform(speed: number | undefined, measure: MeasureUnits): number | null {
    if (speed === undefined) return null;
    const time = Math.round(forecastLeadTime(speed, measure) ?? Number.NaN);
    return !isNaN(time) ? time : null;
  }
}
