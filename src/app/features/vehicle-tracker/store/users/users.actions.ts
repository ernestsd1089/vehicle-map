import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { User } from '../../models/user.model';

export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'load users': emptyProps(),
    'load users success': props<{ users: User[] }>(),
    'load users failure': props<{ error: string }>(),
  },
});
