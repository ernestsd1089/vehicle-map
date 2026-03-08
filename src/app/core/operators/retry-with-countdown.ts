import { Action, Store } from '@ngrx/store';
import { last, MonoTypeOperatorFunction, retry, take, tap, timer } from 'rxjs';

export const RETRY_COUNT = 3;

export function retryWithCountdown<T>(
  store: Store,
  actionCreator: (props: { attempt: number; retryIn: number }) => Action,
  count: number = RETRY_COUNT,
): MonoTypeOperatorFunction<T> {
  return retry({
    count,
    delay: (_, attempt) => {
      const totalSeconds = attempt * 2;
      return timer(0, 1000).pipe(
        take(totalSeconds + 1),
        tap((tick) => {
          const retryIn = totalSeconds - tick;
          if (retryIn > 0) {
            store.dispatch(actionCreator({ attempt, retryIn }));
          }
        }),
        last(),
      );
    },
  });
}
