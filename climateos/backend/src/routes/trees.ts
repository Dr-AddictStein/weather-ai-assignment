import { Router } from 'express';
import multer from 'multer';
import { buildQuery, weatherAiGet, weatherAiPostMultipart } from '../services/weatherai/client.js';
import { cacheKey, getCached, invalidatePrefix, setCached, TTL } from '../cache/index.js';

const router = Router();
const maxUploadMb = process.env.VERCEL ? 4 : 20;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: `Image file is required (jpeg/png/webp, max ${maxUploadMb}MB).` });
      return;
    }
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    formData.append('image', blob, req.file.originalname);
    const fields = ['farmerId', 'county', 'landAcres', 'location', 'notes'] as const;
    for (const field of fields) {
      if (req.body[field]) formData.append(field, String(req.body[field]));
    }
    const { data } = await weatherAiPostMultipart('/v1/trees/analyze', formData);
    invalidatePrefix('trees-history');
    invalidatePrefix('trees-quota');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const params = { limit, cursor };
    const key = cacheKey('trees-history', params);
    const cached = getCached<unknown>(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const { data } = await weatherAiGet(`/v1/trees/history${buildQuery(params)}`);
    setCached(key, data, TTL.history);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/quota', async (_req, res, next) => {
  try {
    const key = 'trees-quota';
    const cached = getCached<unknown>(key);
    if (cached) {
      res.json(cached);
      return;
    }
    const { data } = await weatherAiGet('/v1/trees/quota');
    setCached(key, data, TTL.quota);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
