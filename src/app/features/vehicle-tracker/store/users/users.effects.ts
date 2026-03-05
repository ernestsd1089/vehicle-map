import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { MobiService } from '../../services/mobi.service';
import { UsersActions } from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly mobiService = inject(MobiService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(() =>
        this.mobiService.getUsers().pipe(
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
