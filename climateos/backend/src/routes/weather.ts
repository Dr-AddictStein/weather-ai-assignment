import { Router, type Request, type Response, type NextFunction } from 'express';
import { buildQuery, weatherAiGet } from '../services/weatherai/client.js';
import { cacheKey, getCached, setCached, TTL } from '../cache/index.js';
import { validateLatLon, clampDays, parseUnits, parseLang } from '../utils/validators.js';

const router = Router();

function weatherParams(req: Request) {
  const coords = validateLatLon(req.query.lat, req.query.lon);
  if (!coords) throw Object.assign(new Error('Valid lat and lon are required.'), { status: 400 });
  return {
    lat: coords.lat,
    lon: coords.lon,
    days: clampDays(req.query.days),
    units: parseUnits(req.query.units),
    lang: parseLang(req.query.lang),
    ai: false,
  };
}

async function cachedProxy(
  req: Request,
  res: Response,
  next: NextFunction,
  endpoint: string,
  ttl: number,
  extraParams: Record<string, string | number | boolean | undefined> = {}
) {
  try {
    const params = { ...weatherParams(req), ...extraParams };
    const key = cacheKey(endpoint, params);
    const cached = getCached<unknown>(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const { data } = await weatherAiGet(`/v1${endpoint}${buildQuery(params)}`);
    setCached(key, data, ttl);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

router.get('/current', (req, res, next) => cachedProxy(req, res, next, '/current', TTL.current));
router.get('/hourly', (req, res, next) => cachedProxy(req, res, next, '/hourly', TTL.hourly));
router.get('/daily', (req, res, next) => cachedProxy(req, res, next, '/daily', TTL.daily));
router.get('/weather', (req, res, next) => cachedProxy(req, res, next, '/weather', TTL.weather));

router.get('/weather-geo', async (req, res, next) => {
  try {
    const params = {
      ip: (req.query.ip as string) ?? 'auto',
      days: clampDays(req.query.days),
      ai: false,
      lat: req.query.lat ? parseFloat(String(req.query.lat)) : undefined,
      lon: req.query.lon ? parseFloat(String(req.query.lon)) : undefined,
    };
    const key = cacheKey('weather-geo', params);
    const cached = getCached<unknown>(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const { data, headers } = await weatherAiGet(`/v1/weather-geo${buildQuery(params)}`);
    setCached(key, data, TTL.geo);
    const geoHeaders = ['x-country', 'x-region', 'x-city'];
    for (const h of geoHeaders) {
      const val = headers.get(h);
      if (val) res.setHeader(h, val);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
