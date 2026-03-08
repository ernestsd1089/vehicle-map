import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Subject, of } from 'rxjs';
import { Action } from '@ngrx/store';

import { VehicleDataEffects } from './vehicle-data.effects';
import { VehicleDataActions } from './vehicle-data.actions';
import { UsersActions } from '../users/users.actions';
import { selectVehiclesWithLocations } from './vehicle-data.reducer';
import { MobiService, LOCATIONS_KEY } from '../../services/mobi.service';
import { CacheService } from '../../../../core/services/cache.service';
import { VehicleLocation } from '../../models/location.model';
import { Vehicle } from '../../models/vehicle.model';

const mockLocation: VehicleLocation = { vehicleid: 1, lat: 56.946, lon: 24.105 };
const mockVehicle: Vehicle = { vehicleid: 1, make: 'Toyota', model: 'Camry', year: '2020', color: '#ff0000', foto: '', vin: 'V1' };
const vehicleWithLocation = { ...mockVehicle, location: mockLocation };
const vehicleWithoutLocation = { ...mockVehicle, vehicleid: 2, location: null };

describe('VehicleDataEffects', () => {
  let actions$: Subject<Action>;
  let effects: VehicleDataEffects;
  let getLocations: jest.Mock;
  let cacheDelete: jest.Mock;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    getLocations = jest.fn();
    cacheDelete = jest.fn();

    jest.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        VehicleDataEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: MobiService, useValue: { getLocations } },
        { provide: CacheService, useValue: { delete: cacheDelete } },
      ],
    });

    effects = TestBed.inject(VehicleDataEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retryLocations$', () => {
    it('deletes the cache entry for the user', (done) => {
      effects.retryLocations$.subscribe(() => {
        expect(cacheDelete).toHaveBeenCalledWith(`${LOCATIONS_KEY}-5`);
        done();
      });

      actions$.next(VehicleDataActions.retryLocations({ userId: 5 }));
    });

    it('dispatches selectUser with the same userId', (done) => {
      effects.retryLocations$.subscribe((action) => {
        expect(action).toEqual(UsersActions.selectUser({ userId: 5 }));
        done();
      });

      actions$.next(VehicleDataActions.retryLocations({ userId: 5 }));
    });
  });

  describe('onLocationResult$', () => {
    // Subscribe to the side-effect effect so locationRetryPending gets set via its tap
    const subscribeToRetryStarted = () => effects.onLocationRetryStarted$.subscribe();

    it('dispatches retryLocationsSucceeded when all vehicles have locations after a retry', (done) => {
      store.overrideSelector(selectVehiclesWithLocations, [vehicleWithLocation]);
      store.refreshState();
      subscribeToRetryStarted();

      effects.onLocationResult$.subscribe((action) => {
        expect(action).toEqual(VehicleDataActions.retryLocationsSucceeded());
        done();
      });

      actions$.next(VehicleDataActions.retryLocations({ userId: 1 }));
      actions$.next(VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation] }));
    });

    it('dispatches manualRetryLocationsFailed when some vehicles have no location after a retry', (done) => {
      store.overrideSelector(selectVehiclesWithLocations, [vehicleWithLocation, vehicleWithoutLocation]);
      store.refreshState();
      subscribeToRetryStarted();

      effects.onLocationResult$.subscribe((action) => {
        expect(action).toEqual(VehicleDataActions.manualRetryLocationsFailed());
        done();
      });

      actions$.next(VehicleDataActions.retryLocations({ userId: 1 }));
      actions$.next(VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation] }));
    });

    it('dispatches manualRetryLocationsFailed on loadLocationsFailure during retry', (done) => {
      store.overrideSelector(selectVehiclesWithLocations, []);
      store.refreshState();
      subscribeToRetryStarted();

      effects.onLocationResult$.subscribe((action) => {
        expect(action).toEqual(VehicleDataActions.manualRetryLocationsFailed());
        done();
      });

      actions$.next(VehicleDataActions.retryLocations({ userId: 1 }));
      actions$.next(VehicleDataActions.loadLocationsFailure({ error: 'err' }));
    });

    it('does not dispatch when not retrying', () => {
      store.overrideSelector(selectVehiclesWithLocations, [vehicleWithLocation]);
      store.refreshState();

      const dispatched: Action[] = [];
      effects.onLocationResult$.subscribe((a) => dispatched.push(a));

      actions$.next(VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation] }));

      expect(dispatched).toHaveLength(0);
    });
  });

  describe('loadLocationsOnUserSelect$', () => {
    it('dispatches loadLocationsSuccess with the returned locations', (done) => {
      getLocations.mockReturnValue(of([mockLocation]));

      effects.loadLocationsOnUserSelect$.subscribe((action) => {
        expect(action).toEqual(VehicleDataActions.loadLocationsSuccess({ locations: [mockLocation] }));
        done();
      });

      actions$.next(UsersActions.selectUser({ userId: 3 }));
      jest.advanceTimersByTime(0);
    });

    it('calls getLocations with the selected userId', (done) => {
      getLocations.mockReturnValue(of([]));

      effects.loadLocationsOnUserSelect$.subscribe(() => {
        expect(getLocations).toHaveBeenCalledWith(3);
        done();
      });

      actions$.next(UsersActions.selectUser({ userId: 3 }));
      jest.advanceTimersByTime(0);
    });
  });
});
