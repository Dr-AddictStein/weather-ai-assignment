import type { TreeHistoryResponse, UsageData, WeatherResponse, TreeQuota, TreeAnalysis } from '@/types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

class ApiError extends Error {
  status: number;
  retryAfter?: string;

  constructor(message: string, status: number, retryAfter?: string) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? 'Request failed',
      res.status,
      (data as { retryAfter?: string }).retryAfter
    );
  }
  return data as T;
}

function weatherQs(lat: number, lon: number, units: string, lang: string, days?: number) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units,
    lang,
    ai: 'false',
  });
  if (days) params.set('days', String(days));
  return params.toString();
}

export const api = {
  health: () => request<{ status: string; keyConfigured: boolean }>('/health'),

  /** Primary endpoint — returns location, current, hourly[], daily[] */
  weather: (lat: number, lon: number, units: string, lang: string) =>
    request<WeatherResponse>(`/weather?${weatherQs(lat, lon, units, lang, 7)}`),

  /** Subset endpoints (same response family as /weather) */
  current: (lat: number, lon: number, units: string, lang: string) =>
    request<WeatherResponse>(`/current?${weatherQs(lat, lon, units, lang)}`),

  hourly: (lat: number, lon: number, units: string, lang: string) =>
    request<WeatherResponse>(`/hourly?${weatherQs(lat, lon, units, lang, 7)}`),

  daily: (lat: number, lon: number, units: string, lang: string) =>
    request<WeatherResponse>(`/daily?${weatherQs(lat, lon, units, lang, 7)}`),

  weatherGeo: (opts?: { days?: number; lat?: number; lon?: number }) => {
    const params = new URLSearchParams({ ai: 'false', days: String(opts?.days ?? 7) });
    if (opts?.lat !== undefined && opts?.lon !== undefined) {
      params.set('lat', String(opts.lat));
      params.set('lon', String(opts.lon));
    } else {
      params.set('ip', 'auto');
    }
    return request<WeatherResponse>(`/weather-geo?${params}`);
  },

  usage: () => request<UsageData>('/usage'),

  treeQuota: () => request<TreeQuota>('/trees/quota'),

  treeHistory: (limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return request<TreeHistoryResponse>(`/trees/history?${params}`);
  },

  analyzeTree: (formData: FormData) =>
    request<TreeAnalysis>('/trees/analyze', { method: 'POST', body: formData }),
};

export { ApiError };
