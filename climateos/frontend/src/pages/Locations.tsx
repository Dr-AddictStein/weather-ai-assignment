import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Star, Trash2, Pencil, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useAppStore } from '@/store/useAppStore';
import { useFullWeather } from '@/hooks/useWeather';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { formatTemp, getEnrichedCurrent } from '@/utils/weatherHelpers';
import type { Location } from '@/types';

function LocationWeatherMini({ loc }: { loc: Location }) {
  const units = useAppStore((s) => s.units);
  const { data, isLoading } = useFullWeather(loc);

  if (isLoading) return <div className="h-8 w-20 animate-pulse rounded bg-white/10" />;
  const current = data ? getEnrichedCurrent(data) : undefined;
  if (!current) return null;
  return (
    <div className="flex items-center gap-2">
      <WeatherIcon icon={current.icon} conditionCode={current.condition_code} size="sm" />
      <span className="font-semibold">{formatTemp(current.temperature, units)}</span>
    </div>
  );
}

export function Locations() {
  const { locations, addLocation, updateLocation, removeLocation, setDefaultLocation } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', lat: '', lon: '', county: '', cropType: '' });

  const resetForm = () => {
    setForm({ name: '', lat: '', lon: '', county: '', cropType: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (!form.name || isNaN(lat) || isNaN(lon)) return;

    if (editingId) {
      updateLocation(editingId, { name: form.name, lat, lon, county: form.county, cropType: form.cropType });
    } else {
      addLocation({ name: form.name, lat, lon, county: form.county, cropType: form.cropType });
    }
    resetForm();
  };

  const startEdit = (loc: Location) => {
    setForm({
      name: loc.name,
      lat: String(loc.lat),
      lon: String(loc.lon),
      county: loc.county ?? '',
      cropType: loc.cropType ?? '',
    });
    setEditingId(loc.id);
    setShowForm(true);
  };

  return (
    <div>
      <Header title="Farm Locations" subtitle="Manage monitored fields and set your default" />

      <div className="mb-6 flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <AnimatedCard hover={false} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">{editingId ? 'Edit Location' : 'New Location'}</h3>
                <button onClick={resetForm} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <input className="input-field" placeholder="Farm name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="input-field" placeholder="Crop type (e.g. Maize)" value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} />
                <input className="input-field" placeholder="Latitude" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
                <input className="input-field" placeholder="Longitude" type="number" step="any" value={form.lon} onChange={(e) => setForm({ ...form, lon: e.target.value })} required />
                <input className="input-field sm:col-span-2" placeholder="County / Region" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Add Location'}</button>
                </div>
              </form>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2">
        {locations.map((loc, i) => (
          <AnimatedCard key={loc.id} delay={i * 0.08} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent/10 p-2.5">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{loc.name}</h3>
                    {loc.isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        <Star className="h-2.5 w-2.5" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">{loc.county} · {loc.cropType}</p>
                  <p className="text-xs text-white/30">{loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}</p>
                </div>
              </div>
              <LocationWeatherMini loc={loc} />
            </div>
            <div className="mt-4 flex gap-2">
              {!loc.isDefault && (
                <button onClick={() => setDefaultLocation(loc.id)} className="btn-ghost text-xs">Set Default</button>
              )}
              <button onClick={() => startEdit(loc)} className="btn-ghost text-xs"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => removeLocation(loc.id)} className="btn-ghost text-xs text-red-400 hover:text-red-300">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}
