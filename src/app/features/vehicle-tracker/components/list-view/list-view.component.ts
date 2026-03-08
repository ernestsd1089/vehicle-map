import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { UsersActions } from '../../store/users/users.actions';
import { UsersFeature } from '../../store/users/users.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { selectVehiclesWithLocations, VehicleDataFeature } from '../../store/vehicle-data/vehicle-data.reducer';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  imports: [MatListModule, MatFormFieldModule, MatInputModule, FormsModule, MarkerComponent],
})
export class ListViewComponent {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  users = this.store.selectSignal(UsersFeature.selectUsers);
  selectedUserId = this.store.selectSignal(UsersFeature.selectSelectedUserId);
  selectedVehicleId = this.store.selectSignal(VehicleDataFeature.selectSelectedVehicleId);
  vehiclesWithLocations = this.store.selectSignal(selectVehiclesWithLocations);
  locationsLoading = this.store.selectSignal(VehicleDataFeature.selectLoading);

  searchQuery = signal('');
  retryCountdown = signal(0);

  private retryAttempt = 0;
  private retryTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.resetRetry());
  }

  hasVehicleWithoutLocation = computed(() =>
    !this.locationsLoading() && this.vehiclesWithLocations().some((v) => !v.location),
  );

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter((user) => this.matchesQuery(user, query));
  });

  private matchesQuery(user: User, query: string): boolean {
    const { name, surname } = user.owner;
    if (`${name} ${surname}`.toLowerCase().includes(query)) return true;
    return user.vehicles.some((v) =>
      [v.make, v.model, v.year, v.vin].some((field) => field.toLowerCase().includes(query)),
    );
  }

  selectUser(userId: number) {
    if (this.selectedUserId() === userId && this.retryCountdown() > 0) return;
    this.store.dispatch(UsersActions.selectUser({ userId }));
  }

  selectVehicle(vehicleId: number) {
    this.store.dispatch(VehicleDataActions.selectVehicle({ vehicleId }));
  }

  retryLocations(userId: number) {
    this.retryAttempt++;
    const seconds = this.retryAttempt * 2;
    this.retryCountdown.set(seconds);

    if (this.retryTimer) clearInterval(this.retryTimer);
    this.retryTimer = setInterval(() => {
      const remaining = this.retryCountdown() - 1;
      this.retryCountdown.set(remaining);
      if (remaining <= 0) {
        clearInterval(this.retryTimer!);
        this.retryTimer = null;
      }
    }, 1000);

    this.store.dispatch(VehicleDataActions.retryLocations({ userId }));
  }

  private resetRetry() {
    this.retryAttempt = 0;
    this.retryCountdown.set(0);
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
