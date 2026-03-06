import { Component, inject } from '@angular/core';
import { ListViewComponent } from './components/list-view/list-view.component';
import { MobiService } from './services/mobi.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { UsersActions } from './store/users/users.actions';
import { MapViewComponent } from './components/map-view/map-view.component';

@Component({
  selector: 'app-vehicle-tracker',
  templateUrl: './vehicle-tracker.component.html',
  styleUrl: './vehicle-tracker.component.scss',
  imports: [MatSidenavModule, MatIconModule, MatButtonModule, ListViewComponent, MapViewComponent],
})
export class VehicleTrackerComponent {
  mobiService = inject(MobiService);
  store = inject(Store);
  ngOnInit() {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
