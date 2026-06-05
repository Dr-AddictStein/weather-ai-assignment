import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Thermometer } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const location = useAppStore((s) => s.getDefaultLocation());
  const { units, setUnits } = useAppStore();
  const queryClient = useQueryClient();
  const [cooldown, setCooldown] = useState(false);

  const handleRefresh = () => {
    if (cooldown) return;
    setCooldown(true);
    queryClient.invalidateQueries();
    setTimeout(() => setCooldown(false), 5000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        {location && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
            <MapPin className="h-3 w-3" />
            {location.name} · {location.cropType}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          className="btn-ghost text-xs"
        >
          <Thermometer className="h-4 w-4" />
          {units === 'metric' ? '°C' : '°F'}
        </button>
        <button
          onClick={handleRefresh}
          disabled={cooldown}
          className="btn-ghost"
        >
          <RefreshCw className={`h-4 w-4 ${cooldown ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </motion.header>
  );
}
