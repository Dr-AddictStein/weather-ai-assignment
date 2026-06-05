import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '@/types';

export type Units = 'metric' | 'imperial';
export type RefreshMode = 'normal' | 'saver';

interface AppState {
  locations: Location[];
  defaultLocationId: string | null;
  units: Units;
  lang: string;
  timezone: string;
  refreshMode: RefreshMode;
  sidebarCollapsed: boolean;

  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  setDefaultLocation: (id: string) => void;
  getDefaultLocation: () => Location | null;
  setUnits: (units: Units) => void;
  setLang: (lang: string) => void;
  setTimezone: (tz: string) => void;
  setRefreshMode: (mode: RefreshMode) => void;
  toggleSidebar: () => void;
}

const DEFAULT_LOCATION: Location = {
  id: 'default-nairobi',
  name: 'Nairobi Farm',
  lat: -1.2921,
  lon: 36.8219,
  county: 'Nairobi County',
  cropType: 'Maize',
  isDefault: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locations: [DEFAULT_LOCATION],
      defaultLocationId: DEFAULT_LOCATION.id,
      units: 'metric',
      lang: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      refreshMode: 'normal',
      sidebarCollapsed: false,

      addLocation: (loc) => {
        const id = crypto.randomUUID();
        const isFirst = get().locations.length === 0;
        set((s) => ({
          locations: [...s.locations, { ...loc, id, isDefault: isFirst }],
          defaultLocationId: isFirst ? id : s.defaultLocationId,
        }));
      },

      updateLocation: (id, updates) =>
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      removeLocation: (id) =>
        set((s) => {
          const filtered = s.locations.filter((l) => l.id !== id);
          const wasDefault = s.defaultLocationId === id;
          return {
            locations: filtered.length ? filtered : [DEFAULT_LOCATION],
            defaultLocationId: wasDefault
              ? (filtered[0]?.id ?? DEFAULT_LOCATION.id)
              : s.defaultLocationId,
          };
        }),

      setDefaultLocation: (id) =>
        set((s) => ({
          defaultLocationId: id,
          locations: s.locations.map((l) => ({ ...l, isDefault: l.id === id })),
        })),

      getDefaultLocation: () => {
        const s = get();
        return s.locations.find((l) => l.id === s.defaultLocationId) ?? s.locations[0] ?? null;
      },

      setUnits: (units) => set({ units }),
      setLang: (lang) => set({ lang }),
      setTimezone: (timezone) => set({ timezone }),
      setRefreshMode: (refreshMode) => set({ refreshMode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'climateos-storage' }
  )
);
