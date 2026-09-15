import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MapPin,
  Globe,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Check,
  Plus,
  Navigation,
  User,
  PanelLeft
} from 'lucide-react';
import { IndianLanguage, LocationPreset, WeatherAlert, UserProfile } from '../types';
import { INDIAN_LANGUAGES } from '../data/indianLanguages';
import { getTranslations } from '../services/weatherTranslations';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  currentLocation: LocationPreset;
  onOpenLocationPicker: () => void;
  currentLanguage: IndianLanguage;
  onSelectLanguage: (lang: IndianLanguage) => void;
  activeAlerts: WeatherAlert[];
  onOpenAlerts: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onNewChat: () => void;
  activeTab: string;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  currentLocation,
  onOpenLocationPicker,
  currentLanguage,
  onSelectLanguage,
  activeAlerts,
  onOpenAlerts,
  autoSpeak,
  onToggleAutoSpeak,
  onNewChat,
  onDetectLocation,
  isDetectingLocation,
  currentUser,
  onOpenLoginModal
}) => {
  const t = getTranslations(currentLanguage.code);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.native_name.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between transition-colors">
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2.5">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
          title={isSidebarOpen ? t.actions.collapseSidebar : t.actions.expandSidebar}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Brand indicator when sidebar is collapsed */}
        {!isSidebarOpen && (
          <div className="flex items-center gap-2 pr-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm font-display">WeatherNova</span>
          </div>
        )}

        {/* Quick New Chat Button in header */}
        <button
          onClick={onNewChat}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          title={t.actions.newChat}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.actions.newChat}</span>
        </button>
      </div>

      {/* Center: Clean Brand Name */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-900">WeatherNova</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dynamic Location Quick Button */}
        <div className="flex items-center">
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-all font-medium"
            title={t.actions.selectLocation}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="max-w-[100px] sm:max-w-[130px] truncate">{currentLocation.city}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="p-1.5 rounded-r-xl bg-slate-50 hover:bg-slate-100 border border-l-0 border-slate-200 text-slate-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
              title={isDetectingLocation ? t.actions.detectingLocation : t.actions.detectLocation}
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langDropdownRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 transition-all font-medium"
            title={t.actions.switchLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline truncate max-w-[80px]">
              {currentLanguage.native_name}
            </span>
            <span className="sm:hidden uppercase font-bold text-[11px]">
              {currentLanguage.code}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-72 flex flex-col animate-in fade-in duration-150">
              <div className="p-1 border-b border-slate-100 mb-1">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={langSearch}
                  onChange={e => setLangSearch(e.target.value)}
                  autoFocus
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="overflow-y-auto flex-1 space-y-0.5 divide-y divide-slate-50">
                {filteredLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      currentLanguage.code === lang.code
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      {lang.native_name} ({lang.name})
                    </span>
                    {currentLanguage.code === lang.code && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Alert Badge */}
        {activeAlerts.length > 0 && (
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
            title={`${activeAlerts.length} ${t.nav.alerts}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span className="hidden sm:inline">{activeAlerts.length} {t.nav.alerts}</span>
          </button>
        )}

        {/* Voice Auto-Speak Toggle */}
        <button
          onClick={onToggleAutoSpeak}
          className={`p-2 rounded-xl border transition-colors ${
            autoSpeak
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title={`${t.actions.autoSpeak}: ${autoSpeak ? 'ON' : 'OFF'}`}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* User Account / Optional Login Button */}
        {onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              currentUser
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={currentUser ? currentUser.email : t.actions.login}
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-2.5 h-2.5" />}
            </div>
            <span className="hidden sm:inline max-w-[80px] truncate">
              {currentUser ? currentUser.name : t.actions.login}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
