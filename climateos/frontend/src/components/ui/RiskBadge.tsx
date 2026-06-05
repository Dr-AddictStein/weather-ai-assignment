import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { RiskLevel } from '@/types';

const styles: Record<RiskLevel, string> = {
  Low: 'risk-low',
  Medium: 'risk-medium',
  High: 'risk-high',
  Critical: 'risk-critical',
};

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', styles[level])}
    >
      {level}
      {score !== undefined && <span className="opacity-70">· {score}</span>}
    </motion.span>
  );
}
