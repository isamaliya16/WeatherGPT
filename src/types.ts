export interface WeatherData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  precipitation_mm: number;
  rain_probability: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_compass: string;
  wind_gust_kmh: number;
  pressure_hpa: number;
  visibility_km: number;
  uv_index: number;
  cloud_cover_pct: number;
  dew_point_c: number;
  condition_code: number;
  condition_text: string;
  is_day: boolean;
  timestamp: string;
  air_quality: {
    aqi_in: number;
    category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
    pm2_5: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
  };
  sources: string[];
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temp: number;
  humidity: number;
  rain_probability: number;
  precipitation_mm: number;
  wind_speed: number;
  condition: string;
  is_day: boolean;
}

export interface DailyForecastItem {
  date: string;
  day_name: string;
  temp_max: number;
  temp_min: number;
  rain_probability: number;
  rain_sum_mm: number;
  wind_speed_max: number;
  condition: string;
  sunrise: string;
  sunset: string;
  uv_index_max: number;
  advisory_brief: string;
}

export interface NWPModelData {
  name: 'GFS (NOAA)' | 'ECMWF (Europe)' | 'WRF-India (IMD/IITM)' | 'NCMRWF Unified';
  temp_24h: number;
  rain_prob_24h: number;
  rainfall_mm_24h: number;
  wind_speed_24h: number;
  confidence: number;
  convergence_status: 'High Agreement' | 'Moderate Divergence' | 'Local Convective Spread';
}

export interface NWPComparison {
  consensus_temperature: number;
  consensus_rainfall_prob: number;
  consensus_summary: string;
  models: NWPModelData[];
}

export interface WeatherAlert {
  id: string;
  hazard_type:
    | 'Heavy Rainfall'
    | 'Extremely Heavy Rainfall'
    | 'Tropical Cyclone'
    | 'Lightning & Thunderstorm'
    | 'Urban Flood'
    | 'Heatwave'
    | 'Squally Wind & High Waves'
    | 'Dense Fog';
  severity: 'Red' | 'Orange' | 'Yellow' | 'Green';
  severity_label: 'Warning (Take Action)' | 'Alert (Be Prepared)' | 'Watch (Be Updated)' | 'No Warning';
  title: string;
  headline: string;
  location: string;
  state: string;
  districts_affected: string[];
  effective_from: string;
  expires_at: string;
  description: string;
  action_instructions: string[];
  helpline_numbers: { name: string; number: string }[];
  is_official: boolean;
  source: 'IMD (India Meteorological Dept)' | 'NDMA India' | 'INCOIS' | 'WeatherNova Decision Engine';
  coordinates: [number, number];
  radius_km?: number;
}

export interface SectorAdvisory {
  location: string;
  updated_at: string;
  agriculture: {
    irrigation_advice: string;
    spraying_window: string;
    harvest_recommendation: string;
    crops: {
      crop_name: string;
      stage: string;
      guidance: string;
      risk_level: 'Low' | 'Moderate' | 'High';
    }[];
  };
  marine: {
    sea_condition: 'Calm' | 'Moderate' | 'Rough' | 'Very Rough' | 'Phenomenal - High Danger';
    wave_height_range_m: string;
    wind_knots: number;
    coastal_advisory: string;
    deep_sea_permission: boolean;
    safe_havens: string[];
  };
  public_health: {
    heat_index_level: 'Normal' | 'Caution' | 'Extreme Caution' | 'Danger';
    hydration_guideline: string;
    outdoor_activity_window: string;
    travel_risk_summary: string;
  };
  disaster: {
    vulnerability_index: 'Low' | 'Elevated' | 'Critical';
    waterlogging_prone_areas: string[];
    shelter_status: string;
    emergency_actions: string[];
  };
}

export interface HistoricalYearRecord {
  year: number;
  annual_rainfall_mm: number;
  monsoon_rainfall_mm: number;
  rainfall_anomaly_pct: number;
  avg_max_temp_c: number;
  extreme_rain_days: number;
  heatwave_days: number;
}

export interface MonthlyClimatologyRecord {
  month: string;
  normal_rainfall_mm: number;
  recorded_rainfall_mm: number;
  normal_temp_c: number;
  recorded_temp_c: number;
}

export interface HistoricalClimateData {
  city: string;
  state: string;
  period_years: string;
  monsoon_onset_trend: string;
  annual_records: HistoricalYearRecord[];
  monthly_climatology: MonthlyClimatologyRecord[];
  climate_insight_en: string;
  climate_insight_native: string;
}

export interface IndianLanguage {
  code: string;
  name: string;
  native_name: string;
  script: string;
  bhashini_id: string;
  tts_lang_code: string;
  welcome_greeting: string;
  sample_queries: string[];
}

export interface ForecastResponse {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  nwp: NWPComparison;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language_code?: string;
  is_voice?: boolean;
  detected_intent?: string;
  tool_invocations?: {
    tool: string;
    params: Record<string, any>;
    status: 'success' | 'warning' | 'info';
  }[];
  weather_snapshot?: Partial<WeatherData>;
  historical_snapshot?: any;
  alert_snapshot?: WeatherAlert;
  alerts?: WeatherAlert[];
  advisory_snapshot?: Partial<SectorAdvisory>;
  is_audio_playing?: boolean;
}

export interface LocationPreset {
  id: string;
  city: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  region_type: 'Agricultural Hub' | 'Coastal / Fishery' | 'Urban Metropolis' | 'Hilly / Flood Prone';
  primary_crops?: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  location: LocationPreset;
  language: IndianLanguage;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  savedAt?: string;
}
