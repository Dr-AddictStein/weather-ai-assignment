import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import type { DailyForecast } from '@/types';
import {
  conditionLabel, formatDate, formatHour, formatTemp,
  getPrecipProb, getPrecipSum, getTempMax, getTempMin, formatWind,
} from '@/utils/weatherHelpers';

interface Props {
  daily: DailyForecast[];
  units: string;
}

export function DailyForecastBoard({ daily, units }: Props) {
  return (
    <div className="space-y-3">
      {daily.slice(0, 7).map((day, i) => (
        <motion.div
          key={day.date}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <AnimatedCard hover={false} className="flex items-center gap-4 p-4">
            <div className="w-24 shrink-0 text-sm font-medium text-white/60">
              {formatDate(day.date)}
            </div>
            <WeatherIcon icon={day.icon} conditionCode={day.condition_code} size="sm" />
            <div className="flex-1">
              <p className="text-sm text-white/70">{conditionLabel(day.condition_code)}</p>
              <p className="text-xs text-white/40">
                {Math.round(getPrecipProb(day))}% rain
                {getPrecipSum(day) > 0 && ` · ${getPrecipSum(day).toFixed(1)} mm`}
                {day.wind_max != null && ` · wind ${formatWind(day.wind_max, units)}`}
                {day.sunrise && day.sunset && (
                  ` · ↑${formatHour(day.sunrise)} ↓${formatHour(day.sunset)}`
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="font-semibold">{formatTemp(getTempMax(day), units)}</span>
              <span className="mx-1 text-white/30">/</span>
              <span className="text-white/50">{formatTemp(getTempMin(day), units)}</span>
            </div>
          </AnimatedCard>
        </motion.div>
      ))}
    </div>
  );
}
