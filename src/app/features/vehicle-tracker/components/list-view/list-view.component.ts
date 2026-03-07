import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { UsersActions } from '../../store/users/users.actions';
import { UsersFeature } from '../../store/users/users.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { selectVehiclesWithLocations, VehicleDataFeature } from '../../store/vehicle-data/vehicle-data.reducer';
import { MarkerComponent } from '../../../../shared/components/marker/marker.component';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  imports: [MatListModule, MarkerComponent],
})
export class ListViewComponent {
  store = inject(Store);

  users = this.store.selectSignal(UsersFeature.selectUsers);
  selectedUserId = this.store.selectSignal(UsersFeature.selectSelectedUserId);
  selectedVehicleId = this.store.selectSignal(VehicleDataFeature.selectSelectedVehicleId);
  vehiclesWithLocations = this.store.selectSignal(selectVehiclesWithLocations);

  selectUser(userId: number) {
    this.store.dispatch(UsersActions.selectUser({ userId }));
  }

  selectVehicle(vehicleId: number) {
    this.store.dispatch(VehicleDataActions.selectVehicle({ vehicleId }));
  }
}
