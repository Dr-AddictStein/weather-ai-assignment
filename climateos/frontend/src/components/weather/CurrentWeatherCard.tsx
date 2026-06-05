import { motion } from 'framer-motion';
import { Wind, Droplets, Compass, Clock, Gauge } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import type { CurrentWeather } from '@/types';
import { conditionLabel, formatTemp, formatWind, formatTime } from '@/utils/weatherHelpers';

interface Props {
  current?: CurrentWeather;
  units: string;
  locationName?: string;
  delay?: number;
}

export function CurrentWeatherCard({ current, units, locationName, delay = 0 }: Props) {
  if (!current) return null;

  const label = conditionLabel(current.condition_code);

  const stats = [
    { icon: Wind, label: 'Wind', value: formatWind(current.wind_speed ?? 0, units) },
    {
      icon: Compass,
      label: 'Direction',
      value: current.wind_direction != null ? `${current.wind_direction}°` : '—',
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: current.humidity != null ? `${current.humidity}%` : '—',
    },
    {
      icon: Gauge,
      label: 'Gusts',
      value: current.wind_gust != null ? formatWind(current.wind_gust, units) : '—',
    },
    {
      icon: Clock,
      label: 'Observed',
      value: formatTime(current.time),
    },
  ];

  return (
    <AnimatedCard delay={delay} className="relative overflow-hidden p-6 lg:p-8">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white/50">{locationName ?? 'Current Conditions'}</p>
          <div className="mt-2 flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: delay + 0.2 }}
            >
              <WeatherIcon icon={current.icon} conditionCode={current.condition_code} size="xl" />
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
                className="font-display text-5xl font-bold tracking-tight"
              >
                {formatTemp(current.temperature, units)}
              </motion.p>
              <p className="mt-1 text-white/60">{label}</p>
              {current.feels_like != null && (
                <p className="text-xs text-white/40">
                  Feels like {formatTemp(current.feels_like, units)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.4 + i * 0.1 }}
              className="rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-white/40">
                <stat.icon className="h-3.5 w-3.5" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
