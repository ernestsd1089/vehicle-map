import { VehicleDataFeature } from './vehicle-data.reducer';
import { VehicleDataActions } from './vehicle-data.actions';
import { UsersActions } from '../users/users.actions';
import { initialState } from './vehicle-data.state';
import { VehicleLocation } from '../../models/location.model';
import { Vehicle } from '../../models/vehicle.model';
import { User } from '../../models/user.model';

const mockVehicle: Vehicle = {
  vehicleid: 1,
  make: 'Toyota',
  model: 'Camry',
  year: '2020',
  color: '#ff0000',
  foto: '',
  vin: 'VIN001',
};

const mockUser: User = {
  userid: 10,
  owner: { ownerid: 1, name: 'Alice' } as any,
  vehicles: [mockVehicle],
};

const mockLocation: VehicleLocation = { vehicleid: 1, lat: 56.946, lon: 24.105 };

describe('VehicleDataFeature reducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = VehicleDataFeature.reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  describe('selectUser (UsersActions)', () => {
    it('sets loading to true', () => {
      const state = VehicleDataFeature.reducer(initialState, UsersActions.selectUser({ userId: 1 }));
      expect(state.loading).toBe(true);
    });

    it('clears a previous error', () => {
      const stateWithError = { ...initialState, error: 'previous error' };
      const state = VehicleDataFeature.reducer(stateWithError, UsersActions.selectUser({ userId: 1 }));
      expect(state.error).toBeNull();
    });

    it('clears existing locations', () => {
      const stateWithLocations = { ...initialState, locations: { 1: mockLocation } };
      const state = VehicleDataFeature.reducer(stateWithLocations, UsersActions.selectUser({ userId: 1 }));
      expect(state.locations).toEqual({});
    });

    it('clears the selected vehicle id', () => {
      const stateWithSelection = { ...initialState, selectedVehicleId: 5 };
      const state = VehicleDataFeature.reducer(stateWithSelection, UsersActions.selectUser({ userId: 1 }));
      expect(state.selectedVehicleId).toBeNull();
    });
  });

  describe('loadLocationsSuccess', () => {
    it('sets loading to false', () => {
      const state = VehicleDataFeature.reducer(
        { ...initialState, loading: true },
        VehicleDataActions.loadLocationsSuccess({ locations: [] }),
      );
      expect(state.loading).toBe(false);
    });

    it('stores locations keyed by vehicleid', () => {
      const location2: VehicleLocation = { vehicleid: 2, lat: 57.0, lon: 25.0 };
      const state = VehicleDataFeature.reducer(
        initialState,
        VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation, location2] }),
      );
      expect(state.locations).toEqual({ 1: mockLocation, 2: location2 });
    });

    it('replaces previous locations entirely', () => {
      const stateWithLocations = { ...initialState, locations: { 99: { vehicleid: 99, lat: 0.1, lon: 0.1 } } };
      const state = VehicleDataFeature.reducer(
        stateWithLocations,
        VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation] }),
      );
      expect(state.locations).toEqual({ 1: mockLocation });
      expect(state.locations[99]).toBeUndefined();
    });
  });

  describe('loadLocationsFailure', () => {
    it('sets loading to false', () => {
      const state = VehicleDataFeature.reducer(
        { ...initialState, loading: true },
        VehicleDataActions.loadLocationsFailure({ error: 'err' }),
      );
      expect(state.loading).toBe(false);
    });

    it('stores the error message', () => {
      const state = VehicleDataFeature.reducer(
        initialState,
        VehicleDataActions.loadLocationsFailure({ error: 'Network error' }),
      );
      expect(state.error).toBe('Network error');
    });
  });

  describe('selectVehicle', () => {
    it('sets the selected vehicle id', () => {
      const state = VehicleDataFeature.reducer(initialState, VehicleDataActions.selectVehicle({ vehicleId: 7 }));
      expect(state.selectedVehicleId).toBe(7);
    });
  });

  describe('deselectVehicle', () => {
    it('clears the selected vehicle id', () => {
      const stateWithSelection = { ...initialState, selectedVehicleId: 7 };
      const state = VehicleDataFeature.reducer(stateWithSelection, VehicleDataActions.deselectVehicle());
      expect(state.selectedVehicleId).toBeNull();
    });
  });
});

describe('selectVehiclesWithLocations', () => {
  const project = VehicleDataFeature.selectVehiclesWithLocations.projector;

  it('returns empty array when no user is selected', () => {
    const result = project(null, [mockUser], { 1: mockLocation });
    expect(result).toEqual([]);
  });

  it('returns empty array when selected user is not in the list', () => {
    const result = project(99, [mockUser], { 1: mockLocation });
    expect(result).toEqual([]);
  });

  it('maps vehicle with a valid location', () => {
    const result = project(10, [mockUser], { 1: mockLocation });
    expect(result).toEqual([{ ...mockVehicle, location: mockLocation }]);
  });

  it('maps vehicle with null when location is missing', () => {
    const result = project(10, [mockUser], {});
    expect(result).toEqual([{ ...mockVehicle, location: null }]);
  });

  it('maps vehicle with null when location is (0, 0)', () => {
    const invalidLocation: VehicleLocation = { vehicleid: 1, lat: 0, lon: 0 };
    const result = project(10, [mockUser], { 1: invalidLocation });
    expect(result).toEqual([{ ...mockVehicle, location: null }]);
  });
});

describe('selectLocatedVehicles', () => {
  const project = VehicleDataFeature.selectLocatedVehicles.projector;

  it('filters out vehicles without a location', () => {
    const vehicles = [
      { ...mockVehicle, location: mockLocation },
      { ...mockVehicle, vehicleid: 2, location: null },
    ];
    const result = project(vehicles);
    expect(result).toHaveLength(1);
    expect(result[0].vehicleid).toBe(1);
  });

  it('returns all vehicles when all have valid locations', () => {
    const vehicles = [
      { ...mockVehicle, location: mockLocation },
      { ...mockVehicle, vehicleid: 2, location: { vehicleid: 2, lat: 57.0, lon: 25.0 } },
    ];
    const result = project(vehicles);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no vehicles have locations', () => {
    const vehicles = [{ ...mockVehicle, location: null }];
    const result = project(vehicles);
    expect(result).toEqual([]);
  });
});

describe('selectSelectedVehicleLocation', () => {
  const project = VehicleDataFeature.selectSelectedVehicleLocation.projector;

  it('returns null when no vehicle is selected', () => {
    expect(project(null, { 1: mockLocation })).toBeNull();
  });

  it('returns the location for the selected vehicle', () => {
    expect(project(1, { 1: mockLocation })).toEqual(mockLocation);
  });

  it('returns null when the selected vehicle has no location', () => {
    expect(project(99, { 1: mockLocation })).toBeNull();
  });
});

describe('selectSelectedVehicle', () => {
  const project = VehicleDataFeature.selectSelectedVehicle.projector;

  it('returns null when no vehicle is selected', () => {
    expect(project([mockUser], null)).toBeNull();
  });

  it('returns the vehicle for the selected id', () => {
    expect(project([mockUser], 1)).toEqual(mockVehicle);
  });

  it('returns null when no user owns the selected vehicle', () => {
    expect(project([mockUser], 999)).toBeNull();
  });

  it('finds a vehicle across multiple users', () => {
    const vehicle2: Vehicle = { ...mockVehicle, vehicleid: 2 };
    const user2: User = { userid: 20, owner: { ownerid: 2, name: 'Bob' } as any, vehicles: [vehicle2] };
    expect(project([mockUser, user2], 2)).toEqual(vehicle2);
  });
});
