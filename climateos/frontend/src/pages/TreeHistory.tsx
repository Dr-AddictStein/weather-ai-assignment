import { useState } from 'react';
import { motion } from 'framer-motion';
import { TreePine, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTreeHistory } from '@/hooks/useWeather';
import {
  formatAnalysisDate,
  formatCanopy,
  getHealthyRatio,
  getHistoryAnalyses,
} from '@/utils/treeHelpers';

export function TreeHistory() {
  const [limit, setLimit] = useState(20);
  const { data, isLoading, isError, error, refetch } = useTreeHistory(limit);

  const analyses = getHistoryAnalyses(data);

  const chartData = [...analyses].reverse().map((a) => ({
    date: new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    trees: a.total_tree_count,
    canopy: a.canopy_coverage_pct,
    healthy: a.tree_health?.healthy ?? 0,
  }));

  return (
    <div>
      <Header title="Tree History & Trends" subtitle="Track vegetation health over time" />

      <div className="mb-6 flex items-center gap-3">
        <select className="input-field w-auto" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>Last 10</option>
          <option value={20}>Last 20</option>
          <option value={50}>Last 50</option>
        </select>
        {data?.total != null && (
          <span className="text-xs text-white/40">{data.total} total analyses</span>
        )}
      </div>

      {isLoading && <LoadingState message="Loading history..." />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {analyses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {chartData.length > 1 && (
            <AnimatedCard className="p-5">
              <h3 className="mb-4 font-display text-sm font-semibold text-white/70">Trend Charts</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1a2b24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="trees" name="Trees" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="canopy" name="Canopy %" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="healthy" name="Healthy" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          )}

          <div className="space-y-3">
            {analyses.map((a, i) => {
              const ratio = getHealthyRatio(a);
              const prev = analyses[i + 1];
              const prevRatio = prev ? getHealthyRatio(prev) : ratio;
              const declining = ratio < prevRatio - 5;

              return (
                <AnimatedCard key={a.analysis_id} delay={i * 0.05} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-accent/10 p-2.5">
                        <TreePine className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{a.location ?? a.county ?? 'Unknown Location'}</h3>
                        <p className="text-xs text-white/40">
                          {formatAnalysisDate(a.timestamp)}
                          {a.farmer_id ? ` · ${a.farmer_id}` : ''}
                        </p>
                        <p className="text-[10px] text-white/30">{a.analysis_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xl font-bold">{a.total_tree_count}</p>
                        <p className="text-xs text-white/40">trees</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{formatCanopy(a.canopy_coverage_pct)}</p>
                        <p className="text-xs text-white/40">canopy</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {declining ? (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        )}
                        <span className="text-sm">{ratio}% healthy</span>
                      </div>
                    </div>
                  </div>
                  {declining && (
                    <p className="mt-3 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-400">
                      Possible decline detected compared to previous analysis
                    </p>
                  )}
                  {a.low_confidence && (
                    <p className="mt-2 rounded-lg bg-amber-warn/10 px-3 py-2 text-xs text-amber-warn">
                      Low confidence analysis
                    </p>
                  )}
                </AnimatedCard>
              );
            })}
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && analyses.length === 0 && (
        <AnimatedCard className="flex flex-col items-center p-12 text-center">
          <TreePine className="mb-4 h-12 w-12 text-white/20" />
          <p className="text-white/50">No analysis history yet</p>
        </AnimatedCard>
      )}
    </div>
  );
}
