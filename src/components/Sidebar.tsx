import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  Sprout,
  MapPin,
  Globe,
  Radio,
  Trash2,
  Search,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Layers,
  Clock,
  User,
  PanelLeftClose,
  ChevronLeft
} from 'lucide-react';
import { IndianLanguage, LocationPreset, WeatherAlert, ConversationThread, UserProfile } from '../types';
import { INDIAN_LANGUAGES } from '../data/indianLanguages';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { getTranslations } from '../services/weatherTranslations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
  currentLanguage: IndianLanguage;
  onSelectLanguage: (lang: IndianLanguage) => void;
  threads: ConversationThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string, e: React.MouseEvent) => void;
  activeAlerts: WeatherAlert[];
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentLocation,
  onSelectLocation,
  currentLanguage,
  onSelectLanguage,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  activeAlerts,
  autoSpeak,
  onToggleAutoSpeak,
  currentUser,
  onOpenLoginModal
}) => {
  // Translations
  const t = getTranslations(currentLanguage.code);

  // Location Search State
  const [locSearch, setLocSearch] = useState('');
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [locResults, setLocResults] = useState<LocationPreset[]>([]);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const locDropdownRef = useRef<HTMLDivElement>(null);

  // Language Dropdown State
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setShowLocDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic Location search (debounced)
  useEffect(() => {
    if (!locSearch.trim()) {
      setLocResults(INDIA_LOCATIONS.slice(0, 10));
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const res = await fetch(`/api/locations/search?query=${encodeURIComponent(locSearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLocResults(data);
        }
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locSearch]);

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.native_name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const navItems = [
    {
      id: 'chat',
      label: t.nav.chat,
      subtitle: t.nav.chat_sub,
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      subtitle: t.nav.dashboard_sub,
      icon: <BarChart3 className="w-4 h-4 text-sky-600" />
    },
    {
      id: 'alerts',
      label: t.nav.alerts,
      subtitle: t.nav.alerts_sub,
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
      badge: activeAlerts.length > 0 ? `${activeAlerts.length} ${t.actions.active}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'advisories',
      label: t.nav.advisories,
      subtitle: t.nav.advisories_sub,
      icon: <Sprout className="w-4 h-4 text-emerald-700" />
    },
    {
      id: 'map',
      label: t.nav.map,
      subtitle: t.nav.map_sub,
      icon: <Layers className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'climate',
      label: t.nav.climate,
      subtitle: t.nav.climate_sub,
      icon: <Clock className="w-4 h-4 text-amber-600" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop (dim background on small screens) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs lg:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Main Sidebar Component - Completely Collapses smoothly on both Desktop & Mobile */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-76 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-250 ease-in-out shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header with Integrated Collapse Toggle Button */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-display">WeatherNova</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Weather Intelligence</p>
            </div>
          </div>

          {/* Integrated Sidebar Collapse Toggle Button */}
          <button
            id="sidebar-collapse-toggle-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-all flex items-center justify-center"
            title={t.actions.collapseSidebar}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Action Button */}
        <div className="p-3 border-b border-slate-100">
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>{t.actions.newChat}</span>
          </button>
        </div>

        {/* Dynamic Location Search in Sidebar */}
        <div className="p-3 border-b border-slate-100" ref={locDropdownRef}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{t.actions.selectLocation}</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
              {currentLocation.region_type}
            </span>
          </div>

          <div className="relative">
            <div
              onClick={() => setShowLocDropdown(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-slate-900 truncate">
                  {currentLocation.city}
                </span>
                <span className="text-slate-500 text-[11px] truncate">
                  ({currentLocation.state})
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Dynamic Location Dropdown */}
            {showLocDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-72 flex flex-col">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t.actions.searchLocationPlaceholder}
                    value={locSearch}
                    onChange={e => setLocSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="overflow-y-auto flex-1 space-y-1 divide-y divide-slate-50">
                  {isSearchingLoc ? (
                    <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>{t.actions.detectingLocation}...</span>
                    </div>
                  ) : locResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching locations found
                    </div>
                  ) : (
                    locResults.map(loc => {
                      const isSelected =
                        currentLocation.city.toLowerCase() === loc.city.toLowerCase() &&
                        currentLocation.state.toLowerCase() === loc.state.toLowerCase();
                      return (
                        <button
                          key={loc.id}
                          onClick={() => {
                            onSelectLocation(loc);
                            setShowLocDropdown(false);
                            setLocSearch('');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-slate-900">{loc.city}</span>
                            <span className="text-[11px] text-slate-500 ml-1">
                              • {loc.district || loc.state}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Middle Content: Navigation & Threads */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 divide-y divide-slate-100">
          {/* Main Navigation Modules */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-2 block mb-1">
              {t.nav.decision_intel}
            </span>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {item.icon}
                    </div>
                    <div className="text-left truncate">
                      <div className="truncate text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Conversation History List */}
          <div className="pt-3">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {t.actions.recentChats}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentUser ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    {threads.length} saved
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    {threads.length} ({t.actions.guest})
                  </span>
                )}
              </span>
            </div>

            {threads.length === 0 ? (
              <div className="px-2 py-4 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  {currentUser ? t.actions.noSavedChats : t.actions.noRecentChats}
                </p>
                {!currentUser && (
                  <button
                    onClick={onOpenLoginModal}
                    className="mt-2 text-[11px] text-emerald-700 hover:underline font-semibold"
                  >
                    {t.actions.loginToSaveHistory}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {threads.slice(0, 8).map(thread => {
                  const isActive = activeThreadId === thread.id && activeTab === 'chat';
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        onSelectThread(thread.id);
                        onSelectTab('chat');
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`group w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-emerald-50/80 text-emerald-900 font-medium border border-emerald-200/60'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-600" />
                        <span className="truncate text-left text-slate-800">{thread.title || 'Weather Query'}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteThread(thread.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded text-slate-400 transition-opacity"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Preferences, Account & Quick Settings */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          {/* Optional User Account & History status */}
          <div
            onClick={onOpenLoginModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser ? currentUser.name : t.actions.guest}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentUser ? t.auth.statusLoggedIn : t.actions.loginToSaveHistory}
                </div>
              </div>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentUser ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {currentUser ? t.actions.myAccount : t.actions.login}
            </span>
          </div>

          {/* Language Selector in Sidebar */}
          <div className="relative" ref={langDropdownRef}>
            <div
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate">{currentLanguage.native_name}</span>
                <span className="text-[11px] text-slate-500">({currentLanguage.name})</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </div>

            {showLangMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-60 flex flex-col">
                <div className="relative mb-2">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={langSearch}
                    onChange={e => setLangSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                        currentLanguage.code === lang.code
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.native_name} ({lang.name})</span>
                      {currentLanguage.code === lang.code && <Check className="w-3 h-3 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice Auto-Speak Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
              autoSpeak
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {autoSpeak ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-medium">{t.actions.autoSpeak}</span>
            </div>
            <span className="text-[10px] font-bold uppercase">{autoSpeak ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
