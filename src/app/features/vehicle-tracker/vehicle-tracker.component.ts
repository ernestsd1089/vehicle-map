import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';

import { ListViewComponent } from './components/list-view/list-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details.component';
import { PanelComponent } from '../../shared/components/panel/panel.component';
import { UsersActions } from './store/users/users.actions';
import { UsersFeature } from './store/users/users.reducer';
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
  private readonly store = inject(Store);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly drawerOpen = signal(true);

  protected readonly selectedVehicleId = this.store.selectSignal(
    VehicleDataFeature.selectSelectedVehicleId,
  );

  private readonly selectedUserId = this.store.selectSignal(UsersFeature.selectSelectedUserId);

  constructor() {
    effect(() => {
      if (this.selectedVehicleId() && !this.isMobile()) this.drawerOpen.set(true);
    });

    effect(() => {
      const userId = this.selectedUserId();
      const vehicleId = this.selectedVehicleId();
      if ((userId || vehicleId) && this.isMobile()) {
        this.drawerOpen.set(false);
      }
    });
  }

  protected toggleDrawer(): void {
    if (this.isMobile()) {
      this.drawerOpen.set(true);
    } else {
      this.drawerOpen.update((v) => !v);
    }
  }

  ngOnInit(): void {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
