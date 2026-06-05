import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import weatherRoutes from './routes/weather.js';
import treesRoutes from './routes/trees.js';
import usageRoutes from './routes/usage.js';

function getCorsOrigin(): string | string[] | boolean {
  const origins: string[] = [];
  if (env.corsOrigin) origins.push(env.corsOrigin);
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  return origins.length > 0 ? origins : true;
}

const app = express();

app.use(cors({ origin: getCorsOrigin() }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.', status: 429 },
});
app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    keyConfigured: Boolean(env.weatherAiApiKey),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', weatherRoutes);
app.use('/api/trees', treesRoutes);
app.use('/api/usage', usageRoutes);

app.use(errorHandler);

export default app;
