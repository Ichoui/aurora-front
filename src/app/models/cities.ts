export interface City {
  code: string;
  ville: string;
  pays: string;
  codePays: string;
  latitude: number;
  longitude: number;
}
export interface Coords {
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  latitude?: number;
  longitude?: number;
  speed?: number | null;
}

export interface CodeLocation {
  code?: string;
  lat?: number;
  long?: number;
}

export const cities: City[] = [
  {
    code: 'mtl',
    ville: 'Montréal',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 45.501379,
    longitude: -73.564936,
  },
  {
    code: 'qc',
    ville: 'Québec',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 46.826835,
    longitude: -71.205849,
  },
  {
    code: 'sgn',
    ville: 'Saguenay',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 48.427878,
    longitude: -71.066089,
  },
  {
    code: 'bff',
    ville: 'Banff',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 51.178911,
    longitude: -115.569748,
  },
  {
    code: 'jsp',
    ville: 'Jasper',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 52.873291,
    longitude: -118.080682,
  },
  {
    code: 'edm',
    ville: 'Edmonton',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 53.54625,
    longitude: -113.493442,
  },
  {
    code: 'ylk',
    ville: 'Yellowknife',
    pays: 'Canada',
    codePays: 'CA',
    latitude: 62.452538,
    longitude: -114.377654,
  },
  {
    code: 'anc',
    ville: 'Anchorage',
    pays: 'Alaska',
    codePays: 'USA',
    latitude: 61.228421,
    longitude: -149.88764,
  },
  {
    code: 'tls',
    ville: 'Toulouse',
    pays: 'France',
    codePays: 'FR',
    latitude: 43.608763,
    longitude: 1.436908,
  },
  {
    code: 'bgn',
    ville: 'Bergen',
    pays: 'Norvège',
    codePays: 'NW',
    latitude: 60.387856,
    longitude: 5.330406,
  },
  {
    code: 'trm',
    ville: 'Trømso',
    pays: 'Norvège',
    codePays: 'NW',
    latitude: 69.650288,
    longitude: 18.955098,
  },
  {
    code: 'ryk',
    ville: 'Reykjavik',
    pays: 'Islande',
    codePays: 'ISL',
    latitude: 64.146653,
    longitude: -21.940686,
  },
];
