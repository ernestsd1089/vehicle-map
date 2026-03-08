import { render, screen } from '@testing-library/angular';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';

import { VehicleTrackerComponent } from './vehicle-tracker.component';
import { VehicleDataFeature, selectSelectedVehicle, selectSelectedVehicleLocation, selectVehiclesWithLocations } from './store/vehicle-data/vehicle-data.reducer';
import { UsersFeature } from './store/users/users.reducer';
import { UsersActions } from './store/users/users.actions';
import { GeocodingService } from './services/geocoding.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Prevent MapViewComponent from initialising a real OL map in jsdom
jest.mock('ol/Map', () => jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  setTarget: jest.fn(),
  addOverlay: jest.fn(),
  removeOverlay: jest.fn(),
  getView: jest.fn().mockReturnValue({ animate: jest.fn(), fit: jest.fn() }),
})));

jest.mock('ol/control', () => ({
  defaults: jest.fn().mockReturnValue({ extend: jest.fn().mockReturnValue([]) }),
  Zoom: jest.fn().mockImplementation(() => ({})),
}));

const baseSelectors = [
  { selector: VehicleDataFeature.selectSelectedVehicleId, value: null },
  { selector: UsersFeature.selectUsers, value: [] },
  { selector: UsersFeature.selectSelectedUserId, value: null },
  { selector: VehicleDataFeature.selectLoading, value: false },
  { selector: selectVehiclesWithLocations, value: [] },
  { selector: selectSelectedVehicle, value: null },
  { selector: selectSelectedVehicleLocation, value: null },
];

const desktopBreakpoint = { provide: BreakpointObserver, useValue: { observe: jest.fn().mockReturnValue(of({ matches: false })) } };
const mobileBreakpoint = { provide: BreakpointObserver, useValue: { observe: jest.fn().mockReturnValue(of({ matches: true })) } };

const baseProviders = [
  { provide: GeocodingService, useValue: { reverseGeocode: jest.fn().mockReturnValue(of(null)) } },
  { provide: MatSnackBar, useValue: { open: jest.fn() } },
  desktopBreakpoint,
];

describe('VehicleTrackerComponent', () => {
  describe('initialisation', () => {
    it('dispatches loadUsers on init', async () => {
      const spy = jest.spyOn(Store.prototype, 'dispatch');

      await render(VehicleTrackerComponent, {
        providers: [
          provideMockStore({ selectors: baseSelectors }),
          ...baseProviders,
        ],
      });

      expect(spy).toHaveBeenCalledWith(UsersActions.loadUsers());
      spy.mockRestore();
    });
  });

  describe('toggle button', () => {
    const mockVehicle = { vehicleid: 1, make: 'Toyota', model: 'Camry', year: '2020', color: '#ff0000', foto: '', vin: 'V1' };
    const selectorsWithVehicle = [
      ...baseSelectors.filter(s =>
        s.selector !== VehicleDataFeature.selectSelectedVehicleId &&
        s.selector !== selectSelectedVehicle
      ),
      { selector: VehicleDataFeature.selectSelectedVehicleId, value: 1 },
      { selector: selectSelectedVehicle, value: mockVehicle },
    ];

    it('shows the toggle button when no vehicle is selected', async () => {
      await render(VehicleTrackerComponent, {
        providers: [provideMockStore({ selectors: baseSelectors }), ...baseProviders],
      });

      expect(screen.getByRole('button', { name: /sidebar/i })).toBeInTheDocument();
    });

    it('hides the toggle button on desktop when a vehicle is selected', async () => {
      await render(VehicleTrackerComponent, {
        providers: [
          provideMockStore({ selectors: selectorsWithVehicle }),
          ...baseProviders,
        ],
      });

      expect(screen.queryByRole('button', { name: /sidebar/i })).not.toBeInTheDocument();
    });

    it('shows the toggle button on mobile even when a vehicle is selected', async () => {
      await render(VehicleTrackerComponent, {
        providers: [
          provideMockStore({ selectors: selectorsWithVehicle }),
          { provide: GeocodingService, useValue: { reverseGeocode: jest.fn().mockReturnValue(of(null)) } },
          { provide: MatSnackBar, useValue: { open: jest.fn() } },
          mobileBreakpoint,
        ],
      });

      expect(screen.getByRole('button', { name: /sidebar/i })).toBeInTheDocument();
    });
  });

  describe('vehicle details panel', () => {
    it('shows the vehicle details panel when a vehicle is selected', async () => {
      const mockVehicle = { vehicleid: 1, make: 'Toyota', model: 'Camry', year: '2020', color: '#ff0000', foto: '', vin: 'V1' };
      await render(VehicleTrackerComponent, {
        providers: [
          provideMockStore({
            selectors: [
              ...baseSelectors.filter(s =>
                s.selector !== VehicleDataFeature.selectSelectedVehicleId &&
                s.selector !== selectSelectedVehicle
              ),
              { selector: VehicleDataFeature.selectSelectedVehicleId, value: 1 },
              { selector: selectSelectedVehicle, value: mockVehicle },
            ],
          }),
          ...baseProviders,
        ],
      });

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('hides the vehicle details panel when no vehicle is selected', async () => {
      await render(VehicleTrackerComponent, {
        providers: [
          provideMockStore({ selectors: baseSelectors }),
          ...baseProviders,
        ],
      });

      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });
  });
});
