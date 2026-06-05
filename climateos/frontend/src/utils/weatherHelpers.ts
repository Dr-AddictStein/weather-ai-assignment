import type { CurrentWeather, DailyForecast, HourlyForecast, WeatherResponse } from '@/types';

const WMO_LABELS: Record<string, string> = {
  '0': 'Clear sky',
  '1': 'Mainly clear',
  '2': 'Partly cloudy',
  '3': 'Overcast',
  '45': 'Fog',
  '48': 'Depositing rime fog',
  '51': 'Light drizzle',
  '53': 'Moderate drizzle',
  '55': 'Dense drizzle',
  '56': 'Light freezing drizzle',
  '57': 'Dense freezing drizzle',
  '61': 'Slight rain',
  '63': 'Moderate rain',
  '65': 'Heavy rain',
  '66': 'Light freezing rain',
  '67': 'Heavy freezing rain',
  '71': 'Slight snow',
  '73': 'Moderate snow',
  '75': 'Heavy snow',
  '77': 'Snow grains',
  '80': 'Slight rain showers',
  '81': 'Moderate rain showers',
  '82': 'Violent rain showers',
  '85': 'Slight snow showers',
  '86': 'Heavy snow showers',
  '95': 'Thunderstorm',
  '96': 'Thunderstorm with slight hail',
  '99': 'Thunderstorm with heavy hail',
};

export function conditionLabel(code?: string): string {
  if (!code) return 'Unknown';
  return WMO_LABELS[code] ?? `Weather code ${code}`;
}

export function getTemp(item: CurrentWeather | HourlyForecast): number {
  return item.temperature;
}

export function getTempMax(d: DailyForecast): number {
  return d.temp_max;
}

export function getTempMin(d: DailyForecast): number {
  return d.temp_min;
}

export function getWindSpeed(item: { wind_speed?: number }): number {
  return item.wind_speed ?? 0;
}

export function getWindGust(item: { wind_gust?: number; wind_max?: number; wind_speed?: number }): number {
  return item.wind_gust ?? item.wind_max ?? item.wind_speed ?? 0;
}

export function getPrecipProb(item: HourlyForecast | DailyForecast): number {
  return item.precipitation_probability ?? 0;
}

export function getPrecipSum(d: DailyForecast): number {
  return d.precipitation_sum ?? 0;
}

export function getHourly(data: WeatherResponse): HourlyForecast[] {
  return data.hourly ?? [];
}

export function getDaily(data: WeatherResponse): DailyForecast[] {
  return data.daily ?? [];
}

export function getCurrent(data: WeatherResponse): CurrentWeather | undefined {
  return data.current;
}

/** Merge `current` with the matching hourly slot (humidity, feels_like, wind_gust). */
export function getEnrichedCurrent(data: WeatherResponse): CurrentWeather | undefined {
  const current = data.current;
  if (!current) return undefined;

  const match = data.hourly?.find((h) => h.time === current.time)
    ?? data.hourly?.find((h) => current.time && h.time.startsWith(current.time.slice(0, 13)));

  if (!match) return current;

  return {
    ...current,
    humidity: current.humidity ?? match.humidity,
    feels_like: current.feels_like ?? match.feels_like,
    wind_gust: current.wind_gust ?? match.wind_gust,
    uv_index: current.uv_index ?? match.uv_index,
  };
}

export function formatApiLocation(loc?: WeatherResponse['location']): string | null {
  if (!loc) return null;
  const parts = [
    loc.country,
    loc.timezone?.replace(/_/g, ' '),
    `${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°`,
  ].filter(Boolean);
  return parts.join(' · ');
}

/** Hours from now onward (falls back to first N if none future). */
export function getUpcomingHours(hourly: HourlyForecast[], count = 24): HourlyForecast[] {
  const now = Date.now();
  const upcoming = hourly.filter((h) => new Date(h.time).getTime() >= now);
  return (upcoming.length > 0 ? upcoming : hourly).slice(0, count);
}

export function formatTemp(temp: number, units: string): string {
  return `${Math.round(temp)}°${units === 'imperial' ? 'F' : 'C'}`;
}

export function formatWind(speed: number, units: string): string {
  return units === 'imperial' ? `${Math.round(speed)} mph` : `${Math.round(speed)} km/h`;
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatHour(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function weatherEmoji(code?: string): string {
  const c = parseInt(code ?? '-1', 10);
  if (c === 0 || c === 1) return '☀️';
  if (c === 2) return '⛅';
  if (c === 3) return '☁️';
  if (c === 45 || c === 48) return '🌫️';
  if (c >= 51 && c <= 57) return '🌦️';
  if (c >= 61 && c <= 67) return '🌧️';
  if (c >= 71 && c <= 77) return '❄️';
  if (c >= 80 && c <= 82) return '🌧️';
  if (c >= 85 && c <= 86) return '🌨️';
  if (c >= 95) return '⛈️';
  return '🌤️';
}

export function tempUnit(units: string): string {
  return units === 'imperial' ? '°F' : '°C';
}
