import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Store } from '@ngrx/store';

import {
  selectSelectedVehicle,
  selectSelectedVehicleLocation,
} from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { GeocodingService } from '../../../../shared/services/geocoding.service';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  imports: [MatIconModule, MatIconButton, MatDividerModule, MatTooltipModule],
})
export class VehicleDetailsComponent {
  private readonly store = inject(Store);
  private readonly geocoding = inject(GeocodingService);

  vehicle = this.store.selectSignal(selectSelectedVehicle);
  vehicleLocation = this.store.selectSignal(selectSelectedVehicleLocation);

  copiedField = signal<string | null>(null);
  imgError = signal(false);

  close() {
    this.store.dispatch(VehicleDataActions.deselectVehicle());
  }

  copy(field: string, value: string | null | undefined): void {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(null), 2000);
    });
  }

  address = toSignal(
    toObservable(this.store.selectSignal(selectSelectedVehicleLocation)).pipe(
      switchMap((location) =>
        location ? this.geocoding.reverseGeocode(location.lat, location.lon) : of(null),
      ),
    ),
  );
}
