import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  weatherAiBaseUrl: process.env.WEATHERAI_BASE_URL ?? 'https://api.weather-ai.co',
  weatherAiApiKey: process.env.WEATHERAI_API_KEY ?? '',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
