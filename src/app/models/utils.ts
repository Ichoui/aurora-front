import { HttpParams } from '@angular/common/http';
import { MeasureUnits, TemperatureUnits } from './weather';
import { FORECAST_COLOR_GREEN, FORECAST_COLOR_ORANGE, FORECAST_COLOR_RED, FORECAST_COLOR_YELLOW } from './colors';
import { AuroraEnumColours, SolarWindTypes } from './aurorav3';
import * as moment from 'moment/moment';
import { ELocales } from './locales';
import { Chart, ChartType } from 'chart.js';
import { EN_COUNTRY_CODE, FR_COUNTRY_CODE } from './iso2-country-code';

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

/*
 * Country code iso2 factory
 * */
export function countryNameFromCode(code: string, locale: ELocales): string {
  return locale === ELocales.FR ? FR_COUNTRY_CODE[code] : EN_COUNTRY_CODE[code];
}

export function convertUnitMeasure(nb: number, unit: MeasureUnits): number {
  switch (unit) {
    case MeasureUnits.IMPERIAL:
      return roundTwoNumbers(nb * 0.62137119223733);
    default:
      // Metric
      return nb;
  }
}

export function convertUnitTemperature(nb: number, unit: TemperatureUnits): number {
  switch (unit) {
    case TemperatureUnits.FAHRENHEIT:
      return Math.round((nb * 9) / 5 + 32);
    case TemperatureUnits.KELVIN:
      return Math.round(nb + 273.15);
    default:
      // Celsius
      return nb;
  }
}

/**
 * Gestion des dates
 * @param date {number} Date
 * @param format {string} Permet de choisir le formatage de la date. (ex: YYYY MM DD)
 * @param locale ELocale
 * @param unix {boolean} Permet de convertir une date au format UNIX (Unix Timestamp) ou DATE lambda
 * */
export function manageDates(date: number | string, format: string, locale?: ELocales, unix = false): string | moment.Moment {
  const offset = moment().utcOffset();
  const d = unix ? moment.unix(date as number).locale(locale) : moment.utc(date);
  return d.utcOffset(offset).format(format);
}

// Arrondir à 2 chiffres
export function roundTwoNumbers(nb: number): number {
  return Math.round(nb * 100) / 100;
}

export function updateGradientBackgroundChart(context, type: SolarWindTypes, data: number[], measure?: MeasureUnits) {
  const chart = context.chart;
  const { ctx, chartArea } = chart;
  if (!chartArea) {
    // This case happens on initial chart load
    return;
  }

  let gradient, width, height;
  function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient = determineLineChartGradient(gradient, type, data, measure);
    }
    return gradient;
  }

  return getGradient(ctx, chartArea);
}

// https://www.chartjs.org/docs/latest/developers/updates.html
export function updateDataChart(chart: Chart<ChartType, string[]>, label: string[], data: any, colors?: any, test = 0) {
  chart.data.labels = label;
  chart.data.datasets.forEach((dataset, index) => {
    dataset.data = data[index];
    dataset.backgroundColor = colors;
  });

  chart.update();
}

