import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import type { DailyForecast } from '@/types';
import { formatDate, formatTemp, getTempMax, getTempMin, getPrecipProb } from '@/utils/weatherHelpers';

interface Props {
  daily: DailyForecast[];
  units: string;
}

export function ForecastStrip({ daily, units }: Props) {
  const days = daily.slice(0, 7);

  return (
    <AnimatedCard delay={0.3} className="p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-white/70">7-Day Preview</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex min-w-[90px] flex-col items-center rounded-xl border border-white/5 bg-white/5 px-3 py-4 transition-colors hover:border-accent/20 hover:bg-accent/5"
          >
            <span className="text-xs text-white/50">{formatDate(day.date)}</span>
            <div className="my-2">
              <WeatherIcon icon={day.icon} conditionCode={day.condition_code} size="md" />
            </div>
            <span className="text-sm font-semibold">{formatTemp(getTempMax(day), units)}</span>
            <span className="text-xs text-white/40">{formatTemp(getTempMin(day), units)}</span>
            {getPrecipProb(day) > 0 && (
              <span className="mt-1 text-[10px] text-sky-calm">{Math.round(getPrecipProb(day))}%</span>
            )}
          </motion.div>
        ))}
      </div>
    </AnimatedCard>
  );
}
