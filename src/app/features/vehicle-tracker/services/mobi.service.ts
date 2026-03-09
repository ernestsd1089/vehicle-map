import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

import { CacheService } from '../../../core/services/cache.service';
import { VehicleLocation } from '../models/location.model';
import { User } from '../models/user.model';

const USERS_CACHE_TTL = 5 * 60 * 1000;
const LOCATIONS_CACHE_TTL = 30 * 1000;
const USERS_KEY = 'users';
export const LOCATIONS_KEY = 'locations';

@Injectable({ providedIn: 'root' })
export class MobiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  getUsers(): Observable<User[]> {
    const cached = this.cache.getIfValid<User[]>(USERS_KEY, USERS_CACHE_TTL);
    if (cached) return of(cached);

    return this.http.get<{ data: User[] }>('/api/?op=list').pipe(
      map((response) => response.data.filter((u) => !!u.userid)),
      tap((users) => this.cache.set(USERS_KEY, users)),
    );
  }

  getLocations(userId: number): Observable<VehicleLocation[]> {
    const cacheKey = LOCATIONS_KEY + `-${userId}`;
    const cached = this.cache.getIfValid<VehicleLocation[]>(cacheKey, LOCATIONS_CACHE_TTL);
    if (cached) return of(cached);

    return this.http
      .get<{ data: VehicleLocation[] }>(`/api/?op=getlocations&userid=${userId}`)
      .pipe(
        map((response) => response.data),
        tap((locations) => this.cache.set(cacheKey, locations)),
      );
  }
}
