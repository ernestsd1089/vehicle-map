import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Store } from '@ngrx/store';

import {
  selectSelectedVehicle,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { GeocodingService } from '../../../../shared/services/geocoding.service';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
})
export class VehicleDetailsComponent {
  private readonly store = inject(Store);
  private readonly geocoding = inject(GeocodingService);

  vehicle = this.store.selectSignal(selectSelectedVehicle);

  address = toSignal(
    toObservable(this.store.selectSignal(selectSelectedVehicleLocation)).pipe(
      switchMap((location) =>
        location ? this.geocoding.reverseGeocode(location.lat, location.lon) : of(null),
      ),
    ),
  );
}
