import type { PipeTransform } from '@angular/core';
import { Pipe, inject } from '@angular/core';
import moment from 'moment';
import type { MeasureUnits } from '../../models/weather';
import { HourClock } from '../../models/weather';
import { ForecastLeadTimePipe } from '../../tab2/instant-auroral-activity/forecast-lead-time.pipe';

@Pipe({
  name: 'momentHour',
})
export class MomentHourPipe implements PipeTransform {
  private readonly _forecastLeadTimePipe = inject(ForecastLeadTimePipe);

  /**
   * Le pipe transforme une date au format UTC, et lui rajoute le temps que mettra le vent solaire à toucher la Terre depuis la zone Lagrange 1
   *
  * @param hour {string}  Format like this : 2023-12-17 05:40:00.000 ; Doit correspondre à la date "Model Run" de chaque image
  * @param speed {number}
  * @param measureUnit {MeasureUnits}
  * @param hourClock {HourClock}

   * @const forecastLeadTime {number} Temps de propagation du vent solaire vers la terre, valeur en haut à droite de l'image
   * @return valeur qui doit être proche de en haut à gauche de l'image "For"...
  * */
  transform(hour: string | null | undefined, speed: number | undefined, measureUnit: MeasureUnits, hourClock: HourClock): string {
    if (!hour) {
      return '';
    }
    const forecastLeadTime = this._forecastLeadTimePipe.transform(speed, measureUnit);
    return moment
      .utc(hour)
      .local()
      .add(forecastLeadTime ?? 0, 'minutes')
      .format(hourClock === HourClock.TWENTYFOUR ? 'HH[h]mm' : 'hh:mm A');
  }
}
