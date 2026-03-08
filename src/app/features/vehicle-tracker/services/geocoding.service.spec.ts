import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GeocodingService } from './geocoding.service';
import { CacheService } from '../../../core/services/cache.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpController: HttpTestingController;
  let mockCache: { getIfValid: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    mockCache = { getIfValid: jest.fn().mockReturnValue(null), set: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        GeocodingService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CacheService, useValue: mockCache },
      ],
    });

    service = TestBed.inject(GeocodingService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  const matchNominatim = (req: { url: string }) => req.url.includes('nominatim.openstreetmap.org');

  describe('reverseGeocode', () => {
    it('returns the display_name from the response', () => {
      let result: string | undefined;
      service.reverseGeocode(56.946, 24.105).subscribe((r) => (result = r));

      httpController.expectOne(matchNominatim).flush({ display_name: 'Test Street 1, Riga' });

      expect(result).toBe('Test Street 1, Riga');
    });

    it('sends the correct lat and lon params', () => {
      service.reverseGeocode(56.946, 24.105).subscribe();

      const req = httpController.expectOne(matchNominatim);
      expect(req.request.params.get('lat')).toBe('56.946');
      expect(req.request.params.get('lon')).toBe('24.105');
      req.flush({ display_name: '' });
    });

    it('returns "Address unavailable" when the request fails', () => {
      let result: string | undefined;
      service.reverseGeocode(56.946, 24.105).subscribe((r) => (result = r));

      httpController
        .expectOne(matchNominatim)
        .flush(null, { status: 500, statusText: 'Server Error' });

      expect(result).toBe('Address unavailable');
    });

    it('returns the cached value without making an HTTP request', () => {
      mockCache.getIfValid.mockReturnValue('Cached Street, Riga');

      let result: string | undefined;
      service.reverseGeocode(56.946, 24.105).subscribe((r) => (result = r));

      httpController.expectNone(matchNominatim);
      expect(result).toBe('Cached Street, Riga');
    });

    it('stores the result in the cache after a successful request', () => {
      service.reverseGeocode(56.946, 24.105).subscribe();

      httpController.expectOne(matchNominatim).flush({ display_name: 'Riga, Latvia' });

      expect(mockCache.set).toHaveBeenCalledWith('geocode-56.946-24.105', 'Riga, Latvia');
    });

    it('uses Infinity as the TTL when checking the cache', () => {
      service.reverseGeocode(56.946, 24.105).subscribe();
      httpController.expectOne(matchNominatim).flush({ display_name: '' });

      expect(mockCache.getIfValid).toHaveBeenCalledWith('geocode-56.946-24.105', Infinity);
    });
  });
});
