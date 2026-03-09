import { Component, computed, inject, linkedSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';

import { VehicleDataFeature } from '../../store/vehicle-data/vehicle-data.reducer';
import { VehicleDataActions } from '../../store/vehicle-data/vehicle-data.actions';
import { GeocodingService } from '../../services/geocoding.service';
import { SNACKBAR_DURATION, SNACKBAR_POSITION } from '../../../../shared/constants/snackbar.constants';

@Component({
  selector: 'app-vehicle-details-sheet',
  templateUrl: './vehicle-details-sheet.component.html',
  imports: [MatIconModule, MatIconButton, MatDividerModule, MatTooltipModule],
})
export class VehicleDetailsSheetComponent {
  private readonly store = inject(Store);
  private readonly geocoding = inject(GeocodingService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly vehicle = this.store.selectSignal(VehicleDataFeature.selectSelectedVehicle);
  protected readonly vehicleLocation = this.store.selectSignal(VehicleDataFeature.VehicleDataFeature.selectSelectedVehicleLocation);
  protected readonly imgError = linkedSignal(() => { this.vehicle(); return false; });
  protected readonly imgLoaded = linkedSignal(() => { this.vehicle(); return false; });
  protected readonly showImgPlaceholder = computed(() => !this.imgLoaded() || this.imgError());

  protected readonly address = toSignal(
    this.store.select(VehicleDataFeature.VehicleDataFeature.selectSelectedVehicleLocation).pipe(
      switchMap((location) =>
        location ? this.geocoding.reverseGeocode(location.lat, location.lon) : of(null),
      ),
    ),
  );

  close(): void {
    this.store.dispatch(VehicleDataActions.deselectVehicle());
  }

  copy(label: string, value: string | null | undefined): void {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open(`${label} copied to clipboard`, undefined, {
        ...SNACKBAR_POSITION,
        duration: SNACKBAR_DURATION.COPY,
      });
    });
  }
}
