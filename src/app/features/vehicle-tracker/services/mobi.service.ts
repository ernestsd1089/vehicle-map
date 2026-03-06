import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { VehicleLocation } from '../models/location.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class MobiService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<{ data: User[] }>('/api/?op=list').pipe(
      map(response => response.data)
    );
  }

  getLocations(userId: number): Observable<VehicleLocation[]> {
    return this.http.get<{ data: VehicleLocation[] }>(`/api/?op=getlocations&userid=${userId}`).pipe(
      map(response => response.data)
    );
  }
}
