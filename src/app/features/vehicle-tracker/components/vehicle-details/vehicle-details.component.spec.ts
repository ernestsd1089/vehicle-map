import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { VehicleDetailsComponent } from './vehicle-details.component';
import {
  selectSelectedVehicle,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { GeocodingService } from '../../services/geocoding.service';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleLocation } from '../../models/location.model';

const mockVehicle: Vehicle = {
  vehicleid: 1,
  make: 'Toyota',
  model: 'Camry',
  year: '2020',
  color: '#ff0000',
  foto: '',
  vin: 'VIN001',
};

const mockLocation: VehicleLocation = { vehicleid: 1, lat: 56.946, lon: 24.105 };

function buildProviders(overrides: {
  vehicle?: Vehicle | null;
  location?: VehicleLocation | null;
  address?: string | null;
} = {}) {
  const { vehicle = mockVehicle, location = mockLocation, address = 'Riga, Latvia' } = overrides;
  const reverseGeocode = jest.fn().mockReturnValue(of(address));

  return [
    provideMockStore({
      selectors: [
        { selector: selectSelectedVehicle, value: vehicle },
        { selector: selectSelectedVehicleLocation, value: location },
      ],
    }),
    { provide: GeocodingService, useValue: { reverseGeocode } },
    { provide: MatSnackBar, useValue: { open: jest.fn() } },
  ];
}

describe('VehicleDetailsComponent', () => {
  describe('when no vehicle is selected', () => {
    it('renders nothing', async () => {
      const { container } = await render(VehicleDetailsComponent, {
        providers: buildProviders({ vehicle: null, location: null, address: null }),
      });

      expect(container.querySelector('h3')).not.toBeInTheDocument();
    });
  });

  describe('when a vehicle is selected', () => {
    it('renders the vehicle year, make and model', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });

      expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
    });

    it('renders the color hex value', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });

      expect(screen.getByText('#ff0000')).toBeInTheDocument();
    });

    it('renders the VIN', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });

      expect(screen.getByText('VIN001')).toBeInTheDocument();
    });

    it('renders the geocoded address', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders({ address: 'Riga, Latvia' }) });

      expect(screen.getByText('Riga, Latvia')).toBeInTheDocument();
    });

    it('shows a Google Maps link when location is set', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('56.946'));
      expect(link).toHaveAttribute('href', expect.stringContaining('24.105'));
    });
  });

  describe('close', () => {
    it('dispatches deselectVehicle when the close button is clicked', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });
      const store = TestBed.inject(MockStore);
      const spy = jest.spyOn(store, 'dispatch');

      await userEvent.click(screen.getByRole('button'));

      expect(spy).toHaveBeenCalledWith(VehicleDataActions.deselectVehicle());
    });
  });

  describe('copy', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        configurable: true,
        writable: true,
      });
    });

    it('copies the VIN to the clipboard when the VIN row is clicked', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });

      await userEvent.click(screen.getByText('VIN001'));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('VIN001');
    });

    it('opens a snackbar after copying', async () => {
      await render(VehicleDetailsComponent, { providers: buildProviders() });
      const snackBar = TestBed.inject(MatSnackBar);

      await userEvent.click(screen.getByText('VIN001'));
      await Promise.resolve(); // flush the clipboard promise

      expect(snackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('copied'),
        undefined,
        expect.objectContaining({ duration: 2000 }),
      );
    });
  });
});
