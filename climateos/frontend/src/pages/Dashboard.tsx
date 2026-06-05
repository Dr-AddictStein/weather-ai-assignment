import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TreePine } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { RiskSummaryCards } from '@/components/weather/RiskSummaryCards';
import { ForecastStrip } from '@/components/weather/ForecastStrip';
import { LocationSwitcher } from '@/components/weather/LocationSwitcher';
import { ProgressMeter } from '@/components/ui/ProgressMeter';
import { LoadingState, SkeletonCard } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useAppStore } from '@/store/useAppStore';
import { useFullWeather, useUsage, useTreeQuota, useTreeHistory } from '@/hooks/useWeather';
import { computeAllRisks } from '@/utils/riskEngine';
import { WeatherLocationBadge } from '@/components/weather/WeatherLocationBadge';
import { getEnrichedCurrent, getDaily } from '@/utils/weatherHelpers';
import { formatCanopy } from '@/utils/treeHelpers';

export function Dashboard() {
  const defaultLocation = useAppStore((s) => s.getDefaultLocation());
  const locations = useAppStore((s) => s.locations);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);
  const units = useAppStore((s) => s.units);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && defaultLocation) {
      setSelectedId(defaultLocation.id);
    }
  }, [defaultLocation, selectedId]);

  const location = locations.find((l) => l.id === selectedId) ?? defaultLocation;

  const handleSelectLocation = (id: string) => {
    setSelectedId(id);
    setDefaultLocation(id);
  };

  const { data, isLoading, isError, error, refetch } = useFullWeather(location);
  const usage = useUsage();
  const quota = useTreeQuota();
  const history = useTreeHistory(3);

  const risks = data ? computeAllRisks(data, units) : null;
  const recentAnalyses = history.data?.analyses ?? [];

  return (
    <div>
      <Header
        title="Operations Dashboard"
        subtitle="Real-time weather intelligence for your fields"
      />

      <LocationSwitcher
        selectedId={selectedId}
        onSelect={handleSelectLocation}
        activeLayoutId="dashboard-location-active"
      />

      {data?.location && (
        <div className="mb-4 -mt-2">
          <WeatherLocationBadge location={data.location} />
        </div>
      )}

      {isLoading && (
        <div className="space-y-6">
          <SkeletonCard className="h-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      )}

      {isError && (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      )}

      {data && (
        <motion.div
          key={location?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <CurrentWeatherCard
            current={getEnrichedCurrent(data)}
            units={units}
            locationName={location?.name}
          />

          {risks && <RiskSummaryCards {...risks} />}

          <ForecastStrip daily={getDaily(data)} units={units} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AnimatedCard delay={0.4} className="space-y-4 p-5">
              <h3 className="font-display text-sm font-semibold text-white/70">API Usage</h3>
              {usage.isLoading ? (
                <LoadingState message="Loading usage..." />
              ) : usage.isError ? (
                <p className="text-sm text-white/40">Unable to load usage data</p>
              ) : (
                <>
                  <ProgressMeter
                    label="Monthly Requests"
                    used={usage.data?.requests?.used ?? 0}
                    limit={usage.data?.requests?.limit ?? 1000}
                  />
                  <ProgressMeter
                    label="AI Requests"
                    used={usage.data?.ai_requests?.used ?? usage.data?.aiRequests?.used ?? 0}
                    limit={usage.data?.ai_requests?.limit ?? usage.data?.aiRequests?.limit ?? 200}
                    color="#38bdf8"
                    delay={0.2}
                  />
                </>
              )}
            </AnimatedCard>

            <AnimatedCard delay={0.5} className="space-y-4 p-5">
              <h3 className="font-display text-sm font-semibold text-white/70">Tree Analysis Quota</h3>
              {quota.isLoading ? (
                <LoadingState message="Loading quota..." />
              ) : quota.isError ? (
                <p className="text-sm text-white/40">Unable to load quota</p>
              ) : (
                <ProgressMeter
                  label="Analyses This Month"
                  used={quota.data?.used ?? 0}
                  limit={quota.data?.unlimited ? 999 : (quota.data?.limit ?? 5)}
                  color="#6ee7b7"
                />
              )}
            </AnimatedCard>
          </div>

          <AnimatedCard delay={0.6} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white/70">Recent Tree Analyses</h3>
              <Link to="/trees/history" className="flex items-center gap-1 text-xs text-accent hover:text-accent-glow">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {history.isLoading ? (
              <LoadingState message="Loading analyses..." />
            ) : recentAnalyses.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <TreePine className="h-8 w-8 text-white/20" />
                <p className="text-sm text-white/40">No analyses yet. Upload a field image to get started.</p>
                <Link to="/trees/analyze" className="btn-primary text-xs">Analyze Trees</Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {recentAnalyses.map((a) => (
                  <motion.div
                    key={a.analysis_id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-white/5 bg-white/5 p-4"
                  >
                    <p className="text-xs text-white/40">{a.location ?? a.county ?? 'Unknown'}</p>
                    <p className="mt-1 font-display text-xl font-bold">{a.total_tree_count}</p>
                    <p className="text-xs text-white/50">trees detected</p>
                    <p className="mt-2 text-xs text-accent">{formatCanopy(a.canopy_coverage_pct)} canopy</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatedCard>
        </motion.div>
      )}
    </div>
  );
}
