import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

interface NominatimResponse {
  display_name: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  reverseGeocode(lat: number, lon: number): Observable<string> {
    return this.http
      .get<NominatimResponse>('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon, format: 'json' },
      })
      .pipe(
        map((r) => r.display_name),
        catchError(() => of('Address unavailable')),
      );
  }
}
