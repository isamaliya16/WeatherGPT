import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WeatherChat } from './components/WeatherChat';
import { Dashboard } from './components/Dashboard';
import { WeatherMap } from './components/WeatherMap';
import { AlertCenter } from './components/AlertCenter';
import { SectorAdvisoryView } from './components/SectorAdvisory';
import { ClimateView } from './components/ClimateView';
import { LocationPickerModal } from './components/LocationPickerModal';
import { LoginModal } from './components/LoginModal';
import { getLanguageByCode } from './data/indianLanguages';
import { INDIA_LOCATIONS } from './data/indiaLocations';
import {
  fetchLiveWeatherData,
  fetchForecastData,
  getActiveAlerts,
  getSectorAdvisories,
  getHistoricalClimate,
  queryHistoricalWeather
} from './services/weatherService';
import {
  LocationPreset,
  IndianLanguage,
  WeatherData,
  ForecastResponse,
  WeatherAlert,
  SectorAdvisory,
  HistoricalClimateData,
  ChatMessage,
  ConversationThread,
  UserProfile
} from './types';

const STORAGE_KEY_LANG = 'weathernova_selected_lang';
const STORAGE_KEY_AUTOSPEAK = 'weathernova_autospeak';
const STORAGE_KEY_USER = 'weathernova_current_user';

