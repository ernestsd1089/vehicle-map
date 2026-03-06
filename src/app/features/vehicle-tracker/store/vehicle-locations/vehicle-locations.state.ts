import { VehicleLocation } from '../../models/location.model';

export interface VehicleLocationsState {
  locations: Record<number, VehicleLocation>;
  loading: boolean;
  error: string | null;
}

export const initialState: VehicleLocationsState = {
  locations: {},
  loading: false,
  error: null,
};
