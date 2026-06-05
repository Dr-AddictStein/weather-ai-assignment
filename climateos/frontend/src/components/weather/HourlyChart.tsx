import { AnimatedCard } from '@/components/ui/AnimatedCard';
import type { HourlyForecast } from '@/types';
import { formatHour, getTemp, getPrecipProb } from '@/utils/weatherHelpers';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

interface Props {
  hourly: HourlyForecast[];
  units: string;
  title?: string;
  delay?: number;
  showPrecip?: boolean;
}

export function HourlyChart({
  hourly,
  units,
  title = 'Hourly Temperature',
  delay = 0,
  showPrecip = false,
}: Props) {
  const slice = hourly.slice(0, 48);
  const tempData = slice.map((h) => ({
    time: formatHour(h.time),
    temp: getTemp(h),
    precip: getPrecipProb(h),
  }));

  const unit = units === 'imperial' ? '°F' : '°C';

  return (
    <AnimatedCard delay={delay} className="p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-white/70">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {showPrecip ? (
            <BarChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} interval={3} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: '#1a2b24', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '12px',
                }}
              />
              <Bar dataKey="precip" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={tempData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} interval={3} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} unit={unit} />
              <Tooltip
                contentStyle={{
                  background: '#1a2b24', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="temp" stroke="#34d399" strokeWidth={2} fill="url(#tempGradient)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </AnimatedCard>
  );
}
