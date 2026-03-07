import { Component, effect, inject, ViewChild } from '@angular/core';
import { ListViewComponent } from './components/list-view/list-view.component';
import { MobiService } from './services/mobi.service';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { UsersActions } from './store/users/users.actions';
import { MapViewComponent } from './components/map-view/map-view.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { VehicleDataFeature } from './store/vehicle-data/vehicle-data.reducer';

@Component({
  selector: 'app-vehicle-tracker',
  templateUrl: './vehicle-tracker.component.html',
  styleUrl: './vehicle-tracker.component.scss',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    ListViewComponent,
    MapViewComponent,
    VehicleDetailsComponent,
  ],
})
export class VehicleTrackerComponent {
  @ViewChild('drawer') drawer!: MatDrawer;

  mobiService = inject(MobiService);
  store = inject(Store);

  selectedVehicleId = this.store.selectSignal(VehicleDataFeature.selectSelectedVehicleId);

  constructor() {
    effect(() => {
      if (this.selectedVehicleId()) {
        this.drawer?.open();
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
