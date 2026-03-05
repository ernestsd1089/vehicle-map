import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/vehicle-tracker/vehicle-tracker.component').then(
        m => m.VehicleTrackerComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];