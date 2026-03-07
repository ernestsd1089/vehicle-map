import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { NotificationEffects } from './core/effects/notification.effects';

import { vehicleTrackerProviders } from './features/vehicle-tracker/vehicle-tracker.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideStore(),
    ...vehicleTrackerProviders,
    provideStoreDevtools({ maxAge: 25 }),
    provideRouter(routes),
    provideEffects([NotificationEffects]),
  ],
};
