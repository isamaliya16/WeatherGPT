import React, { useState } from 'react';
import {
  Sprout,
  Anchor,
  HeartPulse,
  AlertOctagon,
  Droplets,
  Wind,
  Sun,
  Shield,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SectorAdvisory, LocationPreset, WeatherData, IndianLanguage } from '../types';
import { getTranslations } from '../services/weatherTranslations';

interface SectorAdvisoryProps {
  currentLocation: LocationPreset;
  weather: WeatherData;
  advisories: SectorAdvisory;
  currentLanguage?: IndianLanguage;
  onAskAi: (prompt: string) => void;
}

export const SectorAdvisoryView: React.FC<SectorAdvisoryProps> = ({
  currentLocation,
  weather,
  advisories,
  currentLanguage,
  onAskAi
}) => {
  const langCode = currentLanguage?.code || 'en';
  const t = getTranslations(langCode);
  const [activeSector, setActiveSector] = useState<'agri' | 'marine' | 'health' | 'disaster'>('agri');

  return (
    <div className="space-y-6 pb-12">
      {/* Sector Header in Modern Light Theme */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t.nav.advisories}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-display">
            Domain Meteorological Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Grounded in Agromet (GKMS), Coastal Advisories, and NDMA Protocols for {currentLocation.city}, {currentLocation.state}.
          </p>
        </div>

        {/* Sector Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSector('agri')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSector === 'agri'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t.sectors.agriculture}</span>
          </button>

          <button
            onClick={() => setActiveSector('marine')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSector === 'marine'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Anchor className="w-4 h-4" />
            <span>{t.sectors.marine}</span>
          </button>

          <button
            onClick={() => setActiveSector('health')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSector === 'health'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>{t.sectors.health}</span>
          </button>

          <button
            onClick={() => setActiveSector('disaster')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeSector === 'disaster'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t.sectors.disaster}</span>
          </button>
        </div>
      </div>

      {/* Agriculture Panel */}
      {activeSector === 'agri' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                {t.sectors.irrigation}
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {advisories.agriculture.irrigation_advice}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <Wind className="w-4 h-4" />
                {t.sectors.spraying}
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {advisories.agriculture.spraying_window}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                {t.sectors.pestRisk}
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {advisories.agriculture.pest_risk}
              </p>
            </div>
          </div>

          {/* Localized Crops in the District */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Primary Regional Crops ({currentLocation.city}, {currentLocation.state})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specific phenological stage guidance tuned to current soil moisture and relative humidity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentLocation.primary_crops?.map((crop, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{crop}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      Kharif/Rabi
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {weather.rain_probability > 40
                      ? 'Ensure proper drainage channels in furrows to avoid root waterlogging.'
                      : 'Soil moisture adequate for active vegetative development. No irrigation needed today.'}
                  </p>
                  <button
                    onClick={() => onAskAi(langCode === 'gu' ? `મારે ${crop} ના પાકમાં ખાતર અને દવા છંટકાવ ક્યારે કરવો જોઈએ?` : `फसल ${crop} के लिए वर्तमान मौसम सलाह क्या है?`)}
                    className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 text-left flex items-center gap-1"
                  >
                    Consult {crop} advisory →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marine & Fisheries Panel */}
      {activeSector === 'marine' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                <Anchor className="w-4 h-4" />
                {t.sectors.seaCondition}
              </div>
              <div className="text-xl font-extrabold text-slate-900 mb-1">
                {advisories.marine.sea_condition}
              </div>
              <p className="text-xs text-slate-500">
                Ocean state simulation model for coastal waters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                <Wind className="w-4 h-4" />
                {t.sectors.waveHeight}
              </div>
              <div className="text-xl font-extrabold text-blue-700 mb-1">
                {advisories.marine.wave_height_range_m}
              </div>
              <p className="text-xs text-slate-500">
                Offshore wind: <span className="text-slate-800 font-semibold">{advisories.marine.wind_knots} knots</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Port Cautionary Signals
              </div>
              <div className="text-base font-extrabold text-amber-700 mb-1">
                LC-III (Local Cautionary)
              </div>
              <p className="text-xs text-slate-500">
                Squally weather squalls likely over adjoining sea areas.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">
              Official Coastal Fisherman Warning
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              {advisories.marine.coastal_advisory}
            </p>
            <button
              onClick={() => onAskAi(langCode === 'gu' ? `શું આજે દરિયામાં માછીમારી કરવા જઈ શકાય? હવામાન કેટલું અનુકૂળ છે?` : `क्या आज समुद्र में मछली पकड़ने जाना सुरक्षित है?`)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Check Deep Sea Fishing Safety Window
            </button>
          </div>
        </div>
      )}

      {/* Public Health & Heat Action Panel */}
      {activeSector === 'health' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                {t.sectors.heatStress}
              </div>
              <div className="text-xl font-extrabold text-slate-900 mb-1">
                Feels like {weather.feels_like}°C
              </div>
              <p className="text-xs text-slate-500">
                UV Radiation Index: <span className="text-amber-700 font-bold">{weather.uv_index}</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                Hydration & Exposure Guideline
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {advisories.public_health.hydration_guideline}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                Vulnerable Demographic Care
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {advisories.public_health.vulnerable_groups_care}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              Heat Action Plan Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Avoid direct sunlight exposure between 12:00 PM and 3:30 PM.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Consume ORS, traditional lassi, lemon water, or buttermilk regularly.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Provide shady spots and adequate clean water troughs for cattle and pets.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Wear light-colored, breathable cotton clothing and protect eyes and head.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disaster Management Panel */}
      {activeSector === 'disaster' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                Community Vulnerability Rating
              </div>
              <div className="text-xl font-extrabold text-slate-900 mb-2">
                Level: {advisories.disaster.vulnerability_index}
              </div>
              <p className="text-xs text-slate-600">
                Hydrological modeling based on catchment soil saturation and surface runoff.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Evacuation & Emergency Readiness
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {advisories.disaster.evacuation_readiness}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              NDMA Emergency Action Checklist
            </h3>
            <div className="space-y-2">
              {advisories.disaster.emergency_actions.map((act, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
