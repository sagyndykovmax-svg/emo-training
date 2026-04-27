/**
 * Test setup: explicit localStorage polyfill (vitest 4.x's jsdom/happy-dom
 * integration is unreliable for storage), and a mock of cloud-sync so
 * storage tests don't try to load the Supabase module.
 */

import { afterEach, vi } from 'vitest';

// Explicit in-memory localStorage polyfill — bypasses any environment
// quirks where window.localStorage is missing or methods are not callable.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

const memoryLocal = new MemoryStorage();
const memorySession = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: memoryLocal,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: memorySession,
  writable: true,
  configurable: true,
});

afterEach(() => {
  memoryLocal.clear();
  memorySession.clear();
  vi.restoreAllMocks();
});

// Mock the dynamically imported cloud-sync module so saveProgress doesn't
// trigger a Supabase fetch attempt during tests.
vi.mock('@/lib/cloud-sync', () => ({
  scheduleUpload: () => {},
  reconcileOnSignIn: async () => 'no_change',
  fetchCloudProgress: async () => null,
  uploadCloudProgress: async () => ({ ok: true }),
  lastUploadInfo: () => ({ lastUploadedAt: 0 }),
}));
