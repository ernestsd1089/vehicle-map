import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, tap, timer } from 'rxjs';

import { retryWithCountdown } from '../../../../core/operators/retry-with-countdown';
import { CacheService } from '../../../../core/services/cache.service';
import { MobiService, LOCATIONS_KEY } from '../../services/mobi.service';
import { UsersActions } from '../users/users.actions';
import { VehicleDataActions } from './vehicle-data.actions';

@Injectable()
export class VehicleDataEffects {
  private readonly actions$ = inject(Actions);
  private readonly mobiService = inject(MobiService);
  private readonly cache = inject(CacheService);
  private readonly store = inject(Store);

  retryLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleDataActions.retryLocations),
      tap(({ userId }) => this.cache.delete(`${LOCATIONS_KEY}-${userId}`)),
      map(({ userId }) => UsersActions.selectUser({ userId })),
    ),
  );

  loadLocationsOnUserSelect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.selectUser),
      switchMap(({ userId }) =>
        timer(0, 60_000).pipe(
          switchMap(() =>
            this.mobiService.getLocations(userId).pipe(
              retryWithCountdown(this.store, VehicleDataActions.retryingLoadLocations),
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
