import { HttpParams } from '@angular/common/http';
import { Unit } from './weather';
import { FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW } from './colors';
import { AuroraEnumColours } from './aurorav3';

/**
 * @param source objet typé qui doit être converti en HttpParams pour une requete API
 * Permet de convertir
 * */
export class UtilsService {
  static buildQueryParams(source: Object): HttpParams {
    let target: HttpParams = new HttpParams();
    Object.keys(source).forEach((key: string) => {
      const value: string | number | boolean | Date = source[key];
      if (typeof value !== 'undefined' && value !== null) {
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
      return Math.round(nb * 0.62137119223733 * 100) / 100; // pour arrondir à 2 chiffres
    default:
      return nb;
  }
}

// Arrondir
export function roundTwoNumbers(nb: number): number {
  return Math.round(nb * 100) / 100;
}

// Replace a string color with the correct Application color
export function colorSwitcher(c: AuroraEnumColours): string {
  let color;
  switch (c) {
    case 'green':
      color = FORECAST_COLOR_GREEN;
      break;
    case 'yellow':
      color = FORECAST_COLOR_YELLOW;
      break;
    case 'orange':
      color = FORECAST_COLOR_ORANGE;
      break;
    case 'red':
      color = FORECAST_COLOR_RED;
      break;
  }
  return color;
}

export function monthSwitcher(
  strMonth: 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'june' | 'july' | 'aug' | 'sept' | 'oct' | 'nov' | 'dec' | string,
): number {
  switch (strMonth) {
    case 'jan':
      return 1;
    case 'feb':
      return 2;
    case 'mar':
      return 3;
    case 'apr':
      return 4;
    case 'may':
      return 5;
    case 'june':
      return 6;
    case 'july':
      return 7;
    case 'aug':
      return 8;
    case 'sept':
      return 9;
    case 'oct':
      return 10;
    case 'nov':
      return 11;
    case 'dec':
      return 12;
  }
}

// http://auroraslive.io/#/api/v1/introduction
export function determineColorsOfValue(
  data: 'bz' | 'density' | 'speed' | 'bt' | 'kp',
  value: number,
  unit?: Unit,
): AuroraEnumColours {
  switch (data) {
    case 'density':
      if (value >= 15) {
        return AuroraEnumColours.red;
      } else if (value >= 10 && value < 15) {
        return AuroraEnumColours.orange;
      } else if (value >= 4 && value < 10) {
        return AuroraEnumColours.yellow;
      } else if (value < 4) {
        return AuroraEnumColours.green;
      }
      break;
    case 'speed':
      if (unit === Unit.METRIC) {
        if (value >= 700) {
          return AuroraEnumColours.red;
        } else if (value >= 500 && value < 700) {
          return AuroraEnumColours.orange;
        } else if (value >= 350 && value < 500) {
          return AuroraEnumColours.yellow;
        } else if (value < 350) {
          return AuroraEnumColours.green;
        }
      }
      if (unit === Unit.IMPERIAL) {
        if (value >= 435) {
          return AuroraEnumColours.red;
        } else if (value >= 310 && value < 435) {
          return AuroraEnumColours.orange;
        } else if (value >= 217 && value < 310) {
          return AuroraEnumColours.yellow;
        } else if (value < 217) {
          return AuroraEnumColours.green;
        }
      }
      break;
    case 'bz':
      if (value <= -15) {
        return AuroraEnumColours.red;
      } else if (value > -15 || value <= -10) {
        return AuroraEnumColours.orange;
      } else if (value > -10 || value < 0) {
        return AuroraEnumColours.yellow;
      } else if (value >= 10) {
        return AuroraEnumColours.green;
      }
      break;
    case 'bt':
      if (value > 30) {
        return AuroraEnumColours.red;
      } else if (value < 30 && value >= 20) {
        return AuroraEnumColours.orange;
      } else if (value < 20 && value >= 10) {
        return AuroraEnumColours.yellow;
      } else if (value < 10) {
        return AuroraEnumColours.green;
      }
      break;
    case 'kp':
      if (value >= 6) {
        return AuroraEnumColours.red;
      } else if (value === 5) {
        return AuroraEnumColours.orange;
      } else if (value === 3 || value === 4) {
        return AuroraEnumColours.yellow;
      } else if (value < 3) {
        return AuroraEnumColours.green;
      }
      break;
  }
}
