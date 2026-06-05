import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskSummaryCards } from '@/components/weather/RiskSummaryCards';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store/useAppStore';
import { useFullWeather } from '@/hooks/useWeather';
import { computeAllRisks, generateRecommendations, computeFieldWorkWindows } from '@/utils/riskEngine';
import { getHourly } from '@/utils/weatherHelpers';
import { clsx } from 'clsx';
import type { FieldWorkWindow } from '@/types';

const ratingStyles: Record<FieldWorkWindow['rating'], string> = {
  best: 'border-accent/30 bg-accent/10 text-accent-glow',
  good: 'border-sky-calm/30 bg-sky-calm/10 text-sky-calm',
  avoid: 'border-red-400/30 bg-red-400/10 text-red-400',
};

export function Recommendations() {
  const location = useAppStore((s) => s.getDefaultLocation());
  const units = useAppStore((s) => s.units);
  const { data, isLoading, isError, error, refetch } = useFullWeather(location);

  const risks = data ? computeAllRisks(data, units) : null;
  const recommendations = risks ? generateRecommendations(risks) : [];
  const workWindows = data ? computeFieldWorkWindows(getHourly(data), units) : [];
  const recs24h = recommendations.filter((r) => r.timeframe === '24h');
  const recs7d = recommendations.filter((r) => r.timeframe === '7d');

  return (
    <div>
      <Header
        title="Smart Recommendations"
        subtitle="Rule-based intelligence — no AI quota consumed"
      />

      {isLoading && <LoadingState message="Analyzing conditions..." />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {risks && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <RiskSummaryCards {...risks} />

          <div>
            <h2 className="mb-4 font-display text-lg font-semibold">Field Work Windows</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {workWindows.map((w, i) => (
                <AnimatedCard key={w.period} delay={i * 0.1} className={clsx('border p-5', ratingStyles[w.rating])}>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{w.rating}</p>
                  <p className="mt-2 font-display font-semibold">{w.period}</p>
                  <p className="mt-2 text-xs opacity-70">{w.reason}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>

          <RecommendationSection title="Next 24 Hours" icon={Clock} items={recs24h} />
          <RecommendationSection title="Next 7 Days" icon={AlertCircle} items={recs7d} />

          <AnimatedCard delay={0.5} className="p-6">
            <h3 className="mb-4 font-display font-semibold">Why These Scores?</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {(['rain', 'heat', 'wind'] as const).map((key) => (
                <div key={key} className="rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{key} Risk</span>
                    <RiskBadge level={risks[key].level} score={risks[key].score} />
                  </div>
                  <ul className="mt-3 space-y-1">
                    {risks[key].factors.map((f) => (
                      <li key={f} className="text-xs text-white/50">· {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </motion.div>
      )}
    </div>
  );
}

function RecommendationSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ReturnType<typeof generateRecommendations>;
}) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="h-5 w-5 text-accent" /> {title}
      </h2>
      <div className="space-y-3">
        {items.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <AnimatedCard hover={false} className="flex items-start gap-4 p-5">
              <div className="rounded-full bg-accent/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{rec.title}</h3>
                  <RiskBadge level={rec.priority} />
                </div>
                <p className="mt-2 text-sm text-white/60">{rec.description}</p>
              </div>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
