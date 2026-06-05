import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LocationSwitcher } from '@/components/weather/LocationSwitcher';
import { Header } from '@/components/layout/Header';
import { HourlyChart } from '@/components/weather/HourlyChart';
import { DailyForecastBoard } from '@/components/weather/DailyForecastBoard';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { SkeletonCard } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store/useAppStore';
import { useFullWeather } from '@/hooks/useWeather';
import { WeatherLocationBadge } from '@/components/weather/WeatherLocationBadge';
import { getEnrichedCurrent, getDaily, getHourly } from '@/utils/weatherHelpers';
import { clsx } from 'clsx';

type View = 'current' | 'hourly' | 'daily';

export function Forecast() {
  const defaultLocation = useAppStore((s) => s.getDefaultLocation());
  const locations = useAppStore((s) => s.locations);
  const units = useAppStore((s) => s.units);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>('current');
  const [compareId, setCompareId] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);
  useEffect(() => {
    if (!selectedId && defaultLocation) {
      setSelectedId(defaultLocation.id);
    }
  }, [defaultLocation, selectedId]);

  const location = locations.find((l) => l.id === selectedId) ?? defaultLocation;

  const { data, isLoading, isError, error, refetch } = useFullWeather(location);
  const compareLoc = locations.find((l) => l.id === compareId);
  const compareQuery = useFullWeather(compareMode ? compareLoc : null);

  const tabs: { id: View; label: string }[] = [
    { id: 'current', label: 'Current' },
    { id: 'hourly', label: 'Hourly' },
    { id: 'daily', label: '7-Day' },
  ];

  return (
    <div>
      <Header title="Forecast Explorer" subtitle="Deep weather analysis for planning" />
      {data?.location && (
        <div className="mb-4 -mt-4">
          <WeatherLocationBadge location={data.location} />
        </div>
      )}

      <LocationSwitcher
        selectedId={selectedId}
        onSelect={setSelectedId}
        activeLayoutId="forecast-location-active"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
                view === tab.id ? 'bg-accent/20 text-accent-glow shadow-glow-sm' : 'text-white/50 hover:text-white/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCompareMode(!compareMode)}
          className={clsx('btn-ghost text-xs', compareMode && 'border-accent/30 text-accent')}
        >
          {compareMode ? 'Exit Compare' : 'Compare Locations'}
        </button>

        {compareMode && (
          <select
            className="input-field w-auto"
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
          >
            <option value="">Select location...</option>
            {locations.filter((l) => l.id !== location?.id).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading && (
        <div className="space-y-6">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-64" />
        </div>
      )}

      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {data && (
        <motion.div
          key={location?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {view === 'current' && (
            <CurrentWeatherCard current={getEnrichedCurrent(data)} units={units} locationName={location?.name} />
          )}

          {view === 'hourly' && (
            <>
              <HourlyChart hourly={getHourly(data)} units={units} title={`Temperature — ${location?.name}`} />
              <HourlyChart
                hourly={getHourly(data)}
                units={units}
                title={`Rain Probability — ${location?.name}`}
                showPrecip
                delay={0.1}
              />
            </>
          )}

          {view === 'daily' && (
            <DailyForecastBoard daily={getDaily(data)} units={units} />
          )}

          {compareMode && compareLoc && compareQuery.data && (
            <div className="mt-8 border-t border-white/5 pt-8">
              <h3 className="mb-4 font-display text-lg font-semibold">Comparing: {compareLoc.name}</h3>
              {view === 'current' && (
                <CurrentWeatherCard current={getEnrichedCurrent(compareQuery.data)} units={units} locationName={compareLoc.name} />
              )}
              {view === 'hourly' && (
                <>
                  <HourlyChart hourly={getHourly(compareQuery.data)} units={units} title={`Temperature — ${compareLoc.name}`} />
                  <HourlyChart hourly={getHourly(compareQuery.data)} units={units} title={`Rain Probability — ${compareLoc.name}`} showPrecip delay={0.1} />
                </>
              )}
              {view === 'daily' && (
                <DailyForecastBoard daily={getDaily(compareQuery.data)} units={units} />
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
