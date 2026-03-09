import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, tap, timer, withLatestFrom } from 'rxjs';

import { retryWithCountdown } from '../../../../core/operators/retry-with-countdown';
import { CacheService } from '../../../../core/services/cache.service';
import { MobiService, LOCATIONS_KEY } from '../../services/mobi.service';

import { UsersActions } from '../users/users.actions';
import { VehicleDataActions } from './vehicle-data.actions';
import { VehicleDataFeature } from './vehicle-data.reducer';

const LOCATION_RELOAD_INTERVAL = 60_000;

@Injectable()
export class VehicleDataEffects {
  private readonly actions$ = inject(Actions);
  private readonly mobiService = inject(MobiService);
  private readonly cache = inject(CacheService);
  private readonly store = inject(Store);

  private locationRetryPending = false;

  retryLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleDataActions.retryLocations),
      tap(({ userId }) => this.cache.delete(`${LOCATIONS_KEY}-${userId}`)),
      map(({ userId }) => UsersActions.selectUser({ userId })),
    ),
  );

  onLocationRetryStarted$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(VehicleDataActions.retryingLoadLocations, VehicleDataActions.retryLocations),
        tap(() => {
          this.locationRetryPending = true;
        }),
      ),
    { dispatch: false },
  );

  onLocationResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleDataActions.loadLocationsSuccess, VehicleDataActions.loadLocationsFailure),
      filter(() => {
        const wasRetrying = this.locationRetryPending;
        this.locationRetryPending = false;
        return wasRetrying;
      }),
      withLatestFrom(this.store.select(VehicleDataFeature.selectVehiclesWithLocations)),
      map(([{ type }, vehiclesWithLocations]) => {
        const allResolved =
          type === VehicleDataActions.loadLocationsSuccess.type &&
          vehiclesWithLocations.every((v) => v.location !== null);
        return allResolved
          ? VehicleDataActions.retryLocationsSucceeded()
          : VehicleDataActions.manualRetryLocationsFailed();
      }),
    ),
  );

  loadLocationsOnUserSelect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.selectUser),
      switchMap(({ userId }) =>
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
  );

  periodicLocationReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.selectUser),
      switchMap(({ userId }) =>
        timer(LOCATION_RELOAD_INTERVAL, LOCATION_RELOAD_INTERVAL).pipe(
          switchMap(() => {
            this.cache.delete(`${LOCATIONS_KEY}-${userId}`);
            return this.mobiService.getLocations(userId).pipe(
              retryWithCountdown(this.store, VehicleDataActions.retryingLoadLocations),
              map((locations) => VehicleDataActions.loadLocationsSuccess({ locations })),
              catchError((error: unknown) =>
                of(
                  VehicleDataActions.loadLocationsFailure({
                    error: error instanceof Error ? error.message : 'Failed to load locations',
                  }),
                ),
              ),
            );
          }),
        ),
      ),
    ),
  );
}
