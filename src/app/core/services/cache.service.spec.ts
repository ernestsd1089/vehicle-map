import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let now: number;

  beforeEach(() => {
    now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    service = new CacheService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getIfValid', () => {
    it('returns null when the key does not exist', () => {
      expect(service.getIfValid('missing', 1000)).toBeNull();
    });

    it('returns data when entry is within TTL', () => {
      service.set('key', { value: 42 });
      jest.spyOn(Date, 'now').mockReturnValue(now + 999);

      expect(service.getIfValid('key', 1000)).toEqual({ value: 42 });
    });

    it('returns null when entry has exceeded TTL', () => {
      service.set('key', 'data');
      jest.spyOn(Date, 'now').mockReturnValue(now + 5000);

      expect(service.getIfValid<string>('key', 1000)).toBeNull();
    });
  });

  describe('set', () => {
    it('stores data that can be retrieved', () => {
      service.set('key', [1, 2, 3]);

      expect(service.getIfValid('key', 10000)).toEqual([1, 2, 3]);
    });

    it('overwrites an existing entry with new data', () => {
      service.set('key', 'old');
      service.set('key', 'new');

      expect(service.getIfValid<string>('key', 10000)).toBe('new');
    });

    it('stores entries under separate keys independently', () => {
      service.set('a', 1);
      service.set('b', 2);

      expect(service.getIfValid('a', 10000)).toBe(1);
      expect(service.getIfValid('b', 10000)).toBe(2);
    });
  });

  describe('delete', () => {
    it('removes an existing entry so it can no longer be retrieved', () => {
      service.set('key', 'data');
      service.delete('key');

      expect(service.getIfValid('key', 10000)).toBeNull();
    });

    it('does not throw when deleting a non-existent key', () => {
      expect(() => service.delete('missing')).not.toThrow();
    });

    it('only deletes the targeted key', () => {
      service.set('a', 1);
      service.set('b', 2);
      service.delete('a');

      expect(service.getIfValid('b', 10000)).toBe(2);
    });
  });
});
