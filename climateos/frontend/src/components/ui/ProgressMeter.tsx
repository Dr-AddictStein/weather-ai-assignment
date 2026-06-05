import { motion } from 'framer-motion';

interface ProgressMeterProps {
  label: string;
  used: number;
  limit: number;
  color?: string;
  delay?: number;
}

export function ProgressMeter({ label, used, limit, color = '#34d399', delay = 0 }: ProgressMeterProps) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const remaining = Math.max(0, limit - used);
  const isLow = pct > 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className={isLow ? 'text-amber-warn' : 'text-white/80'}>
          {used} / {limit} <span className="text-white/40">({remaining} left)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: isLow ? '#fbbf24' : color }}
        />
      </div>
    </div>
  );
}
