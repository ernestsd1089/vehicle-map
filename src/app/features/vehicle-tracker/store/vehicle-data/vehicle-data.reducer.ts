import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { UsersActions } from '../users/users.actions';
import { UsersFeature } from '../users/users.reducer';
import { VehicleDataActions } from './vehicle-data.actions';
import { initialState } from './vehicle-data.state';

export const VehicleDataFeature = createFeature({
  name: 'vehicleData',
  reducer: createReducer(
    initialState,
    on(UsersActions.selectUser, (state) => ({
      ...state,
      loading: true,
      error: null,
      locations: {},
      selectedVehicleId: null,
    })),
    on(VehicleDataActions.loadLocationsSuccess, (state, { locations }) => ({
      ...state,
      loading: false,
      locations: Object.fromEntries(locations.map((l) => [l.vehicleid, l])),
    })),
    on(VehicleDataActions.loadLocationsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(VehicleDataActions.selectVehicle, (state, { vehicleId }) => ({
      ...state,
      selectedVehicleId: vehicleId,
    })),
    on(VehicleDataActions.deselectVehicle, (state) => ({
      ...state,
      selectedVehicleId: null,
    })),
  ),
});

export const selectVehiclesWithLocations = createSelector(
  UsersFeature.selectSelectedUserId,
  UsersFeature.selectUsers,
  VehicleDataFeature.selectLocations,
  (selectedUserId, users, locations) => {
    const user = users.find((u) => u.userid === selectedUserId);
    if (!user) return [];
    return user.vehicles.map((vehicle) => ({
      ...vehicle,
      location: locations[vehicle.vehicleid] ?? null,
    }));
  },
);

export const selectSelectedVehicleLocation = createSelector(
  VehicleDataFeature.selectSelectedVehicleId,
  VehicleDataFeature.selectLocations,
  (selectedVehicleId, locations) => {
    if (!selectedVehicleId) return null;
    return locations[selectedVehicleId] ?? null;
  },
);

export const selectSelectedVehicle = createSelector(
  UsersFeature.selectUsers,
  VehicleDataFeature.selectSelectedVehicleId,
  (users, selectedVehicleId) => {
    if (!selectedVehicleId) return null;
    for (const user of users) {
      const vehicle = user.vehicles.find((v) => v.vehicleid === selectedVehicleId);
      if (vehicle) return vehicle;
    }
    return null;
  },
);
