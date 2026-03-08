import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs';

import { UsersActions } from '../../features/vehicle-tracker/store/users/users.actions';
import { VehicleDataActions } from '../../features/vehicle-tracker/store/vehicle-data/vehicle-data.actions';

const BASE_CONFIG = {
  horizontalPosition: 'right' as const,
  verticalPosition: 'top' as const,
};

const SUCCESS_MESSAGE: Record<string, string> = {
  [UsersActions.retryLoadUsersSucceeded.type]: 'User list loaded successfully.',
  [VehicleDataActions.retryLocationsSucceeded.type]: 'Vehicle locations loaded successfully.',
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
            ...BASE_CONFIG,
            panelClass: 'snackbar-error',
            duration: 1000,
          }),
        ),
      ),
    { dispatch: false },
  );

  onRetrySucceeded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.retryLoadUsersSucceeded, VehicleDataActions.retryLocationsSucceeded),
        tap(({ type }) =>
          this.snackBar.open(SUCCESS_MESSAGE[type], undefined, {
            ...BASE_CONFIG,
            panelClass: 'snackbar-success',
            duration: 3000,
          }),
        ),
      ),
    { dispatch: false },
  );
}
