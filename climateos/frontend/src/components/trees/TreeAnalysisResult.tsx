import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, User, Ruler } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import type { TreeAnalysis } from '@/types';
import {
  formatAnalysisDate,
  formatCanopy,
  formatConfidence,
  getHealthyCount,
  getNeedsCareCount,
  getNeedsReplacementCount,
  getTreeHealth,
} from '@/utils/treeHelpers';

export function TreeAnalysisResult({ result }: { result: TreeAnalysis }) {
  const health = getTreeHealth(result);

  const metrics = [
    { label: 'Total Trees', value: result.total_tree_count },
    {
      label: 'Density / Acre',
      value: result.tree_density_per_acre != null ? result.tree_density_per_acre.toFixed(1) : '—',
    },
    { label: 'Canopy Coverage', value: formatCanopy(result.canopy_coverage_pct) },
    { label: 'Confidence', value: formatConfidence(result.confidence_score) },
  ];

  return (
    <div className="space-y-4">
      {result.low_confidence && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-amber-warn/30 bg-amber-warn/10 px-4 py-3 text-sm text-amber-warn"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Low confidence result — consider retaking the image with better lighting or resolution.
        </motion.div>
      )}

      <AnimatedCard className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Analysis Results</h3>
            <p className="mt-1 text-xs text-white/40">
              {result.analysis_id} · {formatAnalysisDate(result.timestamp)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-white/50">
          {result.location && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
              <MapPin className="h-3 w-3" /> {result.location}
            </span>
          )}
          {result.county && (
            <span className="rounded-lg bg-white/5 px-2.5 py-1">{result.county}</span>
          )}
          {result.farmer_id && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
              <User className="h-3 w-3" /> {result.farmer_id}
            </span>
          )}
          {result.land_acres != null && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1">
              <Ruler className="h-3 w-3" /> {result.land_acres} acres
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-white/5 p-4 text-center"
            >
              <p className="text-2xl font-bold text-accent-glow">{m.value}</p>
              <p className="text-xs text-white/50">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {health && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Healthy', value: getHealthyCount(health), color: 'text-emerald-400' },
              { label: 'Needs Care', value: getNeedsCareCount(health), color: 'text-amber-warn' },
              { label: 'Replace', value: getNeedsReplacementCount(health), color: 'text-red-400' },
            ].map((h) => (
              <div key={h.label} className="rounded-lg bg-white/5 p-3 text-center">
                <p className={`text-lg font-bold ${h.color}`}>{h.value}</p>
                <p className="text-[10px] text-white/40">{h.label}</p>
              </div>
            ))}
          </div>
        )}

        {result.tree_species_guess && (
          <p className="mt-4 text-sm text-white/60">
            Species guess: <span className="text-white">{result.tree_species_guess}</span>
          </p>
        )}
      </AnimatedCard>

      {(result.original_image_url || result.overlay_image_url) && (
        <AnimatedCard delay={0.15} className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/70">Image Preview</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.original_image_url && (
              <div>
                <p className="mb-1 text-xs text-white/40">Original</p>
                <img
                  src={result.original_image_url}
                  alt="Original field"
                  className="w-full rounded-xl border border-white/5"
                  loading="lazy"
                />
              </div>
            )}
            {result.overlay_image_url && (
              <div>
                <p className="mb-1 text-xs text-white/40">Detection Overlay</p>
                <img
                  src={result.overlay_image_url}
                  alt="Tree detection overlay"
                  className="w-full rounded-xl border border-white/5"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </AnimatedCard>
      )}

      {result.observations && result.observations.length > 0 && (
        <AnimatedCard delay={0.2} className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Observations</h3>
          <ul className="space-y-2">
            {result.observations.map((o) => (
              <li key={o} className="text-sm text-white/60">· {o}</li>
            ))}
          </ul>
        </AnimatedCard>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <AnimatedCard delay={0.25} className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((r) => (
              <li key={r} className="text-sm text-accent/80">→ {r}</li>
            ))}
          </ul>
        </AnimatedCard>
      )}

      {result.cv_debug && (
        <AnimatedCard delay={0.3} className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/70">CV Engine Details</h3>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {result.cv_debug.orig_resolution && (
              <DebugStat label="Original" value={result.cv_debug.orig_resolution} />
            )}
            {result.cv_debug.work_resolution && (
              <DebugStat label="Processed" value={result.cv_debug.work_resolution} />
            )}
            {result.cv_debug.peaks_detected != null && (
              <DebugStat label="Peaks detected" value={String(result.cv_debug.peaks_detected)} />
            )}
            {result.cv_debug.after_area_filter != null && (
              <DebugStat label="After filter" value={String(result.cv_debug.after_area_filter)} />
            )}
            {result.cv_debug.canopy_px != null && (
              <DebugStat label="Canopy pixels" value={result.cv_debug.canopy_px.toLocaleString()} />
            )}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}

function DebugStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="text-white/40">{label}</p>
      <p className="font-medium text-white/80">{value}</p>
    </div>
  );
}
