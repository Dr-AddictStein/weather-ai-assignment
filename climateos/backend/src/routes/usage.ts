import { Router } from 'express';
import { weatherAiGet } from '../services/weatherai/client.js';
import { getCached, setCached, TTL } from '../cache/index.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const key = 'usage';
    const cached = getCached<unknown>(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const { data } = await weatherAiGet('/v1/usage');
    setCached(key, data, TTL.usage);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
