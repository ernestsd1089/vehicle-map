import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { UsersActions } from '../users/users.actions';
import { UsersFeature } from '../users/users.reducer';
import { VehicleLocationsActions } from './vehicle-locations.actions';
import { initialState } from './vehicle-locations.state';

export const VehicleLocationsFeature = createFeature({
  name: 'vehicleLocations',
  reducer: createReducer(
    initialState,
    on(UsersActions.selectUser, (state) => ({
      ...state,
      loading: true,
      error: null,
      locations: {},
    })),
    on(VehicleLocationsActions.loadLocationsSuccess, (state, { locations }) => ({
      ...state,
      loading: false,
      locations: Object.fromEntries(locations.map((l) => [l.vehicleid, l])),
    })),
    on(VehicleLocationsActions.loadLocationsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});

export const selectVehiclesWithLocations = createSelector(
  UsersFeature.selectSelectedUserId,
  UsersFeature.selectUsers,
  VehicleLocationsFeature.selectLocations,
  (selectedUserId, users, locations) => {
    const user = users.find((u) => u.userid === selectedUserId);
    if (!user) return [];
    return user.vehicles.map((vehicle) => ({
      ...vehicle,
      location: locations[vehicle.vehicleid] ?? null,
    }));
  },
);
