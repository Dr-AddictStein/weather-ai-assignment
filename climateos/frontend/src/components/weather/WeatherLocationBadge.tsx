import { Globe } from 'lucide-react';
import type { WeatherLocation } from '@/types';
import { formatApiLocation } from '@/utils/weatherHelpers';

export function WeatherLocationBadge({ location }: { location?: WeatherLocation }) {
  const label = formatApiLocation(location);
  if (!label) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-white/40">
      <Globe className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
