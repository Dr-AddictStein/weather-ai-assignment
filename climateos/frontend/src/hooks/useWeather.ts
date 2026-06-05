import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import type { Location } from '@/types';

function getStaleTime() {
  const mode = useAppStore.getState().refreshMode;
  return mode === 'saver' ? 30 * 60 * 1000 : 10 * 60 * 1000;
}

function weatherQueryKey(location: Location | null | undefined, units: string, lang: string) {
  return ['weather', location?.lat, location?.lon, units, lang] as const;
}

/**
 * Primary weather hook — fetches GET /v1/weather (current + hourly + daily).
 * All other weather hooks share this query key for cache deduplication.
 */
export function useFullWeather(location?: Location | null) {
  const { units, lang } = useAppStore();
  return useQuery({
    queryKey: weatherQueryKey(location, units, lang),
    queryFn: () => api.weather(location!.lat, location!.lon, units, lang),
    enabled: !!location,
    staleTime: getStaleTime(),
    retry: 2,
  });
}

/** @deprecated Use useFullWeather — same cached /weather response */
export const useCurrentWeather = useFullWeather;
/** @deprecated Use useFullWeather — same cached /weather response */
export const useHourlyWeather = useFullWeather;
/** @deprecated Use useFullWeather — same cached /weather response */
export const useDailyWeather = useFullWeather;

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: api.usage,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

export function useTreeQuota() {
  return useQuery({
    queryKey: ['treeQuota'],
    queryFn: api.treeQuota,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

export function useTreeHistory(limit = 20) {
  return useQuery({
    queryKey: ['treeHistory', limit],
    queryFn: () => api.treeHistory(limit),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
