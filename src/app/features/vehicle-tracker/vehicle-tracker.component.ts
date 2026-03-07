import { Component, effect, inject, OnInit, viewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';

import { ListViewComponent } from './components/list-view/list-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { PanelComponent } from '../../shared/components/panel/panel.component';
import { UsersActions } from './store/users/users.actions';
import { VehicleDataFeature } from './store/vehicle-data/vehicle-data.reducer';

@Component({
  selector: 'app-vehicle-tracker',
  templateUrl: './vehicle-tracker.component.html',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    ListViewComponent,
    MapViewComponent,
    VehicleDetailsComponent,
    PanelComponent,
  ],
})
export class VehicleTrackerComponent implements OnInit {
  private readonly drawer = viewChild.required<MatDrawer>('drawer');

  private readonly store = inject(Store);

  protected readonly selectedVehicleId = this.store.selectSignal(
    VehicleDataFeature.selectSelectedVehicleId,
  );

  constructor() {
    effect(() => {
      if (this.selectedVehicleId()) this.drawer().open();
    });
  }

  ngOnInit(): void {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
