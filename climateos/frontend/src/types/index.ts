export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  county?: string;
  cropType?: string;
  isDefault?: boolean;
}

export interface WeatherLocation {
  lat: number;
  lon: number;
  timezone?: string;
  requested_lat?: number;
  requested_lon?: number;
  country?: string;
}

export interface CurrentWeather {
  time?: string;
  temperature: number;
  wind_speed?: number;
  wind_direction?: number;
  condition_code?: string;
  icon?: string;
  icon_path?: string;
  humidity?: number;
  feels_like?: number;
  wind_gust?: number;
  uv_index?: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation_probability?: number;
  wind_speed?: number;
  wind_gust?: number;
  condition_code?: string;
  icon?: string;
  icon_path?: string;
  humidity?: number;
  feels_like?: number;
  uv_index?: number;
}

export interface DailyForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation_sum?: number;
  precipitation_probability?: number;
  wind_max?: number;
  condition_code?: string;
  icon?: string;
  icon_path?: string;
  sunrise?: string;
  sunset?: string;
}

/** Response shape for GET /v1/weather, /v1/forecast, /v1/hourly, /v1/daily */
export interface WeatherResponse {
  location?: WeatherLocation;
  current?: CurrentWeather;
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  client_geo?: {
    country?: string;
    ip_hash?: string;
  };
  geo?: {
    lat?: number;
    lon?: number;
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface UsageData {
  plan?: string;
  requests?: { used?: number; limit?: number; remaining?: number };
  ai_requests?: { used?: number; limit?: number; remaining?: number };
  aiRequests?: { used?: number; limit?: number; remaining?: number };
  period?: { start?: string; end?: string };
  billing_period?: { start?: string; end?: string };
}

/** GET /v1/trees/quota */
export interface TreeQuota {
  plan?: string;
  used?: number;
  limit?: number;
  remaining?: number;
  unlimited?: boolean;
  resets_at?: string;
}

export interface TreeHealth {
  healthy?: number;
  needs_care?: number;
  needs_replacement?: number;
}

export interface TreeCvDebug {
  orig_resolution?: string;
  work_resolution?: string;
  canopy_px?: number;
  peaks_detected?: number;
  after_area_filter?: number;
}

/** POST /v1/trees/analyze response */
export interface TreeAnalysis {
  analysis_id: string;
  timestamp: string;
  farmer_id?: string;
  county?: string;
  location?: string;
  land_acres?: number;
  total_tree_count: number;
  tree_density_per_acre?: number;
  confidence_score: number;
  canopy_coverage_pct: number;
  tree_health?: TreeHealth;
  low_confidence?: boolean;
  tree_species_guess?: string;
  observations?: string[];
  recommendations?: string[];
  original_image_url?: string;
  overlay_image_url?: string;
  cv_debug?: TreeCvDebug;
}

/** GET /v1/trees/history */
export interface TreeHistoryResponse {
  analyses: TreeAnalysis[];
  next_cursor?: string | null;
  total?: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: string[];
}

export interface Recommendation {
  id: string;
  priority: RiskLevel;
  title: string;
  description: string;
  timeframe: '24h' | '7d';
  category: 'rain' | 'heat' | 'wind' | 'general';
}

export interface FieldWorkWindow {
  period: string;
  rating: 'best' | 'good' | 'avoid';
  reason: string;
}
