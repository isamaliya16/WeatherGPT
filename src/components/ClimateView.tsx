import React from 'react';
import {
  TrendingUp,
  CloudRain,
  Flame,
  Calendar,
  Sparkles,
  Thermometer,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HistoricalClimateData, LocationPreset, IndianLanguage } from '../types';
import { getTranslations } from '../services/weatherTranslations';

interface ClimateViewProps {
  currentLocation: LocationPreset;
  climateData: HistoricalClimateData;
  currentLanguage: IndianLanguage;
  onAskAi: (prompt: string) => void;
}

export const ClimateView: React.FC<ClimateViewProps> = ({
  currentLocation,
  climateData,
  currentLanguage,
  onAskAi
}) => {
  const t = getTranslations(currentLanguage.code);
  const avgRainfall = Math.round(
    climateData.annual_records.reduce((acc, r) => acc + r.annual_rainfall_mm, 0) /
      climateData.annual_records.length
  );
  const avgHeatwaveDays = Math.round(
    climateData.annual_records.reduce((acc, r) => acc + r.heatwave_days, 0) /
      climateData.annual_records.length
  );
  const totalExtremeRainDays = climateData.annual_records.reduce(
    (acc, r) => acc + r.extreme_rain_days,
    0
  );

  const getLocalizedClimateQuery = () => {
    switch (currentLanguage.code) {
      case 'gu':
        return `છેલ્લા 10 વર્ષમાં ${climateData.city}માં ચોમાસું અને ગરમી કેવી રીતે બદલાયા છે?`;
      case 'hi':
        return `पिछले 10 वर्षों में ${climateData.city} में मानसून और तापमान में क्या बदलाव आया है?`;
      case 'mr':
        return `गेल्या १० वर्षांत ${climateData.city} मध्ये पाऊस आणि तापमानात काय बदल झाला आहे?`;
      case 'kn':
        return `ಕಳೆದ 10 ವರ್ಷಗಳಲ್ಲಿ ${climateData.city} ನಲ್ಲಿ ಮಾನ್ಸೂನ್ ಮತ್ತು ತಾಪಮಾನ ಹೇಗೆ ಬದಲಾಗಿದೆ?`;
      case 'ml':
        return `കഴിഞ്ഞ 10 വർഷമായി ${climateData.city} ൽ കാലവർഷത്തിലും ചൂടിലും എന്ത് മാറ്റമാണുണ്ടായത്?`;
      case 'ta':
        return `கடந்த 10 ஆண்டுகளில் ${climateData.city} இல் பருவமழை மற்றும் வெப்பநிலை எவ்வாறு மாறியுள்ளது?`;
      case 'te':
        return `గత 10 ఏళ్లలో ${climateData.city} లో వర్షపాతం మరియు ఉష్ణోగ్రతల్లో వచ్చిన మార్పులేమిటి?`;
      case 'bn':
        return `গত ১০ বছরে ${climateData.city}-তে বর্ষা এবং তাপমাত্রায় কী কী পরিবর্তন এসেছে?`;
      default:
        return `How have rainfall patterns and temperatures changed over the last 10 years in ${climateData.city}?`;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Climate Header in Modern Light Theme */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t.nav.climate}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-display">
            10-Year Climate Trends & Meteorological Shifts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {climateData.period_years} observational climatology for {climateData.city}, {climateData.state}.
          </p>
        </div>

        <button
          onClick={() => onAskAi(getLocalizedClimateQuery())}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:shadow shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explain 10-Yr Trend in {currentLanguage.native_name}</span>
        </button>
      </div>

      {/* Key Anomaly KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
            <span>10-Yr Mean Rainfall</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {avgRainfall} mm
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Decadal mean pattern
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
            <span>Heatwave Frequency</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {avgHeatwaveDays} days/yr
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Days &gt;42°C in summer months
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
            <span>Extreme Rain Days</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            {totalExtremeRainDays} total
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Intense rain &gt;65 mm/day
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-bold flex items-center justify-between">
            <span>Monsoon Onset Shift</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-extrabold text-purple-700 mt-1">
            +4 to 7 Days
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {climateData.monsoon_onset_trend}
          </div>
        </div>
      </div>

      {/* Chart 1: 10-Year Annual Rainfall Trajectory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              Annual Precipitation Trajectory (2016–2025)
            </h3>
            <p className="text-xs text-slate-500">
              Bar: Total Annual Rainfall (mm) | Light Bar: Monsoon Contribution (mm)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={climateData.annual_records}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="mm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="annual_rainfall_mm" name="Annual Rainfall (mm)" fill="#0284c7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="monsoon_rainfall_mm" name="Monsoon Rainfall (mm)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Extreme Weather Events Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              Extreme Event Frequency Trend
            </h3>
            <p className="text-xs text-slate-500">
              Days with heavy rain (&gt;65mm) vs days with heatwave (&gt;42°C)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={climateData.annual_records}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="extreme_rain_days" name="Heavy Rain Days (>65mm)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="heatwave_days" name="Heatwave Days (>42°C)" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Evolution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              Average Summer Max Temperature (°C)
            </h3>
            <p className="text-xs text-slate-500">
              Evolution of peak summertime thermal highs
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={climateData.annual_records}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={['dataMin - 0.5', 'dataMax + 0.5']} fontSize={11} unit="°C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="avg_max_temp_c"
                  name="Avg Max Temp (°C)"
                  stroke="#e11d48"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#e11d48' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Climatology Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-emerald-600" />
            Monthly Normal vs Recorded Climatology
          </h3>
          <p className="text-xs text-slate-500">
            Comparing 30-year normal rainfall against recent year recordings
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={climateData.monthly_climatology}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="mm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="normal_rainfall_mm" name="Normal Rainfall (mm)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recorded_rainfall_mm" name="Recorded Rainfall (mm)" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decadal Climate Insight Narrative Box */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Climatological Synthesis for {climateData.city}
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          {climateData.climate_insight_en}
        </p>

        {climateData.climate_insight_native && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-sm text-emerald-950 font-medium leading-relaxed">
            {climateData.climate_insight_native}
          </div>
        )}
      </div>
    </div>
  );
};
