import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { retryWithCountdown } from '../../../../core/operators/retry-with-countdown';
import { MobiService } from '../../services/mobi.service';
import { UsersActions } from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly mobiService = inject(MobiService);
  private readonly store = inject(Store);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(() =>
        this.mobiService.getUsers().pipe(
          retryWithCountdown(this.store, UsersActions.retryingLoadUsers),
          map((users) => UsersActions.loadUsersSuccess({ users })),
          catchError((error: unknown) =>
            of(
              UsersActions.loadUsersFailure({
                error: error instanceof Error ? error.message : 'Failed to load users',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
