import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeocodingService, provideHttpClient(), provideHttpClientTesting()],
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
  });
});
