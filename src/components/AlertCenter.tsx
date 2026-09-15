import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { WeatherAlert, IndianLanguage } from '../types';
import { getTranslations } from '../services/weatherTranslations';

interface AlertCenterProps {
  alerts: WeatherAlert[];
  currentLanguage: IndianLanguage;
  onAskAi: (prompt: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  currentLanguage,
  onAskAi
}) => {
  const t = getTranslations(currentLanguage.code);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const handleReadAloud = (alert: WeatherAlert) => {
    if ('speechSynthesis' in window) {
      if (playingAlertId === alert.id) {
        window.speechSynthesis.cancel();
        setPlayingAlertId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const textToSpeak = `${alert.severity} Alert. ${alert.title}. ${alert.description}. Instructions: ${alert.action_instructions.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = currentLanguage.tts_lang_code || 'hi-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setPlayingAlertId(null);
      utterance.onerror = () => setPlayingAlertId(null);

      setPlayingAlertId(alert.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Red':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Orange':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Yellow':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'Red':
        return 'border-l-4 border-l-rose-500';
      case 'Orange':
        return 'border-l-4 border-l-amber-500';
      case 'Yellow':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-emerald-500';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Center Banner in Modern Light Theme */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                WeatherNova Early Warning Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {t.nav.alerts} & Safety Protocols
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Common Alerting Protocol (CAP) notifications calibrated for regional safety mandates across India.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold">Filter:</span>
            {['all', 'Red', 'Orange', 'Yellow'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sev === 'all' ? 'All' : sev}
              </button>
            ))}
          </div>
        </div>

        {/* Official Protocol Demarcation Notice */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Official Protocol Compliance:</span> Official warnings are authenticated government meteorological advisories. Local tactical action plans are synthesized to assist citizen safety.
          </div>
        </div>
      </div>

      {/* Emergency Helpline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-extrabold text-sm shrink-0">
            1070
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">State Emergency</div>
            <div className="text-xs font-extrabold text-slate-900">Disaster Control</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-extrabold text-sm shrink-0">
            1077
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">District Emergency</div>
            <div className="text-xs font-extrabold text-slate-900">DEOC Helpline</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-extrabold text-sm shrink-0">
            112
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">National Emergency</div>
            <div className="text-xs font-extrabold text-slate-900">Police / Fire / EMS</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-extrabold text-sm shrink-0">
            1554
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Coast Guard</div>
            <div className="text-xs font-extrabold text-slate-900">Marine Rescue</div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${getSeverityBorder(alert.severity)}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity} • {alert.severity_label}
                </span>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  {alert.hazard_type}
                </span>

                <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {alert.location} ({alert.state})
                </span>
              </div>

              {/* Read Aloud Button */}
              <button
                onClick={() => handleReadAloud(alert)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  playingAlertId === alert.id
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="Voice Broadcast (TTS)"
              >
                {playingAlertId === alert.id ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>{t.actions.stopVoice}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.actions.listen} ({currentLanguage.native_name})</span>
                  </>
                )}
              </button>
            </div>

            {/* Alert Headline & Description */}
            <div className="my-4">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                {alert.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {alert.description}
              </p>
            </div>

            {/* Affected Districts */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-600 mb-1.5">
                Districts on High Vigilance:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {alert.districts_affected.map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Instructions (Actionable SOP) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Actionable Preparedness Guidelines:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {alert.action_instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer with Source & Ask AI */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 flex-wrap">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Valid: {new Date(alert.effective_from).toLocaleDateString()} to {new Date(alert.expires_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">Source: {alert.source}</span>
              </div>

              <button
                onClick={() =>
                  onAskAi(currentLanguage.code === 'gu' ? `${alert.location}માં ${alert.hazard_type} ચેતવણી માટે મારે કયા સલામતી પગલાં લેવા જોઈએ?` : `What safety precautions should I take for the ${alert.hazard_type} alert in ${alert.location}?`)
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask WeatherNova ({currentLanguage.native_name}) →</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
