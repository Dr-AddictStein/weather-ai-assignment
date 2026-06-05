import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const TTL = {
  current: 600,
  hourly: 1800,
  daily: 1800,
  weather: 1800,
  usage: 180,
  quota: 180,
  history: 600,
  geo: 1800,
} as const;

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttl: number): void {
  cache.set(key, value, ttl);
}

export function invalidatePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(`${prefix}:`) || key === prefix) {
      cache.del(key);
    }
  }
}

export function cacheKey(prefix: string, params: Record<string, string | number | boolean | undefined>): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${prefix}:${sorted}`;
}
