import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { UsersFeature } from './store/users/users.reducer';
import { UsersEffects } from './store/users/users.effects';
import { VehicleDataFeature } from './store/vehicle-data/vehicle-data.reducer';
import { VehicleDataEffects } from './store/vehicle-data/vehicle-data.effects';

export const vehicleTrackerProviders = [
  provideState(UsersFeature),
  provideState(VehicleDataFeature),
  provideEffects([UsersEffects, VehicleDataEffects]),
];
