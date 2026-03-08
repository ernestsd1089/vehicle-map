import { Injectable } from '@angular/core';

const CACHE_KEY_PREFIX = 'vehicle-map_cache::';

@Injectable({ providedIn: 'root' })
export class CacheService {
  getIfValid<T>(key: string, ttlMs: number): T | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!raw) return null;
      const entry: { data: T; timestamp: number } = JSON.parse(raw);
      if (Date.now() - entry.timestamp >= ttlMs) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  set(key: string, data: unknown): void {
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // storage quota exceeded — silently skip caching
    }
  }

  delete(key: string): void {
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
  }
}
