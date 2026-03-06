import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { UsersFeature } from './store/users/users.reducer';
import { UsersEffects } from './store/users/users.effects';
import { VehicleLocationsFeature } from './store/vehicle-locations/vehicle-locations.reducer';
import { VehicleLocationsEffects } from './store/vehicle-locations/vehicle-locations.effects';

export const vehicleTrackerProviders = [
  provideState(UsersFeature),
  provideState(VehicleLocationsFeature),
  provideEffects([UsersEffects, VehicleLocationsEffects]),
];
