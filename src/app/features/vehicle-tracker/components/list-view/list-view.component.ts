import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { UsersActions } from '../../store/users/users.actions';
import { UsersFeature } from '../../store/users/users.reducer';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  imports: [MatListModule],
})
export class ListViewComponent {
  store = inject(Store);

  users = this.store.selectSignal(UsersFeature.selectUsers);
  selectedUserId = this.store.selectSignal(UsersFeature.selectSelectedUserId);

  selectUser(userId: number) {
    this.store.dispatch(UsersActions.selectUser({ userId }));
  }
}
