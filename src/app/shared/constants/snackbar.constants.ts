import { MatSnackBarConfig } from '@angular/material/snack-bar';

export const SNACKBAR_POSITION: Pick<MatSnackBarConfig, 'horizontalPosition' | 'verticalPosition'> = {
  horizontalPosition: 'right',
  verticalPosition: 'top',
};

export const SNACKBAR_DURATION = {
  TRANSIENT: 1000,
  COPY: 2000,
  RESULT: 3000,
} as const;
