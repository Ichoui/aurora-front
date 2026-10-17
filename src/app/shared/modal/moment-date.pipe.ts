import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import moment from 'moment';
import type { ELocales } from '../../models/locales';

@Pipe({
  name: 'momentDate',
})
export class MomentDatePipe implements PipeTransform {
  transform(date: string | null | undefined, locale: ELocales): string {
    if (!date) {
      return '';
    }
    return moment(date).locale(locale).format('dddd') ?? '';
  }
}
