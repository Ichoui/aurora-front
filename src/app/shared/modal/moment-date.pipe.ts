import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment/moment';
import { ELocales } from '../../models/locales';

@Pipe({
  name: 'momentDate',
})
export class MomentDatePipe implements PipeTransform {
  transform(date: string, locale: ELocales): unknown {
    if (!date) {
      return '';
    }
    return moment(date).locale(locale).format('dddd') ?? '';
  }
}
