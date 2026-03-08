import { of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';

import { retryWithCountdown, RETRY_COUNT } from './retry-with-countdown';

describe('retryWithCountdown', () => {
  let store: jest.Mocked<Pick<Store, 'dispatch'>>;
  let actionCreator: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    store = { dispatch: jest.fn() } as unknown as jest.Mocked<Pick<Store, 'dispatch'>>;
    actionCreator = jest.fn((props) => ({ type: '[Test] Countdown', ...props }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not retry or dispatch when the source succeeds', () => {
    of('success')
      .pipe(retryWithCountdown(store as unknown as Store, actionCreator, 3))
      .subscribe();

    jest.advanceTimersByTime(20000);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('propagates the error after exhausting retries', () => {
    const error = new Error('fail');
    let capturedError: unknown;

    throwError(() => error)
      .pipe(retryWithCountdown(store as unknown as Store, actionCreator, 1))
      .subscribe({ error: (e) => (capturedError = e) });

    jest.advanceTimersByTime(3000);

    expect(capturedError).toBe(error);
  });

  it('dispatches countdown actions for each retry attempt', () => {
    throwError(() => new Error('fail'))
      .pipe(retryWithCountdown(store as unknown as Store, actionCreator, 2))
      .subscribe({ error: () => {} });

    // attempt 1: 2s delay → attempt 2: 4s delay
    jest.advanceTimersByTime(8000);

    expect(actionCreator).toHaveBeenCalledWith({ attempt: 1, retryIn: 2 });
    expect(actionCreator).toHaveBeenCalledWith({ attempt: 1, retryIn: 1 });
    expect(actionCreator).toHaveBeenCalledWith({ attempt: 2, retryIn: 4 });
    expect(actionCreator).toHaveBeenCalledWith({ attempt: 2, retryIn: 3 });
    expect(actionCreator).toHaveBeenCalledWith({ attempt: 2, retryIn: 2 });
    expect(actionCreator).toHaveBeenCalledWith({ attempt: 2, retryIn: 1 });
  });
});
