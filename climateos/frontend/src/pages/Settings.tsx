import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Leaf, Gauge } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { clsx } from 'clsx';

export function Settings() {
  const { units, lang, timezone, refreshMode, setUnits, setLang, setTimezone, setRefreshMode } = useAppStore();
  const [health, setHealth] = useState<{ status: string; keyConfigured: boolean } | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div>
      <Header title="Settings" subtitle="Configure preferences and platform status" />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard className="space-y-5 p-6">
          <h3 className="font-display text-lg font-semibold">Preferences</h3>

          <div>
            <label className="mb-2 block text-xs font-medium text-white/50">Temperature Units</label>
            <div className="flex gap-2">
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={clsx(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                    units === u
                      ? 'border-accent/40 bg-accent/10 text-accent-glow'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80'
                  )}
                >
                  {u === 'metric' ? '°C Metric' : '°F Imperial'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white/50">Language</label>
            <select className="input-field" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white/50">Timezone</label>
            <input className="input-field" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.1} className="space-y-5 p-6">
          <h3 className="font-display text-lg font-semibold">Refresh Strategy</h3>

          <div className="space-y-3">
            {([
              { mode: 'normal' as const, label: 'Normal', desc: 'Auto-refresh every 10 minutes' },
              { mode: 'saver' as const, label: 'Saver', desc: 'Auto-refresh every 30 minutes — conserves API quota' },
            ]).map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setRefreshMode(opt.mode)}
                className={clsx(
                  'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all',
                  refreshMode === opt.mode
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <Gauge className={clsx('mt-0.5 h-5 w-5', refreshMode === opt.mode ? 'text-accent' : 'text-white/40')} />
                <div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs text-white/50">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-semibold">Platform Status</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent/10 p-3">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">ClimateOS Backend</p>
                <p className="text-xs text-white/40">API Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {health?.status === 'ok' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-sm">
                {health ? (health.status === 'ok' ? 'Connected' : 'Disconnected') : 'Checking...'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {health?.keyConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-sm">
                API Key {health?.keyConfigured ? 'Configured' : 'Missing'}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4"
          >
            <p className="text-xs text-white/60">
              Your WeatherAI API key is securely stored on the backend and never exposed to the browser.
              All requests use <code className="text-accent">ai=false</code> by default to preserve quota.
            </p>
          </motion.div>
        </AnimatedCard>
      </div>
    </div>
  );
}
