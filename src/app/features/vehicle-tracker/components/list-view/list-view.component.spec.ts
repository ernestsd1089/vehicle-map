import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ListViewComponent } from './list-view.component';
import { UsersFeature } from '../../store/users/users.reducer';
import { VehicleDataFeature, selectVehiclesWithLocations } from '../../store/vehicle-data/vehicle-data.reducer';
import { UsersActions } from '../../store/users/users.actions';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { User } from '../../models/user.model';
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

const mockUser: User = {
  userid: 1,
  owner: { name: 'Alice', surname: 'Smith', foto: '' },
  vehicles: [mockVehicle],
};

const mockLocation: VehicleLocation = { vehicleid: 1, lat: 56.946, lon: 24.105 };

function buildSelectors(overrides: Partial<{
  users: User[];
  selectedUserId: number | null;
  selectedVehicleId: number | null;
  vehiclesWithLocations: any[];
  loading: boolean;
}> = {}) {
  const opts = {
    users: [mockUser],
    selectedUserId: null,
    selectedVehicleId: null,
    vehiclesWithLocations: [],
    loading: false,
    ...overrides,
  };
  return [
    { selector: UsersFeature.selectUsers, value: opts.users },
    { selector: UsersFeature.selectSelectedUserId, value: opts.selectedUserId },
    { selector: VehicleDataFeature.selectSelectedVehicleId, value: opts.selectedVehicleId },
    { selector: selectVehiclesWithLocations, value: opts.vehiclesWithLocations },
    { selector: VehicleDataFeature.selectLoading, value: opts.loading },
  ];
}

async function renderList(overrides = {}) {
  return render(ListViewComponent, {
    providers: [provideMockStore({ selectors: buildSelectors(overrides) })],
  });
}

describe('ListViewComponent', () => {
  describe('rendering', () => {
    it('renders the user full name', async () => {
      await renderList();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('renders the vehicle count', async () => {
      await renderList();
      expect(screen.getByText('1 vehicle(s)')).toBeInTheDocument();
    });

    it('shows the avatar image when the user has a foto', async () => {
      const userWithFoto: User = { ...mockUser, owner: { ...mockUser.owner, foto: '/avatars/alice.jpg' } };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [userWithFoto] }) })],
      });

      expect(screen.getByRole('img')).toHaveAttribute('src', '/avatars/alice.jpg');
    });

    it('shows initials placeholder when the user has no foto', async () => {
      await renderList(); // mockUser has foto: ''

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('AS')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    const twoUsers: User[] = [
      mockUser,
      { userid: 2, owner: { name: 'Bob', surname: 'Jones', foto: '' }, vehicles: [] },
    ];

    it('filters users by owner name', async () => {
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: twoUsers }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'Alice');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    });

    it('shows all users when search query is cleared', async () => {
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: twoUsers }) })],
      });

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Alice');
      await userEvent.clear(input);

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('filters by vehicle make', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), 'toyota');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('shows no users when query matches nothing', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), 'zzznomatch');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('is case-insensitive when filtering by owner name', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), 'ALICE');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('filters by vehicle model', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), 'camry');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('filters by vehicle year', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), '2020');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('filters by VIN', async () => {
      await renderList();

      await userEvent.type(screen.getByRole('textbox'), 'VIN001');

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  describe('search with null/undefined/empty vehicle fields', () => {
    it('does not crash and excludes user when vehicle make is null', async () => {
      const vehicle = { ...mockVehicle, make: null as unknown as string };
      const user: User = { ...mockUser, vehicles: [vehicle] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'toyota');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('does not crash and excludes user when vehicle model is null', async () => {
      const vehicle = { ...mockVehicle, model: null as unknown as string };
      const user: User = { ...mockUser, vehicles: [vehicle] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'camry');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('does not crash and excludes user when vehicle year is undefined', async () => {
      const vehicle = { ...mockVehicle, year: undefined as unknown as string };
      const user: User = { ...mockUser, vehicles: [vehicle] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), '2020');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('does not crash and excludes user when vehicle vin is undefined', async () => {
      const vehicle = { ...mockVehicle, vin: undefined as unknown as string };
      const user: User = { ...mockUser, vehicles: [vehicle] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'VIN001');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('does not crash when all vehicle fields are empty strings', async () => {
      const vehicle: Vehicle = { ...mockVehicle, make: '', model: '', year: '', vin: '' };
      const user: User = { ...mockUser, vehicles: [vehicle] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'toyota');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('does not crash when the user has no vehicles', async () => {
      const user: User = { ...mockUser, vehicles: [] };
      await render(ListViewComponent, {
        providers: [provideMockStore({ selectors: buildSelectors({ users: [user] }) })],
      });

      await userEvent.type(screen.getByRole('textbox'), 'toyota');

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

  });

  describe('user selection', () => {
    it('dispatches selectUser when clicking a user', async () => {
      await renderList();
      const store = TestBed.inject(MockStore);
      const spy = jest.spyOn(store, 'dispatch');

      await userEvent.click(screen.getByText('Alice Smith'));

      expect(spy).toHaveBeenCalledWith(UsersActions.selectUser({ userId: 1 }));
    });
  });

  describe('vehicle list', () => {
    it('shows vehicle title when user is selected', async () => {
      const vehicleWithLoc = { ...mockVehicle, location: mockLocation };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleWithLoc] });

      expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
    });

    it('shows "No location available" for vehicles without a location', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc] });

      expect(screen.getByText('No location available')).toBeInTheDocument();
    });

    it('dispatches selectVehicle when clicking a vehicle with a location', async () => {
      const vehicleWithLoc = { ...mockVehicle, location: mockLocation };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleWithLoc] });
      const store = TestBed.inject(MockStore);
      const spy = jest.spyOn(store, 'dispatch');

      await userEvent.click(screen.getByText('2020 Toyota Camry'));

      expect(spy).toHaveBeenCalledWith(VehicleDataActions.selectVehicle({ vehicleId: 1 }));
    });

    it('does not dispatch selectVehicle when clicking a vehicle without a location', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc] });
      const store = TestBed.inject(MockStore);
      const spy = jest.spyOn(store, 'dispatch');

      await userEvent.click(screen.getByText('2020 Toyota Camry'));

      expect(spy).not.toHaveBeenCalledWith(VehicleDataActions.selectVehicle(expect.anything()));
    });
  });

  describe('retry button', () => {
    it('shows the retry button when the selected user has vehicles without a location', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc], loading: false });

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('does not show the retry button when all vehicles have locations', async () => {
      const vehicleWithLoc = { ...mockVehicle, location: mockLocation };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleWithLoc], loading: false });

      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('does not show the retry button while locations are loading', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc], loading: true });

      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('dispatches retryLocations when retry is clicked', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc] });
      const store = TestBed.inject(MockStore);
      const spy = jest.spyOn(store, 'dispatch');

      await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

      expect(spy).toHaveBeenCalledWith(VehicleDataActions.retryLocations({ userId: 1 }));
    });

    it('shows countdown text after retry is clicked', async () => {
      const vehicleNoLoc = { ...mockVehicle, location: null };
      await renderList({ selectedUserId: 1, vehiclesWithLocations: [vehicleNoLoc] });

      await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

      // retryCountdown is set synchronously on click, so the text updates immediately
      expect(screen.getByRole('button', { name: /Retry in/ })).toBeInTheDocument();
    });
  });
});
