import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MobiService, LOCATIONS_KEY } from './mobi.service';
import { CacheService } from '../../../core/services/cache.service';
import { User } from '../models/user.model';
import { VehicleLocation } from '../models/location.model';

const mockUser: User = {
  userid: 1,
  owner: { ownerid: 1, name: 'Alice' } as any,
  vehicles: [],
};

const mockLocation: VehicleLocation = { vehicleid: 10, lat: 56.946, lon: 24.105 };

describe('MobiService', () => {
  let service: MobiService;
  let httpController: HttpTestingController;
  let cacheGetIfValid: jest.Mock;
  let cacheSet: jest.Mock;

  beforeEach(() => {
    cacheGetIfValid = jest.fn().mockReturnValue(null);
    cacheSet = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        MobiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CacheService, useValue: { getIfValid: cacheGetIfValid, set: cacheSet } },
      ],
    });

    service = TestBed.inject(MobiService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  describe('getUsers', () => {
    it('returns cached users without making an HTTP request', () => {
      cacheGetIfValid.mockReturnValue([mockUser]);

      let result: User[] | undefined;
      service.getUsers().subscribe((users) => (result = users));

      httpController.expectNone('/api/?op=list');
      expect(result).toEqual([mockUser]);
    });

    it('makes a GET request to the correct URL when cache is empty', () => {
      service.getUsers().subscribe();

      const req = httpController.expectOne('/api/?op=list');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('returns users from the response data', () => {
      let result: User[] | undefined;
      service.getUsers().subscribe((users) => (result = users));

      httpController.expectOne('/api/?op=list').flush({ data: [mockUser] });

      expect(result).toEqual([mockUser]);
    });

    it('filters out entries without a userid', () => {
      const userWithoutId = { userid: 0, owner: null, vehicles: [] };
      let result: User[] | undefined;
      service.getUsers().subscribe((users) => (result = users));

      httpController.expectOne('/api/?op=list').flush({ data: [mockUser, userWithoutId] });

      expect(result).toEqual([mockUser]);
    });

    it('caches the response under the users key', () => {
      service.getUsers().subscribe();

      httpController.expectOne('/api/?op=list').flush({ data: [mockUser] });

      expect(cacheSet).toHaveBeenCalledWith('users', [mockUser]);
    });
  });

  describe('getLocations', () => {
    it('returns cached locations without making an HTTP request', () => {
      cacheGetIfValid.mockReturnValue([mockLocation]);

      let result: VehicleLocation[] | undefined;
      service.getLocations(7).subscribe((locs) => (result = locs));

      httpController.expectNone('/api/?op=getlocations&userid=7');
      expect(result).toEqual([mockLocation]);
    });

    it('makes a GET request to the correct URL when cache is empty', () => {
      service.getLocations(7).subscribe();

      const req = httpController.expectOne('/api/?op=getlocations&userid=7');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('returns locations from the response data', () => {
      let result: VehicleLocation[] | undefined;
      service.getLocations(7).subscribe((locs) => (result = locs));

      httpController.expectOne('/api/?op=getlocations&userid=7').flush({ data: [mockLocation] });

      expect(result).toEqual([mockLocation]);
    });

    it('caches the response under a user-specific key', () => {
      service.getLocations(7).subscribe();

      httpController.expectOne('/api/?op=getlocations&userid=7').flush({ data: [mockLocation] });

      expect(cacheSet).toHaveBeenCalledWith(`${LOCATIONS_KEY}-7`, [mockLocation]);
    });

    it('uses separate cache keys for different users', () => {
      service.getLocations(1).subscribe();
      httpController.expectOne('/api/?op=getlocations&userid=1').flush({ data: [] });

      service.getLocations(2).subscribe();
      httpController.expectOne('/api/?op=getlocations&userid=2').flush({ data: [] });

      expect(cacheGetIfValid).toHaveBeenCalledWith(`${LOCATIONS_KEY}-1`, expect.any(Number));
      expect(cacheGetIfValid).toHaveBeenCalledWith(`${LOCATIONS_KEY}-2`, expect.any(Number));
    });
  });
});
