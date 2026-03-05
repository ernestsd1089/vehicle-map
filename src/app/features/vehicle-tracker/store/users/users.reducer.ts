import { createFeature, createReducer, on } from '@ngrx/store';

import { UsersActions } from './users.actions';
import { initialState } from './users.state';

export const UsersFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialState,
    on(UsersActions.loadUsers, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(UsersActions.loadUsersSuccess, (state, { users }) => ({
      ...state,
      loading: false,
      users,
    })),
    on(UsersActions.loadUsersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});
