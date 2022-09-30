export interface Geocoding {
    name: string;
    local_names: Record<string, string>; // fr en ascii feature_name etc...
    lat: number;
    lon: number;
    country: string; // GB FR CA
    state: string; // Québec Occitanie  Michigan...
}
