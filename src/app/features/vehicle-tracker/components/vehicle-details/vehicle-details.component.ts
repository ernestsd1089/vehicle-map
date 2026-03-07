import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSelectedVehicle } from '../../store/vehicle-data/vehicle-data.reducer';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
})
export class VehicleDetailsComponent {
  store = inject(Store);
  vehicle = this.store.selectSignal(selectSelectedVehicle);
}