export default function App() {
  // 1. Language State (Persists user choice)
  const [currentLanguage, setCurrentLanguage] = useState<IndianLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) || localStorage.getItem('weathergpt_selected_lang');
    if (saved) {
      const found = getLanguageByCode(saved);
      if (found) return found;
    }
    return getLanguageByCode('en'); // Clean English default, instantly switchable to any Indic language
  });

  // 2. Optional User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 3. Location State (Defaults to Ahmedabad, dynamically searchable across all India)
  const [currentLocation, setCurrentLocation] = useState<LocationPreset>(INDIA_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);

  // Automatic live location detection (GPS with IP fallback)
  const detectUserCurrentLocation = useCallback(async () => {
    setLocationDetecting(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 4000,
              maximumAge: 60000
            });
          });

          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const loc = await res.json();
            setCurrentLocation(loc);
            setLocationDetecting(false);
            return;
          }
        } catch {
          // GPS denied or timed out; proceed to IP lookup
        }
      }

      // Fallback: Automatic IP-based location
      const ipRes = await fetch('/api/location/auto');
      if (ipRes.ok) {
        const ipLoc = await ipRes.json();
        setCurrentLocation(ipLoc);
      }
    } catch (err) {
      console.warn('Auto-location detection info:', err);
    } finally {
      setLocationDetecting(false);
    }
  }, []);

  // Detect location immediately when website opens
  useEffect(() => {
    detectUserCurrentLocation();
  }, [detectUserCurrentLocation]);

  // 4. Navigation & Layout State (Defaults to conversational 'chat' view)
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // 5. Voice Auto-Speak State
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return (localStorage.getItem(STORAGE_KEY_AUTOSPEAK) || localStorage.getItem('weathergpt_autospeak')) === 'true';
  });

  // 6. Conversation & Chat History State
  // Login is optional. If the user is logged in, restore their saved threads. If not logged in, keep temporary in-memory session.
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    try {
      if (currentUser) {
        const userKey = `weathernova_user_threads_${currentUser.email}`;
        const saved = localStorage.getItem(userKey);
        if (saved) return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 7. Meteorological Data Cache
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [advisories, setAdvisories] = useState<SectorAdvisory | null>(null);
  const [climateData, setClimateData] = useState<HistoricalClimateData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Save selected language to localStorage
  const handleSelectLanguage = (lang: IndianLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang.code);
  };

  // Toggle Auto-speak and persist
  const handleToggleAutoSpeak = () => {
    setAutoSpeak(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_AUTOSPEAK, String(next));
      return next;
    });
  };

  // User Login Handler
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      // Load user's saved threads or transfer active guest session
      const userKey = `weathernova_user_threads_${user.email}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
      } else if (threads.length > 0) {
        localStorage.setItem(userKey, JSON.stringify(threads));
      }
    } catch (e) {
      console.warn('Storage error on login:', e);
    }
  };

  // User Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
    // Reset conversation history to fresh guest state
    setThreads([]);
    setActiveThreadId(null);
    setMessages([]);
  };

  // Fetch Meteorological Data whenever location changes
  const loadLocationWeather = useCallback(async (loc: LocationPreset) => {
    setLoadingWeather(true);
    try {
      let w: WeatherData;
      let f: ForecastResponse;

      try {
        const queryParams = `city=${encodeURIComponent(loc.city)}&lat=${loc.latitude}&lon=${loc.longitude}&state=${encodeURIComponent(loc.state)}`;
        const resW = await fetch(`/api/weather/current?${queryParams}`);
        if (resW.ok) {
          w = await resW.json();
        } else {
          w = await fetchLiveWeatherData(loc);
        }

        const resF = await fetch(`/api/weather/forecast?${queryParams}`);
        if (resF.ok) {
          f = await resF.json();
        } else {
          f = await fetchForecastData(loc);
        }
      } catch {
        w = await fetchLiveWeatherData(loc);
        f = await fetchForecastData(loc);
      }

      const a = getActiveAlerts(loc, w);
      const adv = getSectorAdvisories(loc, w);
      const clim = getHistoricalClimate(loc.city, loc);

      setWeatherData(w);
      setForecastData(f);
      setAlerts(a);
      setAdvisories(adv);
      setClimateData(clim);
    } catch (err) {
      console.warn('Error loading location weather data:', err);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadLocationWeather(currentLocation);
  }, [currentLocation, loadLocationWeather]);

  // Handle New Chat (Resets to the clean WeatherNova front page)
  const handleNewChat = () => {
    setActiveThreadId(null);
    setMessages([]);
    setActiveTab('chat');
  };

  // Select an existing thread
  const handleSelectThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setActiveThreadId(thread.id);
      setMessages(thread.messages);
      if (thread.location) setCurrentLocation(thread.location);
      if (thread.language) setCurrentLanguage(thread.language);
      setActiveTab('chat');
    }
  };

  // Delete thread
  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = threads.filter(t => t.id !== threadId);
    setThreads(updated);
    if (currentUser) {
      try {
        localStorage.setItem(`weathernova_user_threads_${currentUser.email}`, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
    }

    if (activeThreadId === threadId) {
      handleNewChat();
    }
  };

  // Save current messages into active or new thread
  // Note: If user is NOT logged in, we keep threads in memory only and DO NOT persist to localStorage.
  // If user IS logged in, we permanently save records under their account key.
  const saveThread = (newMessages: ChatMessage[], firstQuery: string) => {
    let currentId = activeThreadId;
    let updatedThreads = [...threads];

    if (!currentId) {
      currentId = `thread-${Date.now()}`;
      setActiveThreadId(currentId);
      const newThread: ConversationThread = {
        id: currentId,
        title: firstQuery.length > 38 ? firstQuery.slice(0, 38) + '...' : firstQuery,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: newMessages,
        location: currentLocation,
        language: currentLanguage
      };
      updatedThreads = [newThread, ...updatedThreads];
    } else {
      updatedThreads = updatedThreads.map(t => {
        if (t.id === currentId) {
          return {
            ...t,
            messages: newMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
    }

    setThreads(updatedThreads);

    // Only permanently persist if user is logged in
    if (currentUser) {
      try {
        localStorage.setItem(
          `weathernova_user_threads_${currentUser.email}`,
          JSON.stringify(updatedThreads.slice(0, 50))
        );
      } catch (err) {
        console.warn('Storage save warning:', err);
      }
    }
  };

  // Handle Send Chat Message
  const handleSendMessage = async (text: string, options?: { isVoice?: boolean; voiceLang?: string }) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      is_voice: options?.isVoice
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          languageCode: currentLanguage.code,
          voiceLanguageCode: options?.voiceLang || (options?.isVoice ? currentLanguage.code : undefined),
          isVoice: options?.isVoice ?? false,
          location: currentLocation,
          locationId: currentLocation.id,
          conversationHistory: newHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Chat API server error');
      }

      const data = await response.json();

      // If backend resolved a different location from user prompt, sync it
      if (data.location && data.location.city !== currentLocation.city) {
        setCurrentLocation(data.location);
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toISOString(),
        language_code: data.languageCode || currentLanguage.code,
        is_voice: options?.isVoice,
        tool_invocations: data.tool_invocations,
        weather_snapshot: data.weather_snapshot,
        historical_snapshot: data.historical_snapshot,
        alerts: data.active_alerts
      };

      const finalMessages = [...newHistory, assistantMsg];
      setMessages(finalMessages);
      saveThread(finalMessages, text);
    } catch (err) {
      console.warn('Chat request failed, using client reasoning:', err);
      // Resilient fallback with active location and historical database check
      const histResult = queryHistoricalWeather(text, currentLocation.city);
      const isGu = currentLanguage.code === 'gu' || /[\u0A80-\u0AFF]/.test(text) || options?.voiceLang === 'gu';
      const isHi = currentLanguage.code === 'hi' || /[\u0900-\u097F]/.test(text) || options?.voiceLang === 'hi';

      let fallbackText = '';
      if (histResult.queryMatched && histResult.record) {
        if (isGu) {
          fallbackText = histResult.record.summary_gu;
        } else if (isHi) {
          fallbackText = histResult.record.summary_hi;
        } else {
          fallbackText = histResult.record.summary_en;
        }
      } else {
        const w = weatherData || (await fetchLiveWeatherData(currentLocation));
        const rainLikely = (w.rain_probability || 0) >= 40;

        if (isGu) {
          fallbackText = rainLikely
            ? `હા, ${currentLocation.city}માં વરસાદ પડવાની શક્યતા છે. બહાર નીકળતી વખતે સાવચેતી રાખવી.`
            : `ના, ${currentLocation.city}માં વરસાદની શક્યતા નથી. હવામાન મુખ્યત્વે ચોખ્ખું અને અનુકૂળ રહેશે.`;
        } else if (isHi) {
          fallbackText = rainLikely
            ? `हाँ, ${currentLocation.city} में बारिश होने की संभावना है। बाहर जाते समय छाता साथ रखें और सावधानी बरतें।`
            : `नहीं, ${currentLocation.city} में बारिश की संभावना नहीं है। मौसम मुख्य रूप से साफ और बाहर जाने के लिए अनुकूल रहेगा।`;
        } else {
          fallbackText = rainLikely
            ? `Yes, rain is likely in ${currentLocation.city}. Keep an umbrella handy and plan outdoor activities accordingly.`
            : `No, rain is not expected in ${currentLocation.city}. The weather will remain mostly clear and favorable.`;
        }
      }

      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toISOString(),
        language_code: isGu ? 'gu' : (isHi ? 'hi' : currentLanguage.code),
        is_voice: options?.isVoice,
        historical_snapshot: histResult.record || null,
        weather_snapshot: weatherData || undefined
      };

      const finalMessages = [...newHistory, fallbackMsg];
      setMessages(finalMessages);
      saveThread(finalMessages, text);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Ask AI from anywhere in the app
  const handleAskAi = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Left Navigation & Chat History Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLocation={currentLocation}
        onSelectLocation={loc => {
          setCurrentLocation(loc);
        }}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        activeAlerts={alerts}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={handleToggleAutoSpeak}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main App Container (adjusts smoothly between full-width when collapsed and offset when open) */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${isSidebarOpen ? 'lg:pl-80' : 'pl-0'}`}>
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          currentLocation={currentLocation}
          onOpenLocationPicker={() => setIsLocationModalOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          activeAlerts={alerts}
          onOpenAlerts={() => setActiveTab('alerts')}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={handleToggleAutoSpeak}
          onNewChat={handleNewChat}
          activeTab={activeTab}
          onDetectLocation={detectUserCurrentLocation}
          isDetectingLocation={locationDetecting}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Content Views */}
        <main className="flex-1 w-full flex flex-col">
          {activeTab === 'chat' && (
            <WeatherChat
              currentLanguage={currentLanguage}
              currentLocation={currentLocation}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onSelectLanguage={handleSelectLanguage}
              onOpenLocationPicker={() => setIsLocationModalOpen(true)}
              activeAlerts={alerts}
              autoSpeak={autoSpeak}
              onOpenAlerts={() => setActiveTab('alerts')}
              onOpenTab={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && weatherData && forecastData && advisories && (
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
              <Dashboard
                weather={weatherData}
                hourly={forecastData.hourly}
                daily={forecastData.daily}
                nowcast={forecastData.nowcast}
                extended_15d={forecastData.extended_15d}
                monsoon_outlook={forecastData.monsoon_outlook}
                nwp={forecastData.nwp}
                advisories={advisories}
                alerts={alerts}
                currentLanguage={currentLanguage}
                onAskAi={handleAskAi}
                onOpenAlerts={() => setActiveTab('alerts')}
                onOpenMap={() => setActiveTab('map')}
                onDetectLocation={detectUserCurrentLocation}
                isDetectingLocation={locationDetecting}
              />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
              <AlertCenter
                alerts={alerts}
                currentLanguage={currentLanguage}
                onAskAi={handleAskAi}
              />
            </div>
          )}

          {activeTab === 'advisories' && weatherData && advisories && (
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
              <SectorAdvisoryView
                currentLocation={currentLocation}
                weather={weatherData}
                advisories={advisories}
                currentLanguage={currentLanguage}
                onAskAi={handleAskAi}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
              <WeatherMap
                currentLocation={currentLocation}
                onSelectLocation={setCurrentLocation}
                alerts={alerts}
                onAskAi={handleAskAi}
                onDetectLocation={detectUserCurrentLocation}
                isDetectingLocation={locationDetecting}
              />
            </div>
          )}

          {activeTab === 'climate' && climateData && (
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
              <ClimateView
                currentLocation={currentLocation}
                climateData={climateData}
                currentLanguage={currentLanguage}
                onAskAi={handleAskAi}
              />
            </div>
          )}
        </main>
      </div>

      {/* Dynamic India Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={loc => {
          setCurrentLocation(loc);
        }}
      />

      {/* Optional User Login & History Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentLanguage={currentLanguage}
        savedThreadsCount={threads.length}
      />
    </div>
  );
}
