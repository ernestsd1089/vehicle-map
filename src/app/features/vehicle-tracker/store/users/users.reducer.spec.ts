import { UsersFeature } from './users.reducer';
import { UsersActions } from './users.actions';
import { initialState } from './users.state';
import { User } from '../../models/user.model';

const mockUser: User = {
  userid: 1,
  owner: { ownerid: 1, name: 'Alice' } as any,
  vehicles: [{ vehicleid: 10, make: 'Toyota', model: 'Camry', year: '2020', color: '#ff0000', foto: '', vin: 'ABC123' }],
};

describe('UsersFeature reducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = UsersFeature.reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  describe('loadUsers', () => {
    it('sets loading to true', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.loadUsers());
      expect((state as any).loading).toBe(true);
    });

    it('clears a previous error', () => {
      const stateWithError = { ...initialState, error: 'previous error' } as any;
      const state = UsersFeature.reducer(stateWithError, UsersActions.loadUsers());
      expect((state as any).error).toBeNull();
    });
  });

  describe('loadUsersSuccess', () => {
    it('sets loading to false', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.loadUsersSuccess({ users: [] }));
      expect((state as any).loading).toBe(false);
    });

    it('stores the loaded users', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.loadUsersSuccess({ users: [mockUser] }));
      expect(state.users).toEqual([mockUser]);
    });
  });

  describe('loadUsersFailure', () => {
    it('sets loading to false', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.loadUsersFailure({ error: 'err' }));
      expect((state as any).loading).toBe(false);
    });

    it('stores the error message', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.loadUsersFailure({ error: 'Network error' }));
      expect((state as any).error).toBe('Network error');
    });
  });

  describe('selectUser', () => {
    it('sets the selected user id', () => {
      const state = UsersFeature.reducer(initialState, UsersActions.selectUser({ userId: 42 }));
      expect(state.selectedUserId).toBe(42);
    });

    it('replaces a previously selected user id', () => {
      const stateWithSelection = { ...initialState, selectedUserId: 1 };
      const state = UsersFeature.reducer(stateWithSelection, UsersActions.selectUser({ userId: 99 }));
      expect(state.selectedUserId).toBe(99);
    });
  });
});
