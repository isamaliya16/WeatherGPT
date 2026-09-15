import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge,
  Eye,
  Sun,
  ShieldAlert,
  Sprout,
  Anchor,
  HeartPulse,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Info,
  MapPin,
  Navigation
} from 'lucide-react';
import {
  WeatherData,
  HourlyForecastItem,
  DailyForecastItem,
  NWPComparison,
  SectorAdvisory,
  WeatherAlert,
  IndianLanguage
} from '../types';
import { getTranslations, translateCondition, getMetricLabels } from '../services/weatherTranslations';

interface DashboardProps {
  weather: WeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  nwp: NWPComparison;
  advisories: SectorAdvisory;
  alerts: WeatherAlert[];
  currentLanguage: IndianLanguage;
  onAskAi: (prompt: string) => void;
  onOpenAlerts: () => void;
  onOpenMap: () => void;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  weather,
  hourly,
  daily,
  nwp,
  advisories,
  alerts,
  currentLanguage,
  onAskAi,
  onOpenAlerts,
  onOpenMap,
  onDetectLocation,
  isDetectingLocation
}) => {
  const t = getTranslations(currentLanguage.code);
  const labels = getMetricLabels(currentLanguage.code);
  const isRainLikely = weather.rain_probability >= 40;

  const getAqiBadge = (cat: string) => {
    switch (cat) {
      case 'Good':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Satisfactory':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Poor':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Very Poor':
      case 'Severe':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const localizedCondition = translateCondition(weather.condition_text, currentLanguage.code);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Location, Live Status & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {t.metrics.liveGroundStation}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              {t.metrics.updatedAt} {new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {weather.city}, <span className="text-slate-500 font-semibold">{weather.state}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.metrics.groundTruthSources}: {weather.sources.join(' • ')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
              title="Detect my current location via GPS"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? `${t.actions.detectingLocation}...` : t.nav.location}</span>
            </button>
          )}

          <button
            onClick={onOpenMap}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{t.nav.map}</span>
          </button>

          <button
            onClick={() => onAskAi(currentLanguage.sample_queries[0])}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.nav.chat} ({currentLanguage.native_name})</span>
          </button>
        </div>
      </div>

      {/* Hero Weather Condition & Atmospheric Dials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Temperature & Visual State */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-3">
                {t.metrics.currentObservation}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl sm:text-7xl font-extrabold text-slate-900 tracking-tight font-display">
                  {Math.round(weather.temperature)}°
                </span>
                <span className="text-2xl font-bold text-slate-400">
                  C
                </span>
                <div className="text-xs text-slate-600 pl-3 border-l border-slate-200 space-y-0.5">
                  <div>{t.metrics.feelsLike} <span className="text-slate-900 font-bold">{weather.feels_like}°C</span></div>
                  <div>{t.metrics.high}: <span className="text-slate-900 font-bold">{weather.temp_max}°C</span> • {t.metrics.low}: <span className="text-slate-900 font-bold">{weather.temp_min}°C</span></div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-2.5">
                {localizedCondition}
              </h2>
            </div>

            {/* Precipitation probability pill */}
            <div className="text-right">
              <div className="inline-flex flex-col items-end">
                <span className="text-xs text-slate-500 font-medium">{labels.rain_prob}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isRainLikely ? 'bg-blue-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${weather.rain_probability}%` }}
                    ></div>
                  </div>
                  <span className={`text-base font-extrabold ${isRainLikely ? 'text-blue-600' : 'text-slate-700'}`}>
                    {weather.rain_probability}%
                  </span>
                </div>
                {weather.precipitation_mm > 0 && (
                  <span className="text-[11px] text-blue-700 font-semibold mt-1">
                    {weather.precipitation_mm} mm
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Atmospheric Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.humidity}</div>
                <div className="text-sm font-extrabold text-slate-900">{weather.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.wind}</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {weather.wind_speed_kmh} km/h
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.uv_index}</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {weather.uv_index}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{labels.pressure}</div>
                <div className="text-sm font-extrabold text-slate-900">{weather.pressure_hpa} hPa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality & Compass Card */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Air Quality Index */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {labels.aqi} (NAQI)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getAqiBadge(weather.air_quality.category)}`}>
                {weather.air_quality.category}
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {weather.air_quality.aqi_in}
              </span>
              <span className="text-xs text-slate-500 font-medium">AQI</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">PM2.5</div>
                <div className="text-xs font-bold text-slate-800">{weather.air_quality.pm2_5}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">PM10</div>
                <div className="text-xs font-bold text-slate-800">{weather.air_quality.pm10}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">NO₂</div>
                <div className="text-xs font-bold text-slate-800">{weather.air_quality.no2}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-semibold">O₃</div>
                <div className="text-xs font-bold text-slate-800">{weather.air_quality.o3}</div>
              </div>
            </div>
          </div>

          {/* Wind & Gust Direction */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {labels.wind}
              </div>
              <div className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
                {weather.wind_direction_compass}
                <span className="text-xs font-medium text-slate-500">({weather.wind_direction_deg}°)</span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {labels.windGusts}: <span className="text-slate-900 font-bold">{weather.wind_gust_kmh} km/h</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Compass
                className="w-8 h-8 text-emerald-600 transition-transform duration-700"
                style={{ transform: `rotate(${weather.wind_direction_deg}deg)` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Meteorological Decision Support Tiles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              {t.nav.advisories}
            </h2>
            <p className="text-xs text-slate-500">
              {t.sectors.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Farmers / Agromet */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Sprout className="w-4 h-4" />
                  {t.sectors.agriculture}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Agromet
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {advisories.agriculture.irrigation_advice}
              </p>
              <div className="text-[11px] text-slate-600 mt-2">
                <span className="font-semibold text-slate-700">{t.sectors.spraying}:</span> {advisories.agriculture.spraying_window}
              </div>
            </div>
            <button
              onClick={() => onAskAi(currentLanguage.code === 'gu' ? `કપાસ અને મગફળીના પાક માટે આગામી 3 દિવસ માટે શું સલાહ છે? (${weather.city})` : `कृषि और फसलों के लिए आगामी मौसम सलाह क्या है? (${weather.city})`)}
              className="mt-3 w-full py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1 border border-emerald-200 transition-colors"
            >
              {t.nav.advisories} →
            </button>
          </div>

          {/* Fishermen / Marine */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <Anchor className="w-4 h-4" />
                  {t.sectors.marine}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Coastal
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {advisories.marine.sea_condition}
              </p>
              <div className="text-[11px] text-slate-600 mt-2">
                <span className="font-semibold text-slate-700">{t.sectors.waveHeight}:</span> {advisories.marine.wave_height_m}m
              </div>
            </div>
            <button
              onClick={() => onAskAi(currentLanguage.code === 'gu' ? `દરિયાઈ મોજા અને માછીમારો માટે સુરક્ષા શું છે?` : `मछुआरों के लिए समुद्र और हवा की स्थिति क्या है?`)}
              className="mt-3 w-full py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center gap-1 border border-blue-200 transition-colors"
            >
              {t.nav.advisories} →
            </button>
          </div>

          {/* Public Health */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-amber-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <HeartPulse className="w-4 h-4" />
                  {t.sectors.health}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                  Health
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {advisories.public_health.general_advice}
              </p>
              <div className="text-[11px] text-slate-600 mt-2">
                <span className="font-semibold text-slate-700">{t.sectors.heatStress}:</span> {advisories.public_health.heat_stress_index}
              </div>
            </div>
            <button
              onClick={() => onAskAi(currentLanguage.code === 'gu' ? `આજના હવામાનમાં સ્વાસ્થ્ય અને હીટવેવથી બચવા શું કરવું?` : `गर्मी और वायु गुणवत्ता से स्वास्थ्य सुरक्षा के उपाय क्या हैं?`)}
              className="mt-3 w-full py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center gap-1 border border-amber-200 transition-colors"
            >
              {t.nav.advisories} →
            </button>
          </div>

          {/* Disaster & Safety */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-rose-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertOctagon className="w-4 h-4" />
                  {t.sectors.disaster}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                  NDMA
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {alerts.length > 0 ? alerts[0].title : advisories.disaster_risk.vulnerability}
              </p>
              <div className="text-[11px] text-slate-600 mt-2">
                <span className="font-semibold text-slate-700">{t.nav.alerts}:</span> {alerts.length}
              </div>
            </div>
            <button
              onClick={onOpenAlerts}
              className="mt-3 w-full py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center justify-center gap-1 border border-rose-200 transition-colors"
            >
              {t.nav.alerts} →
            </button>
          </div>
        </div>
      </div>

      {/* Hourly Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          {t.metrics.hourlyForecast}
        </h3>
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex items-center gap-3 min-w-[720px]">
            {hourly.map((h, i) => (
              <div
                key={i}
                className="flex-1 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col items-center gap-2 text-center"
              >
                <span className="text-xs font-bold text-slate-700">{h.time}</span>
                <span className="text-base font-extrabold text-slate-900">{h.temperature}°</span>
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${h.rain_probability > 40 ? 'bg-blue-600' : 'bg-slate-400'}`}
                      style={{ width: `${h.rain_probability}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold">
                    {h.rain_probability}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 truncate max-w-[72px]">
                  {translateCondition(h.condition, currentLanguage.code)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Extended Forecast & NWP Multi-Model Convergence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 7-Day Forecast */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {t.metrics.dailyForecast}
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              High-Res ECMWF & GFS
            </span>
          </div>

          <div className="space-y-2.5">
            {daily.map((d, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100 border border-slate-200/70 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="w-24 shrink-0 font-bold text-slate-800">
                  {d.day_name}
                </div>

                <div className="flex-1 truncate text-slate-600 hidden sm:block">
                  {translateCondition(d.condition, currentLanguage.code)}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-blue-700 w-9 text-right">
                    {d.rain_probability}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-slate-500 font-medium">{d.temp_min}°</span>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-amber-500"
                      style={{ width: `${Math.min(100, Math.max(30, (d.temp_max - 20) * 4))}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-slate-900">{d.temp_max}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NWP Numerical Weather Prediction Comparison Matrix */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-purple-600" />
                {t.metrics.nwpModels}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold">
                GFS • ECMWF • NCMRWF
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mb-3">
              {nwp.consensus_summary}
            </p>

            <div className="space-y-2">
              {nwp.models.map((m, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{m.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{labels.rainProb}: {m.rainfall_mm_24h} mm ({m.rain_prob_24h}%)</span>
                      <span>•</span>
                      <span>{labels.wind}: {m.wind_speed_24h} km/h</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{m.temp_24h}°C</div>
                    <div className="text-[10px] font-semibold text-emerald-700">
                      {m.confidence}% Conf.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t.metrics.consensusTemp}</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {nwp.consensus_temperature}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
