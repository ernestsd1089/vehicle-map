import { VehicleLocation } from '../../models/location.model';

export interface VehicleDataState {
  locations: Record<number, VehicleLocation>;
  selectedVehicleId: number | null;
  loading: boolean;
  error: string | null;
}

export const initialState: VehicleDataState = {
  locations: {},
  selectedVehicleId: null,
  loading: false,
  error: null,
};
