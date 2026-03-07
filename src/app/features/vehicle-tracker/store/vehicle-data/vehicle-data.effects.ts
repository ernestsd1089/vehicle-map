import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, timer } from 'rxjs';

import { MobiService } from '../../services/mobi.service';
import { UsersActions } from '../users/users.actions';
import { VehicleDataActions } from './vehicle-data.actions';

@Injectable()
export class VehicleDataEffects {
  private readonly actions$ = inject(Actions);
  private readonly mobiService = inject(MobiService);

  loadLocationsOnUserSelect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.selectUser),
      switchMap(({ userId }) =>
        timer(0, 60_000).pipe(
          switchMap(() =>
            this.mobiService.getLocations(userId).pipe(
              map((locations) => VehicleDataActions.loadLocationsSuccess({ locations })),
              catchError((error: unknown) =>
                of(
                  VehicleDataActions.loadLocationsFailure({
                    error: error instanceof Error ? error.message : 'Failed to load locations',
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
