import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';

import { NotificationEffects } from './notification.effects';
import { UsersActions } from '../../features/vehicle-tracker/store/users/users.actions';
import { VehicleDataActions } from '../../features/vehicle-tracker/store/vehicle-data/vehicle-data.actions';

describe('NotificationEffects', () => {
  let actions$: Subject<Action>;
  let effects: NotificationEffects;
  let snackBarOpen: jest.Mock;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    snackBarOpen = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        NotificationEffects,
        provideMockActions(() => actions$),
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
      ],
    });

    effects = TestBed.inject(NotificationEffects);
  });

  describe('onRetrying$', () => {
    beforeEach(() => effects.onRetrying$.subscribe());

    it('opens an error snackbar when users are retrying', () => {
      actions$.next(UsersActions.retryingLoadUsers({ attempt: 1, retryIn: 3 }));

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to load data. Retrying in 3s...',
        undefined,
        expect.objectContaining({ panelClass: 'snackbar-error', duration: 1000 }),
      );
    });

    it('opens an error snackbar when vehicle locations are retrying', () => {
      actions$.next(VehicleDataActions.retryingLoadLocations({ attempt: 2, retryIn: 5 }));

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to load data. Retrying in 5s...',
        undefined,
        expect.objectContaining({ panelClass: 'snackbar-error', duration: 1000 }),
      );
    });

    it('includes the retryIn value in the message', () => {
      actions$.next(UsersActions.retryingLoadUsers({ attempt: 1, retryIn: 7 }));

      const [message] = snackBarOpen.mock.calls[0];
      expect(message).toContain('7s');
    });
  });

  describe('onRetrySucceeded$', () => {
    beforeEach(() => effects.onRetrySucceeded$.subscribe());

    it('opens a success snackbar when users retry succeeded', () => {
      actions$.next(UsersActions.retryLoadUsersSucceeded());

      expect(snackBarOpen).toHaveBeenCalledWith(
        'User list loaded successfully.',
        undefined,
        expect.objectContaining({ panelClass: 'snackbar-success', duration: 3000 }),
      );
    });

    it('opens a success snackbar when vehicle locations retry succeeded', () => {
      actions$.next(VehicleDataActions.retryLocationsSucceeded());

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Vehicle locations loaded successfully.',
        undefined,
        expect.objectContaining({ panelClass: 'snackbar-success', duration: 3000 }),
      );
    });
  });

  describe('onRetryFailed$', () => {
    beforeEach(() => effects.onRetryFailed$.subscribe());

    it('opens an error snackbar when manual retry locations failed', () => {
      actions$.next(VehicleDataActions.manualRetryLocationsFailed());

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Some vehicle locations could not be retrieved.',
        undefined,
        expect.objectContaining({ panelClass: 'snackbar-error', duration: 3000 }),
      );
    });
  });
});
