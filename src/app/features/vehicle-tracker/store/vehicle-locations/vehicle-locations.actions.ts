import { createActionGroup, props } from '@ngrx/store';

import { VehicleLocation } from '../../models/location.model';

export const VehicleLocationsActions = createActionGroup({
  source: 'Vehicle Locations',
  events: {
    'load locations success': props<{ locations: VehicleLocation[] }>(),
    'load locations failure': props<{ error: string }>(),
  },
});
