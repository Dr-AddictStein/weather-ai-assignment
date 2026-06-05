export function validateLatLon(lat: unknown, lon: unknown): { lat: number; lon: number } | null {
  const latNum = parseFloat(String(lat));
  const lonNum = parseFloat(String(lon));
  if (isNaN(latNum) || isNaN(lonNum)) return null;
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;
  return { lat: latNum, lon: lonNum };
}

export function clampDays(days: unknown): number {
  const n = parseInt(String(days ?? '7'), 10);
  if (isNaN(n)) return 7;
  return Math.min(Math.max(n, 1), 7);
}

export function parseUnits(units: unknown): 'metric' | 'imperial' {
  return units === 'imperial' ? 'imperial' : 'metric';
}

export function parseLang(lang: unknown): string {
  return typeof lang === 'string' && lang.length > 0 ? lang : 'en';
}
