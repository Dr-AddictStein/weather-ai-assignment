import { motion } from 'framer-motion';
import { Zap, TreePine, Lightbulb, Shield } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { ProgressMeter } from '@/components/ui/ProgressMeter';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useUsage, useTreeQuota } from '@/hooks/useWeather';

const tips = [
  { icon: Zap, title: 'Use ai=false', desc: 'All ClimateOS requests skip AI summaries to preserve your AI quota.' },
  { icon: TreePine, title: 'Batch tree uploads', desc: 'Plan field surveys together — free plan includes 5 analyses per month.' },
  { icon: Shield, title: 'Enable saver mode', desc: 'Switch to saver mode in Settings to reduce auto-refresh frequency.' },
  { icon: Lightbulb, title: 'Cache-friendly browsing', desc: 'Weather data is cached server-side. Avoid rapid manual refreshes.' },
];

export function Usage() {
  const usage = useUsage();
  const quota = useTreeQuota();

  const reqUsed = usage.data?.requests?.used ?? 0;
  const reqLimit = usage.data?.requests?.limit ?? 1000;
  const aiUsed = usage.data?.ai_requests?.used ?? usage.data?.aiRequests?.used ?? 0;
  const aiLimit = usage.data?.ai_requests?.limit ?? usage.data?.aiRequests?.limit ?? 200;
  const reqPct = reqLimit > 0 ? (reqUsed / reqLimit) * 100 : 0;
  const daysLeft = usage.data?.period?.end ?? usage.data?.billing_period?.end;

  return (
    <div>
      <Header title="Usage & Quota" subtitle="Monitor API consumption and optimize requests" />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard className="p-6">
          <h3 className="mb-6 font-display text-lg font-semibold">API Usage</h3>
          {usage.isLoading ? (
            <LoadingState />
          ) : usage.isError ? (
            <ErrorState message={(usage.error as Error)?.message} onRetry={() => usage.refetch()} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase text-accent">
                  {usage.data?.plan ?? 'free'} plan
                </span>
                {daysLeft && (
                  <span className="text-xs text-white/40">
                    Resets {new Date(daysLeft).toLocaleDateString()}
                  </span>
                )}
              </div>
              <ProgressMeter label="Total Requests" used={reqUsed} limit={reqLimit} />
              <ProgressMeter label="AI Requests" used={aiUsed} limit={aiLimit} color="#38bdf8" delay={0.15} />

              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-white/60">Budget Estimator</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  ~{Math.max(0, reqLimit - reqUsed)} requests
                </p>
                <p className="text-xs text-white/40">remaining this period</p>
                {reqPct > 80 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-amber-warn"
                  >
                    ⚠ Usage above 80% — consider enabling saver mode
                  </motion.p>
                )}
              </div>
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.1} className="p-6">
          <h3 className="mb-6 font-display text-lg font-semibold">Tree Analysis Quota</h3>
          {quota.isLoading ? (
            <LoadingState />
          ) : quota.isError ? (
            <ErrorState message={(quota.error as Error)?.message} onRetry={() => quota.refetch()} />
          ) : (
            <div className="space-y-6">
              <ProgressMeter
                label="Monthly Analyses"
                used={quota.data?.used ?? 0}
                limit={quota.data?.unlimited ? 999 : (quota.data?.limit ?? 5)}
                color="#6ee7b7"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-accent-glow">{quota.data?.remaining ?? '—'}</p>
                  <p className="text-xs text-white/40">Remaining</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold">{quota.data?.used ?? 0}</p>
                  <p className="text-xs text-white/40">Used</p>
                </div>
              </div>
              {quota.data?.resets_at && (
                <p className="text-xs text-white/40">
                  Resets {new Date(quota.data.resets_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.2} className="mt-6 p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Optimization Tips</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex gap-3 rounded-xl border border-white/5 bg-white/5 p-4"
            >
              <tip.icon className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="mt-1 text-xs text-white/50">{tip.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}
