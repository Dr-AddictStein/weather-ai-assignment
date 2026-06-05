import { useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';

export function useGeoDetect() {
  const ran = useRef(false);
  const { locations, addLocation, setDefaultLocation } = useAppStore();

  useEffect(() => {
    if (ran.current) return;
    const hasCustom = locations.some((l) => l.id !== 'default-nairobi');
    if (hasCustom) return;

    ran.current = true;
    api.weatherGeo()
      .then((data) => {
        const loc = data.location;
        if (!loc?.lat || !loc?.lon) return;
        addLocation({
          name: `Detected (${loc.country ?? 'auto'})`,
          lat: loc.lat,
          lon: loc.lon,
          county: loc.timezone,
          cropType: 'Mixed',
        });
        const latest = useAppStore.getState().locations;
        const added = latest[latest.length - 1];
        if (added) setDefaultLocation(added.id);
      })
      .catch(() => {});
  }, [locations, addLocation, setDefaultLocation]);
}
