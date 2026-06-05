import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { useDetectLocation, DETECTED_LOCATION_ID } from '@/hooks/useDetectLocation';
import type { Location } from '@/types';

interface LocationSwitcherProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeLayoutId?: string;
}

export function LocationSwitcher({
  selectedId,
  onSelect,
  activeLayoutId = 'location-active',
}: LocationSwitcherProps) {
  const locations = useAppStore((s) => s.locations);
  const { detectLocation, isDetecting, error: detectError, clearError } = useDetectLocation();

  const handleDetect = async () => {
    clearError();
    const detected = await detectLocation();
    if (detected) onSelect(DETECTED_LOCATION_ID);
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">Location</p>
        <button
          onClick={handleDetect}
          disabled={isDetecting}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300',
            isDetecting
              ? 'border-accent/20 bg-accent/5 text-accent/60'
              : 'border-accent/30 bg-accent/10 text-accent-glow hover:border-accent/50 hover:bg-accent/15'
          )}
        >
          {isDetecting ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...</>
          ) : (
            <><Navigation className="h-3.5 w-3.5" /> Use my location</>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => (
          <LocationButton
            key={loc.id}
            loc={loc}
            active={loc.id === selectedId}
            onClick={() => onSelect(loc.id)}
            activeLayoutId={activeLayoutId}
          />
        ))}
      </div>

      {detectError && (
        <p className="mt-2 text-xs text-red-400">{detectError}</p>
      )}
    </div>
  );
}

function LocationButton({
  loc,
  active,
  onClick,
  activeLayoutId,
}: {
  loc: Location;
  active: boolean;
  onClick: () => void;
  activeLayoutId: string;
}) {
  const isDetected = loc.id === DETECTED_LOCATION_ID;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'relative inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300',
        active
          ? 'border-accent/40 bg-accent/15 text-accent-glow shadow-glow-sm'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/90'
      )}
    >
      {active && (
        <motion.div
          layoutId={activeLayoutId}
          className="absolute inset-0 rounded-xl border border-accent/30 bg-accent/5"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {isDetected ? (
          <Navigation className="h-3.5 w-3.5" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
        {loc.name}
        {loc.cropType && (
          <span className="text-[10px] font-normal text-white/40">· {loc.cropType}</span>
        )}
      </span>
    </motion.button>
  );
}
