import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { VehicleLocation } from '../../models/location.model';

export const VehicleDataActions = createActionGroup({
  source: 'Vehicle Data',
  events: {
    'load locations success': props<{ locations: VehicleLocation[] }>(),
    'load locations failure': props<{ error: string }>(),
    'retrying load locations': props<{ attempt: number; retryIn: number }>(),
    'select vehicle': props<{ vehicleId: number }>(),
    'deselect vehicle': emptyProps(),
  },
});
