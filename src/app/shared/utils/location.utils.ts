import { VehicleLocation } from '../../features/vehicle-tracker/models/location.model';

export function isValidLocation(location: VehicleLocation | undefined | null): location is VehicleLocation {
  if (!location) return false;
  const { lat, lon } = location;
  return isFinite(lat) && isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
