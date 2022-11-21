// Données sur le vent solaire
import { AuroraEnumColours } from './aurorav3';

/**
 * @deprecated Interface should not be used
 */
interface SolarWindv1 {
  date: string;
  bz: number;
  density: number;
  speed: number;
  kp1hour: number;
  kp4hour: number;
  kp: number;
  colour: AuroraColours;
  message: string[];
}
/**
 * @deprecated Interface should not be used
 */
interface AuroraColours {
  bz: string;
  density: string;
  speed: string;
  kp1hour: string;
  kp4hour: string;
  kp: string;
}

/**
 * @deprecated Interface should not be used
 */
 interface AuroraZenith {
  date: string;
  calculated: Calculated;
  colour: AuroraEnumColours;
  lat: string;
  long: string;
  value: string; // to number
  message: string[];
}

/**
 * @deprecated Interface should not be used
 */
interface Calculated {
  lat: string;
  long: string;
  value: string; // to number
  colour: string;
}

/**
 * @deprecated Interface should not be used
 * Paramètres obligatoire & facultatif
 */
 interface ParamsACE {
  type: string;
  data: DataACE;
  lat?: number;
  long?: number;
}

/**
 * @deprecated Interface should not be used
 */
enum DataACE {
  bz = 'bz',
  speed = 'speed',
  density = 'density',
  kp = 'kp',
  kp1minute = 'kp1minute',
  threeday = 'threeday',
  twentysevenday = 'twentysevenday',
  probability = 'probability',
  all = 'all',
}
