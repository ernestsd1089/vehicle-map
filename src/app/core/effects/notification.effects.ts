import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs';

import { UsersActions } from '../../features/vehicle-tracker/store/users/users.actions';
import { VehicleDataActions } from '../../features/vehicle-tracker/store/vehicle-data/vehicle-data.actions';

const SNACKBAR_CONFIG = {
  duration: 5000,
  horizontalPosition: 'right' as const,
  verticalPosition: 'top' as const,
  panelClass: 'snackbar-error',
};

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);
  private readonly snackBar = inject(MatSnackBar);

  onFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UsersActions.loadUsersFailure, VehicleDataActions.loadLocationsFailure),
        tap(({ error }) => this.snackBar.open(error, undefined, SNACKBAR_CONFIG)),
      ),
    { dispatch: false },
  );
}
