import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import type { RiskScore } from '@/types';

interface Props {
  rain: RiskScore;
  heat: RiskScore;
  wind: RiskScore;
}

const cards = [
  { key: 'rain' as const, icon: CloudRain, label: 'Rain Risk', gradient: 'from-sky-calm/20 to-sky-deep/5' },
  { key: 'heat' as const, icon: Sun, label: 'Heat Stress', gradient: 'from-amber-hot/20 to-amber-warn/5' },
  { key: 'wind' as const, icon: Wind, label: 'Wind Risk', gradient: 'from-accent/20 to-accent-muted/5' },
];

export function RiskSummaryCards({ rain, heat, wind }: Props) {
  const risks = { rain, heat, wind };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, i) => {
        const risk = risks[card.key];
        return (
          <AnimatedCard key={card.key} delay={0.1 + i * 0.1} className={`relative overflow-hidden p-5 bg-gradient-to-br ${card.gradient}`}>
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-white/5 p-2.5">
                <card.icon className="h-5 w-5 text-white/70" />
              </div>
              <RiskBadge level={risk.level} score={risk.score} />
            </div>
            <h3 className="mt-4 font-display text-sm font-semibold">{card.label}</h3>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.score}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
              />
            </div>
            <p className="mt-3 text-xs text-white/40">{risk.factors[0]}</p>
          </AnimatedCard>
        );
      })}
    </div>
  );
}
