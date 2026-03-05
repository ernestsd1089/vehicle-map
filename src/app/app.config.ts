import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { UsersFeature } from './features/vehicle-tracker/store/users/users.reducer';
import { UsersEffects } from './features/vehicle-tracker/store/users/users.effects';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideStore(),
    provideState(UsersFeature),
    provideEffects([UsersEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    provideRouter(routes),
  ],
};
