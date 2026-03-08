import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject, of } from 'rxjs';
import { Action } from '@ngrx/store';

import { UsersEffects } from './users.effects';
import { UsersActions } from './users.actions';
import { MobiService } from '../../services/mobi.service';
import { User } from '../../models/user.model';

const mockUser: User = {
  userid: 1,
  owner: { ownerid: 1, name: 'Alice' } as any,
  vehicles: [],
};

describe('UsersEffects', () => {
  let actions$: Subject<Action>;
  let effects: UsersEffects;
  let getUsers: jest.Mock;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    getUsers = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        UsersEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: MobiService, useValue: { getUsers } },
      ],
    });

    effects = TestBed.inject(UsersEffects);
  });

  describe('loadUsers$', () => {
    it('dispatches loadUsersSuccess with users on success', (done) => {
      getUsers.mockReturnValue(of([mockUser]));

      effects.loadUsers$.subscribe((action) => {
        expect(action).toEqual(UsersActions.loadUsersSuccess({ users: [mockUser] }));
        done();
      });

      actions$.next(UsersActions.loadUsers());
    });

    it('calls the mobi service when loadUsers is dispatched', (done) => {
      getUsers.mockReturnValue(of([]));

      effects.loadUsers$.subscribe(() => {
        expect(getUsers).toHaveBeenCalledTimes(1);
        done();
      });

      actions$.next(UsersActions.loadUsers());
    });
  });

  describe('onUserResult$', () => {
    it('dispatches retryLoadUsersSucceeded after a successful retry', (done) => {
      // Subscribe to the side-effect effect so userRetryPending gets set via its tap
      effects.onUserRetryStarted$.subscribe();

      effects.onUserResult$.subscribe((action) => {
        expect(action).toEqual(UsersActions.retryLoadUsersSucceeded());
        done();
      });

      actions$.next(UsersActions.retryingLoadUsers({ attempt: 1, retryIn: 1 }));
      actions$.next(UsersActions.loadUsersSuccess({ users: [] }));
    });

    it('does not dispatch when loadUsersSuccess was not preceded by a retry', () => {
      const dispatched: Action[] = [];
      effects.onUserResult$.subscribe((a) => dispatched.push(a));

      actions$.next(UsersActions.loadUsersSuccess({ users: [] }));

      expect(dispatched).toHaveLength(0);
    });

    it('does not dispatch when loadUsersFailure occurs during retry', () => {
      effects.onUserRetryStarted$.subscribe();

      const dispatched: Action[] = [];
      effects.onUserResult$.subscribe((a) => dispatched.push(a));

      actions$.next(UsersActions.retryingLoadUsers({ attempt: 1, retryIn: 1 }));
      actions$.next(UsersActions.loadUsersFailure({ error: 'err' }));

      expect(dispatched).toHaveLength(0);
    });
  });
});
