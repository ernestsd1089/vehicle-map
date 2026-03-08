import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs';

import { UsersActions } from '../../features/vehicle-tracker/store/users/users.actions';
import { VehicleDataActions } from '../../features/vehicle-tracker/store/vehicle-data/vehicle-data.actions';

const SNACKBAR_CONFIG = {
  horizontalPosition: 'right' as const,
  verticalPosition: 'top' as const,
  panelClass: 'snackbar-error',
};

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);
  private readonly snackBar = inject(MatSnackBar);

  onRetrying$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.retryingLoadUsers, VehicleDataActions.retryingLoadLocations),
        tap(({ retryIn }) =>
          this.snackBar.open(`Failed to load data. Retrying in ${retryIn}s...`, undefined, {
            ...SNACKBAR_CONFIG,
            duration: 1000,
          }),
        ),
      ),
    { dispatch: false },
  );
}
