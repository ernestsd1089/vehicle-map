import { User } from '../../models/user.model';

export interface UsersState {
  users: User[];
  selectedUserId: number | null;
}

export const initialState: UsersState = {
  users: [],
  selectedUserId: null,
};
