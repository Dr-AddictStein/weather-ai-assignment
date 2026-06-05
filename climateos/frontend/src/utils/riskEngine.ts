import type { DailyForecast, FieldWorkWindow, HourlyForecast, Recommendation, RiskLevel, RiskScore, WeatherResponse } from '@/types';
import {
  getHourly, getDaily, getTemp, getWindGust,
  getPrecipProb, getPrecipSum, getUpcomingHours, getTempMax,
} from './weatherHelpers';

function levelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function scoreRainRisk(hourly: HourlyForecast[], daily: DailyForecast[]): RiskScore {
  const next24 = getUpcomingHours(hourly, 24);
  const maxProb = Math.max(0, ...next24.map(getPrecipProb), ...daily.slice(0, 2).map(getPrecipProb));
  const dailyPrecip = daily.slice(0, 2).reduce((s, d) => s + getPrecipSum(d), 0);

  let score = maxProb * 0.6;
  if (dailyPrecip > 20) score += 25;
  else if (dailyPrecip > 10) score += 15;
  else if (dailyPrecip > 3) score += 8;
  else if (maxProb > 70) score += 10;

  score = Math.min(100, Math.round(score));
  const factors: string[] = [];
  if (maxProb > 60) factors.push(`${Math.round(maxProb)}% precipitation probability`);
  if (dailyPrecip > 3) factors.push(`${dailyPrecip.toFixed(1)}mm expected over next 2 days`);
  if (factors.length === 0) factors.push('Low precipitation expected');

  return { score, level: levelFromScore(score), factors };
}

export function scoreHeatRisk(hourly: HourlyForecast[], daily: DailyForecast[], units: string): RiskScore {
  const threshold = units === 'imperial' ? 95 : 35;
  const stressThreshold = units === 'imperial' ? 100 : 38;
  const next24 = getUpcomingHours(hourly, 24);
  const maxTemp = Math.max(
    0,
    ...next24.map(getTemp),
    ...daily.slice(0, 2).map(getTempMax),
  );

  let score = 0;
  if (maxTemp >= stressThreshold) score = 85;
  else if (maxTemp >= threshold) score = 50 + (maxTemp - threshold) * 3;
  else if (maxTemp >= threshold - 5) score = 25;

  score = Math.min(100, Math.round(score));
  const factors: string[] =
    maxTemp >= threshold
      ? [`Peak temperature ${Math.round(maxTemp)}°`]
      : ['Temperatures within normal range'];

  return { score, level: levelFromScore(score), factors };
}

export function scoreWindRisk(hourly: HourlyForecast[], daily: DailyForecast[], units: string): RiskScore {
  const highWind = units === 'imperial' ? 25 : 40;
  const extremeWind = units === 'imperial' ? 40 : 65;
  const next24 = getUpcomingHours(hourly, 24);
  const maxWind = Math.max(
    0,
    ...next24.map((h) => getWindGust(h)),
    ...daily.slice(0, 2).map((d) => getWindGust(d)),
  );

  let score = 0;
  if (maxWind >= extremeWind) score = 80;
  else if (maxWind >= highWind) score = 40 + (maxWind - highWind) * 2;
  else if (maxWind >= highWind * 0.7) score = 20;

  score = Math.min(100, Math.round(score));
  const factors: string[] =
    maxWind >= highWind
      ? [`Winds up to ${Math.round(maxWind)} ${units === 'imperial' ? 'mph' : 'km/h'}`]
      : ['Wind conditions manageable'];

  return { score, level: levelFromScore(score), factors };
}

export function computeAllRisks(data: WeatherResponse, units: string) {
  const hourly = getHourly(data);
  const daily = getDaily(data);
  return {
    rain: scoreRainRisk(hourly, daily),
    heat: scoreHeatRisk(hourly, daily, units),
    wind: scoreWindRisk(hourly, daily, units),
  };
}

export function generateRecommendations(
  risks: ReturnType<typeof computeAllRisks>
): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  if (risks.rain.level === 'High' || risks.rain.level === 'Critical') {
    recs.push({
      id: String(++id),
      priority: risks.rain.level,
      title: 'Prepare drainage & protect inputs',
      description: 'Heavy rain expected. Clear field drains, cover fertilizer and seeds, and postpone soil tillage if possible.',
      timeframe: '24h',
      category: 'rain',
    });
  } else if (risks.rain.level === 'Medium') {
    recs.push({
      id: String(++id),
      priority: 'Medium',
      title: 'Monitor soil moisture',
      description: 'Moderate rain chance. Check drainage channels and adjust irrigation schedules.',
      timeframe: '24h',
      category: 'rain',
    });
  }

  if (risks.wind.level === 'High' || risks.wind.level === 'Critical') {
    recs.push({
      id: String(++id),
      priority: risks.wind.level,
      title: 'Postpone spray operations',
      description: 'High winds detected. Secure greenhouse covers, check tree supports, and delay aerial or ground spraying.',
      timeframe: '24h',
      category: 'wind',
    });
  }

  if (risks.heat.level === 'High' || risks.heat.level === 'Critical') {
    recs.push({
      id: String(++id),
      priority: risks.heat.level,
      title: 'Adjust irrigation & work hours',
      description: 'Heat stress risk elevated. Irrigate early morning or evening. Avoid field work between 11am–3pm.',
      timeframe: '24h',
      category: 'heat',
    });
  }

  if (risks.heat.level === 'Medium') {
    recs.push({
      id: String(++id),
      priority: 'Medium',
      title: 'Increase hydration monitoring',
      description: 'Warm conditions ahead. Monitor crop water stress and consider mulching exposed soil.',
      timeframe: '7d',
      category: 'heat',
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: String(++id),
      priority: 'Low',
      title: 'Favorable conditions for field work',
      description: 'Weather looks stable. Good window for planting, pruning, and routine maintenance.',
      timeframe: '7d',
      category: 'general',
    });
  }

  return recs;
}

export function computeFieldWorkWindows(hourly: HourlyForecast[], units: string): FieldWorkWindow[] {
  const windows: FieldWorkWindow[] = [];
  const hot = units === 'imperial' ? 90 : 32;
  const rainy = 50;
  const upcoming = getUpcomingHours(hourly, 48);

  const morning = upcoming.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= 6 && hour < 10;
  });
  const midday = upcoming.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= 11 && hour < 15;
  });
  const evening = upcoming.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= 16 && hour < 19;
  });

  const assess = (period: string, slice: HourlyForecast[]) => {
    if (!slice.length) return;
    const avgTemp = slice.reduce((s, h) => s + getTemp(h), 0) / slice.length;
    const maxRain = Math.max(...slice.map(getPrecipProb));
    const maxWind = Math.max(...slice.map((h) => getWindGust(h)));

    let rating: FieldWorkWindow['rating'] = 'good';
    let reason = 'Suitable for most field activities.';
    if (maxRain > rainy || maxWind > (units === 'imperial' ? 20 : 35)) {
      rating = 'avoid';
      reason = maxRain > rainy ? 'High rain probability.' : 'Strong winds expected.';
    } else if (avgTemp > hot) {
      rating = 'avoid';
      reason = 'Heat stress risk for workers and crops.';
    } else if (maxRain < 20 && avgTemp < hot && maxWind < (units === 'imperial' ? 15 : 25)) {
      rating = 'best';
      reason = 'Optimal temperature, low rain and wind.';
    }
    windows.push({ period, rating, reason });
  };

  assess('Early Morning (6–10 AM)', morning);
  assess('Midday (11 AM–3 PM)', midday);
  assess('Late Afternoon (4–7 PM)', evening);

  return windows;
}
