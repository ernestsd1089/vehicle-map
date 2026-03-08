import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly entries = new Map<string, { data: unknown; timestamp: number }>();

  getIfValid<T>(key: string, ttlMs: number): T | null {
    const entry = this.entries.get(key);
    if (!entry || Date.now() - entry.timestamp >= ttlMs) return null;
    return entry.data as T;
  }

  set(key: string, data: unknown): void {
    this.entries.set(key, { data, timestamp: Date.now() });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }
}
