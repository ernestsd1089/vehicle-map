import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { CacheService } from '../../../core/services/cache.service';

interface NominatimResponse {
  display_name: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  reverseGeocode(lat: number, lon: number): Observable<string> {
    const key = `geocode-${lat}-${lon}`;
    const cached = this.cache.getIfValid<string>(key, Infinity);
    if (cached !== null) return of(cached);

    return this.http
      .get<NominatimResponse>('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon, format: 'json' },
      })
      .pipe(
        map((r) => r.display_name),
        tap((address) => this.cache.set(key, address)),
        catchError(() => of('Address unavailable')),
      );
  }
}
