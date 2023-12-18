import { Pipe, PipeTransform } from '@angular/core';
import { ELocales } from '../../models/locales';

@Pipe({
  name: 'calculateUv',
})
export class CalculateUvPipe implements PipeTransform {
  transform(indexUv: number, locale: ELocales): unknown {
    if (indexUv >= 0 && indexUv < 3) {
      return locale === ELocales.FR ? 'Faible' : 'Low';
    } else if (indexUv >= 3 && indexUv < 6) {
      return locale === ELocales.FR ? 'Modéré' : 'Moderate';
    } else if (indexUv >= 6 && indexUv < 8) {
      return locale === ELocales.FR ? 'Élevé' : 'High';
    } else if (indexUv >= 8 && indexUv < 11) {
      return locale === ELocales.FR ? 'Très élevé' : 'Very high';
    } else if (indexUv >= 11) {
      return locale === ELocales.FR ? 'Extrême' : 'Extreme';
    }
  }
}
