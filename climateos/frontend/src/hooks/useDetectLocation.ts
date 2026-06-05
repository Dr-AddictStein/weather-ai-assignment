import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import type { Location } from '@/types';

export const DETECTED_LOCATION_ID = 'my-detected-location';

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

async function resolvePlaceName(lat: number, lon: number): Promise<{ name: string; county?: string }> {
  try {
    const data = await api.weatherGeo({ lat, lon });
    const loc = data.location;
    if (loc) {
      return {
        name: loc.country ? `My Location (${loc.country})` : 'My Location',
        county: loc.timezone,
      };
    }
  } catch {
    // fall through to coordinate label
  }
  return { name: 'My Location', county: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` };
}

export function useDetectLocation() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locations, updateLocation } = useAppStore();

  const detectLocation = useCallback(async (): Promise<Location | null> => {
    setIsDetecting(true);
    setError(null);

    try {
      let lat: number;
      let lon: number;

      try {
        const pos = await getBrowserPosition();
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {
        const data = await api.weatherGeo();
        const geo = data.geo ?? data.location;
        if (!geo?.lat || !geo?.lon) {
          throw new Error('Could not detect your location. Try adding a location manually.');
        }
        lat = geo.lat;
        lon = geo.lon;
      }

      const place = await resolvePlaceName(lat, lon);
      const existing = locations.find((l) => l.id === DETECTED_LOCATION_ID);

      if (existing) {
        updateLocation(DETECTED_LOCATION_ID, {
          name: place.name,
          lat,
          lon,
          county: place.county,
          cropType: 'Auto-detected',
        });
        return { ...existing, name: place.name, lat, lon, county: place.county, cropType: 'Auto-detected' };
      }

      const newLoc: Location = {
        id: DETECTED_LOCATION_ID,
        name: place.name,
        lat,
        lon,
        county: place.county,
        cropType: 'Auto-detected',
      };

      // addLocation generates a new id — insert detected location directly via store
      useAppStore.setState((s) => ({
        locations: [...s.locations, newLoc],
      }));

      return newLoc;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Location detection failed.';
      setError(message);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [locations, updateLocation]);

  return { detectLocation, isDetecting, error, clearError: () => setError(null) };
}