export function determineLineChartGradient(gradient: any, type: SolarWindTypes, data: number[], measure?: MeasureUnits): any {
  let max = Math.max(...data);
  let min = Math.min(...data);

  if (type === SolarWindTypes.SPEED) {
    if (measure === MeasureUnits.METRIC) {
      // red >= 700 // orange 700 500 // yellow 500 350 // green < 350
      if (min < 350) {
        gradient.addColorStop(0, FORECAST_COLOR_GREEN + 30);
      } else if (min >= 350 && min < 500) {
        gradient.addColorStop(0, FORECAST_COLOR_YELLOW + 30);
      } else if (min >= 500 && min < 700) {
        gradient.addColorStop(0, FORECAST_COLOR_ORANGE + 30);
      } else if (min >= 700) {
        gradient.addColorStop(0, FORECAST_COLOR_RED + 30);
      }

      if (max < 350) {
        gradient.addColorStop(1, FORECAST_COLOR_GREEN);
      } else if (max < 500) {
        gradient.addColorStop(1, FORECAST_COLOR_YELLOW);
      } else if (max < 700) {
        if (min < 350) {
          gradient.addColorStop(0.5, FORECAST_COLOR_YELLOW + 70);
        }
        gradient.addColorStop(1, FORECAST_COLOR_ORANGE);
      } else if (max >= 700) {
        if (min < 350) {
          gradient.addColorStop(0.35, FORECAST_COLOR_YELLOW + 50);
          gradient.addColorStop(0.7, FORECAST_COLOR_ORANGE + 70);
        }
        gradient.addColorStop(1, FORECAST_COLOR_RED);
      }
    }

    if (measure === MeasureUnits.IMPERIAL) {
      // red >= 435 // orange 435 310 // yellow 310 217 // green < 217
      if (min < 217) {
        gradient.addColorStop(0, FORECAST_COLOR_GREEN + 30);
      } else if (min >= 217 && min < 310) {
        gradient.addColorStop(0, FORECAST_COLOR_YELLOW + 30);
      } else if (min >= 310 && min < 435) {
        gradient.addColorStop(0, FORECAST_COLOR_ORANGE + 30);
      } else if (min >= 435) {
        gradient.addColorStop(0, FORECAST_COLOR_RED + 30);
      }

      if (max < 217) {
        gradient.addColorStop(1, FORECAST_COLOR_GREEN);
      } else if (max < 310) {
        gradient.addColorStop(1, FORECAST_COLOR_YELLOW);
      } else if (max < 435) {
        if (min < 217) {
          gradient.addColorStop(0.5, FORECAST_COLOR_YELLOW + 70);
        }
        gradient.addColorStop(1, FORECAST_COLOR_ORANGE);
      } else if (max >= 435) {
        if (min < 217) {
          gradient.addColorStop(0.35, FORECAST_COLOR_YELLOW + 50);
          gradient.addColorStop(0.7, FORECAST_COLOR_ORANGE + 70);
        }
        gradient.addColorStop(1, FORECAST_COLOR_RED);
      }
    }
    return gradient;
  }

  if (type === SolarWindTypes.DENSITY) {
    // red > 15 // orange 15 10 // yellow 10 4 // green <= 4
    // First determine the floor color
    if (min < 4) {
      gradient.addColorStop(0, FORECAST_COLOR_GREEN + 30);
    } else if (min >= 4 && min < 10) {
      gradient.addColorStop(0, FORECAST_COLOR_YELLOW + 30);
    } else if (min >= 10 && min < 15) {
      gradient.addColorStop(0, FORECAST_COLOR_ORANGE + 30);
    } else if (min >= 15) {
      gradient.addColorStop(0, FORECAST_COLOR_RED + 30);
    }

    // Then determine the max color ;
    // for cases where the min is not in the "category" below (ex : below category of red is orange), we add the other colors
    if (max < 4) {
      gradient.addColorStop(1, FORECAST_COLOR_GREEN);
    } else if (max < 10) {
      gradient.addColorStop(1, FORECAST_COLOR_YELLOW);
    } else if (max < 15) {
      if (min < 4) {
        gradient.addColorStop(0.5, FORECAST_COLOR_YELLOW + 70);
      }
      gradient.addColorStop(1, FORECAST_COLOR_ORANGE);
    } else if (max >= 15) {
      if (min < 4) {
        gradient.addColorStop(0.35, FORECAST_COLOR_YELLOW + 50);
        gradient.addColorStop(0.7, FORECAST_COLOR_ORANGE + 70);
      }
      gradient.addColorStop(1, FORECAST_COLOR_RED);
    }
    return gradient;
  }

  if (type === SolarWindTypes.BZ) {
    gradient.addColorStop(0, FORECAST_COLOR_RED);
    gradient.addColorStop(0.25, FORECAST_COLOR_ORANGE + 70);
    gradient.addColorStop(0.49, FORECAST_COLOR_YELLOW + 70);
    gradient.addColorStop(0.5, FORECAST_COLOR_GREEN + 50);
    gradient.addColorStop(1, FORECAST_COLOR_GREEN + 30);
  }

  if (type === SolarWindTypes.BT) {
    // red > 30 // orange 30 20 // yellow 20 10 // green <= 10
    // First determine the floor color
    if (min < 10) {
      gradient.addColorStop(0, FORECAST_COLOR_GREEN + 30);
    } else if (min >= 10 && min < 20) {
      gradient.addColorStop(0, FORECAST_COLOR_YELLOW + 30);
    } else if (min >= 20 && min < 30) {
      gradient.addColorStop(0, FORECAST_COLOR_ORANGE + 30);
    } else if (min >= 30) {
      gradient.addColorStop(0, FORECAST_COLOR_RED + 30);
    }

    // Then determine the max color ;
    // for cases where the min is not in the "category" below (ex : below category of red is orange), we add the other colors
    if (max < 10) {
      gradient.addColorStop(1, FORECAST_COLOR_GREEN);
    } else if (max < 20) {
      gradient.addColorStop(1, FORECAST_COLOR_YELLOW);
    } else if (max < 30) {
      if (min < 10) {
        gradient.addColorStop(0.5, FORECAST_COLOR_YELLOW + 70);
      }
      gradient.addColorStop(1, FORECAST_COLOR_ORANGE);
    } else if (max >= 30) {
      if (min < 10) {
        gradient.addColorStop(0.35, FORECAST_COLOR_YELLOW + 50);
        gradient.addColorStop(0.7, FORECAST_COLOR_ORANGE + 70);
      }
      gradient.addColorStop(1, FORECAST_COLOR_RED);
    }
    return gradient;
  }

  return gradient;
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

// http://auroraslive.io/#/api/v1/introduction
export function determineColorsOfValue(type: SolarWindTypes | 'kp', value: number, unit?: MeasureUnits): AuroraEnumColours {
  switch (type) {
    case SolarWindTypes.SPEED:
      if (unit === MeasureUnits.METRIC) {
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
      if (unit === MeasureUnits.IMPERIAL) {
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
    case SolarWindTypes.DENSITY:
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
    case SolarWindTypes.BZ:
      if (value <= -15) {
        // -20 par exemple
        return AuroraEnumColours.red;
      } else if (value > -15 && value <= -10) {
        return AuroraEnumColours.orange;
      } else if (value > -10 && value < 0) {
        return AuroraEnumColours.yellow;
      } else if (value >= 0) {
        return AuroraEnumColours.green;
      }
      break;
    case SolarWindTypes.BT:
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
      } else if (value >= 5 && value < 6) {
        return AuroraEnumColours.orange;
      } else if (value >= 3 && value < 5) {
        return AuroraEnumColours.yellow;
      } else if (value < 3) {
        return AuroraEnumColours.green;
      }
      break;
  }
}

/**
 * return a shallow copy of an object without any falsy values (null, undefined, '', 0, false, NaN)
 */
export function deleteFalsy(obj: any): any {
  if (!obj) {
    return null;
  }
  return Object.keys(obj)
    .filter(key => obj[key])
    .reduce((keptFields, key) => ({ ...keptFields, [key]: obj[key] }), {});
}
