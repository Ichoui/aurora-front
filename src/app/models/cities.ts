export interface City {
  name: string;
  lat: string;
  long: string;
  countryCode: string;
}

export interface CityCoords {
  lat: number;
  long: number;
}

export interface LocationSelection extends CityCoords {
  source?: 'city' | 'map' | 'gps' | 'default';
  label?: string;
}
