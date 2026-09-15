import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INDIAN_LANGUAGES, detectLanguageFromText, getLanguageByCode } from './src/data/indianLanguages';
import { INDIA_LOCATIONS, findLocationByQuery } from './src/data/indiaLocations';
import {
  fetchLiveWeatherData,
  fetchForecastData,
  getActiveAlerts,
  getSectorAdvisories,
  getHistoricalClimate
} from './src/services/weatherService';
import {
  getHistoricalRecord,
  queryHistoricalWeather,
  extractHistoricalDate,
  resolveCityFromText,
  HistoricalQueryResult,
  HistoricalWeatherRecord
} from './src/db/historicalWeatherDatabase';
import { retrieveRelevantKnowledge } from './src/services/ragKnowledge';

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize Gemini SDK lazily / safely
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WeatherNova - Meteorological Intelligence & Decision Support',
    gemini_connected: !!aiClient,
    timestamp: new Date().toISOString()
  });
});

// Languages metadata
app.get('/api/languages', (req, res) => {
  res.json(INDIAN_LANGUAGES);
});

// Locations directory
app.get('/api/locations', (req, res) => {
  res.json(INDIA_LOCATIONS);
});

// Dynamic Nationwide Geocoding Search (States, Districts, Cities, Towns, Villages)
app.get('/api/locations/search', async (req, res) => {
  try {
    const q = ((req.query.query as string) || '').trim();
    if (!q) {
      res.json(INDIA_LOCATIONS.slice(0, 15));
      return;
    }

    const matches: any[] = [];
    const lowerQ = q.toLowerCase();

    // 1. Search internal verified locations first
    const internalMatches = INDIA_LOCATIONS.filter(
      l =>
        l.city.toLowerCase().includes(lowerQ) ||
        l.state.toLowerCase().includes(lowerQ) ||
        l.district.toLowerCase().includes(lowerQ)
    );
    matches.push(...internalMatches);

    // 2. Query dynamic geocoding for any village, town, district or city in India
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        q
      )}&count=12&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const results = geoData.results || [];
        for (const item of results) {
          if (item.country_code === 'IN' || item.country === 'India') {
            const cityName = item.name;
            const stateName = item.admin1 || 'India';
            const districtName = item.admin2 || item.admin3 || cityName;

            // Avoid close duplicate
            const exists = matches.some(
              m =>
                Math.abs(m.latitude - item.latitude) < 0.05 &&
                Math.abs(m.longitude - item.longitude) < 0.05
            );

            if (!exists) {
              const isHilly =
                (item.elevation && item.elevation > 700) ||
                ['Himachal Pradesh', 'Jammu & Kashmir', 'Uttarakhand', 'Sikkim', 'Arunachal Pradesh', 'Ladakh'].includes(stateName);
              const isCoastal =
                ['Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal'].includes(stateName) &&
                item.elevation !== undefined && item.elevation < 50;

              matches.push({
                id: `geo-${item.id}`,
                city: cityName,
                state: stateName,
                district: districtName,
                latitude: item.latitude,
                longitude: item.longitude,
                region_type: isHilly ? 'Hilly / Flood Prone' : isCoastal ? 'Coastal / Fishery' : 'Agricultural Hub',
                primary_crops: isHilly
                  ? ['Apple', 'Stone Fruits', 'Tea']
                  : isCoastal
                  ? ['Paddy', 'Coconut', 'Marine Fishery']
                  : ['Cotton', 'Wheat', 'Pulses']
              });
            }
          }
        }
      }
    } catch (geoErr) {
      console.warn('Geocoding service note:', geoErr);
    }

    res.json(matches.slice(0, 15));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// Auto-detect user location via Client IP
app.get('/api/location/auto', async (req, res) => {
  try {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const clientIp = forwarded.split(',')[0].trim() || req.socket.remoteAddress || '';

    const isPrivateIp = !clientIp || clientIp.startsWith('127.') || clientIp.startsWith('10.') || clientIp.startsWith('172.') || clientIp.startsWith('192.') || clientIp === '::1';
    const geoUrl = !isPrivateIp
      ? `http://ip-api.com/json/${clientIp}`
      : 'http://ip-api.com/json/';

    const ipRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.status === 'success' && data.lat && data.lon) {
        const cityName = data.city || 'Current Location';
        const stateName = data.regionName || data.country || 'India';

        const matched = INDIA_LOCATIONS.find(
          l =>
            l.city.toLowerCase() === cityName.toLowerCase() ||
            (Math.abs(l.latitude - data.lat) < 0.3 && Math.abs(l.longitude - data.lon) < 0.3)
        );

        if (matched) {
          res.json({ ...matched, is_auto: true, is_gps: false });
          return;
        }

        res.json({
          id: `auto-${data.lat.toFixed(3)}-${data.lon.toFixed(3)}`,
          city: cityName,
          state: stateName,
          district: cityName,
          latitude: data.lat,
          longitude: data.lon,
          region_type: 'Live Detected Location',
          primary_crops: ['Cotton', 'Wheat', 'Paddy'],
          is_auto: true,
          is_gps: false
        });
        return;
      }
    }
    res.json({ ...INDIA_LOCATIONS[0], is_auto: true, is_gps: false });
  } catch {
    res.json({ ...INDIA_LOCATIONS[0], is_auto: true, is_gps: false });
  }
});

// Reverse Geocode exact GPS coordinates
app.get('/api/location/reverse', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ error: 'Valid lat and lon parameters required' });
      return;
    }

    // Match known internal locations within ~15km
    const near = INDIA_LOCATIONS.find(l => {
      const dLat = l.latitude - lat;
      const dLon = l.longitude - lon;
      return Math.sqrt(dLat * dLat + dLon * dLon) < 0.15;
    });
    if (near) {
      res.json({ ...near, latitude: lat, longitude: lon, is_auto: true, is_gps: true });
      return;
    }

    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'WeatherNova-Meteorological-Platform/1.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'Detected Area';
        const stateName = addr.state || addr.country || 'India';
        const districtName = addr.state_district || addr.county || cityName;

        res.json({
          id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
          city: cityName,
          state: stateName,
          district: districtName,
          latitude: lat,
          longitude: lon,
          region_type: 'Live GPS Location',
          primary_crops: ['Paddy', 'Wheat', 'Vegetables'],
          is_auto: true,
          is_gps: true
        });
        return;
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode note:', e);
    }

    res.json({
      id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      city: 'Current Location',
      state: 'India',
      district: 'Live Location',
      latitude: lat,
      longitude: lon,
      region_type: 'Live GPS Location',
      primary_crops: ['Regional Crops'],
      is_auto: true,
      is_gps: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Reverse geocode failed' });
  }
});

// Helper to resolve location from query params or preset
function resolveRequestLocation(query: any): typeof INDIA_LOCATIONS[0] {
  if (query.lat && query.lon) {
    const lat = parseFloat(query.lat);
    const lon = parseFloat(query.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      return {
        id: `loc-${lat.toFixed(3)}-${lon.toFixed(3)}`,
        city: query.city || 'Selected Location',
        state: query.state || 'India',
        district: query.district || query.city || 'District',
        latitude: lat,
        longitude: lon,
        region_type: 'Agricultural Hub',
        primary_crops: ['Cotton', 'Groundnut', 'Wheat']
      };
    }
  }
  const city = (query.city as string) || 'Ahmedabad';
  return findLocationByQuery(city);
}

// Current Weather
app.get('/api/weather/current', async (req, res) => {
  try {
    const loc = resolveRequestLocation(req.query);
    const weather = await fetchLiveWeatherData(loc);
    res.json(weather);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch weather' });
  }
});

// Weather Forecast & NWP Comparison
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const loc = resolveRequestLocation(req.query);
    const forecast = await fetchForecastData(loc);
    res.json(forecast);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch forecast' });
  }
});

// Disaster Alerts & CAP Warnings
app.get('/api/weather/alerts', async (req, res) => {
  try {
    const loc = resolveRequestLocation(req.query);
    const weather = await fetchLiveWeatherData(loc);
    const alerts = getActiveAlerts(loc, weather);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch alerts' });
  }
});

// Sector Decision Support Advisories
app.get('/api/advisories', async (req, res) => {
  try {
    const loc = resolveRequestLocation(req.query);
    const weather = await fetchLiveWeatherData(loc);
    const advisories = getSectorAdvisories(loc, weather);
    res.json(advisories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch advisories' });
  }
});

// Historical Climate 10-year trends
app.get('/api/climate', (req, res) => {
  try {
    const city = (req.query.city as string) || 'Ahmedabad';
    const climate = getHistoricalClimate(city);
    res.json(climate);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch climate' });
  }
});

// Comprehensive Historical Weather Database Endpoints
app.get('/api/weather/historical', (req, res) => {
  try {
    const city = (req.query.city as string) || 'Ahmedabad';
    const date = (req.query.date as string) || '2026-09-13';
    const record = getHistoricalRecord(city, date);
    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: `No historical record found for ${city} on ${date}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch historical record' });
  }
});

app.get('/api/weather/historical/query', (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const city = (req.query.city as string) || 'Ahmedabad';
    const result = queryHistoricalWeather(q, city);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query historical database' });
  }
});

// Condition translations for natural phrasing
const CONDITION_TRANSLATIONS: Record<string, { hi: string; gu: string; ta: string }> = {
  'Clear Sky': { hi: 'साफ आसमान और धूप', gu: 'ચોખ્ખું આકાશ અને તડકો', ta: 'தெளிவான வானம்' },
  'Clear Night': { hi: 'साफ रात', gu: 'ચોખ્ખી રાત', ta: 'தெளிவான இரவு' },
  'Partly Sunny': { hi: 'हल्के बादलों के साथ धूप', gu: 'આંશિક વાદળછાયું અને તડકો', ta: 'பகுதி வெயில்' },
  'Partly Cloudy': { hi: 'आंशिक रूप से बादलों से घिरा', gu: 'આંશિક વાદળછાયું', ta: 'பகுதி மேகமூட்டம்' },
  'Overcast': { hi: 'घने बादलों से ढका', gu: 'સંપૂર્ણ વાદળછાયું', ta: 'மேகமூட்டம்' },
  'Passing Thunderstorms': { hi: 'गरज-चमक के साथ बौछारें', gu: 'ગાજવીજ સાથે વરસાદી ઝાપટાં', ta: 'இடியுடன் கூடிய மழை' },
  'Heavy Rainfall with Squalls': { hi: 'तेज हवाओं के साथ भारी बारिश', gu: 'ભારે પવન સાથે ધોધમાર વરસાદ', ta: 'கனமழை' },
  'Light Drizzle': { hi: 'हल्की बूंदाबांदी', gu: 'હળવી ઝરમર', ta: 'லேசான தூறல்' },
  'Scattered Showers': { hi: 'रुक-रुक कर बौछारें', gu: 'છૂટાછવાયા વરસાદી ઝાપટાં', ta: 'சிதறிய மழை' }
};

function getLocalizedCondition(text: string, langCode: string): string {
  const match = CONDITION_TRANSLATIONS[text];
  if (match) {
    if (langCode === 'hi') return match.hi;
    if (langCode === 'gu') return match.gu;
    if (langCode === 'ta') return match.ta;
  }
  return text.toLowerCase();
}

// Helper: detect time horizon
export type TimeHorizon = 'historical' | 'current' | 'tomorrow' | 'forecast' | 'comparative';

function parseTimeHorizon(text: string): TimeHorizon {
  const lower = text.toLowerCase();

  const hasHistorical =
    /\b(yesterday|yday|was there|did it|past|history|historical|last week|last month|previously|earlier|recorded|happened|occurred|fell|rained)\b/i.test(lower) ||
    lower.includes('ગઈકાલે') || lower.includes('ગઇકાલે') || lower.includes('વરસાદ હતો') || lower.includes('હતો') || lower.includes('હતી') || lower.includes('હતા') ||
    lower.includes('બીતે કલ') || lower.includes('बीते कल') || lower.includes('था') || lower.includes('थी') || lower.includes('हुई थी') || lower.includes('हुआ था') ||
    lower.includes('झाला होता') || lower.includes('होता') || lower.includes('होती') ||
    /\b(\d{1,2}(st|nd|rd|th)?\s+(september|august|july|june|october|november|december|january|february|march|april|may))\b/i.test(lower) ||
    /\b((september|august|july|june|october|november|december|january|february|march|april|may)\s+\d{1,2})\b/i.test(lower) ||
    /\b(\d{1,2}\s*(સપ્ટેમ્બર|ઓગસ્ટ|જુલાઈ|જૂન|ઓક્ટોબર|નવેમ્બર|ડિસેમ્બર|જાન્યુઆરી|ફેબ્રુઆરી|માર્ચ|એપ્રિલ|મે))\b/i.test(lower) ||
    /\b(\d{1,2}\s*(सितंबर|सितम्बर|अगस्त|जुलाई|जून|अक्टूबर|नवंबर|दिसंबर|जनवरी|फरवरी|मार्च|अप्रैल|मई))\b/i.test(lower);

  const hasFuture =
    /\b(tomorrow|कल|काले|કાલે|આવતીકાલે|udya|naalai|repu|bhalike)\b/i.test(lower) &&
    !/\b(yesterday|બીતે|बीते|था|थी|હતો|હતી)\b/i.test(lower);

  const hasToday =
    /\b(today|now|current|આજે|હાલ|आज|सध्या|இன்று)\b/i.test(lower);

  if (hasHistorical && (hasFuture || hasToday)) {
    return 'comparative';
  }
  if (hasHistorical) {
    return 'historical';
  }
  if (hasFuture) {
    return 'tomorrow';
  }
  if (/\b(week|weekly|7 days|forecast|upcoming|next few days|हफ्ता|સાત દિવસ|આગામી)\b/i.test(lower)) {
    return 'forecast';
  }
  return 'current'; // Default: today / now / current
}

// Helper: detect weather aspect
function parseWeatherAspect(text: string): 'rain' | 'temp' | 'wind' | 'aqi' | 'humidity' | 'agri' | 'marine' | 'alert' | 'general' {
  const lower = text.toLowerCase();
  if (/\b(खेती|फसल|छिड़काव|खाद|सिंचाई|कीटनाशक|किसान|ખેતી|પાક|છંટકાવ|દવા|સિંચાઈ|ખાતર|ખેડૂત|crop|farm|farming|spray|spraying|fertilizer|irrigation|pesticide)\b/i.test(lower)) {
    return 'agri';
  }
  if (/\b(मछुआर|समुद्र|तट|नाव|દરિયો|માછીમાર|મોજા|marine|fishermen|sea|waves|boat|coastal)\b/i.test(lower)) {
    return 'marine';
  }
  if (/\b(alert|warning|cyclone|flood|storm|तूफान|चेतावनी|ચક્રવાત|ચેતવણી|આપત્તિ)\b/i.test(lower)) {
    return 'alert';
  }
  if (/\b(rain|raining|rainfall|rainy|drizzle|shower|umbrella|बारिश|बरसात|पानी|वर्षा|छाता|વરસાદ|વરસાદી|ઝરમર|છત્રી|મழை)\b/i.test(lower)) {
    return 'rain';
  }
  if (/\b(temp|temperature|heat|hot|cold|degree|celsius|तापमान|गर्मी|ताप|ठंड|તાપમાન|ગરમી|ઠંડી|વેப்பநிலை)\b/i.test(lower)) {
    return 'temp';
  }
  if (/\b(wind|windy|breeze|gust|speed|हवा की गति|पवन|हवा|પવન|વાવાઝોડું|કાળઝાળ)\b/i.test(lower)) {
    return 'wind';
  }
  if (/\b(aqi|air|pollution|smog|pm2|हवा की गुणवत्ता|प्रदूषण|હવાની ગુણવત્તા|વાયુ ગુણવત્તા)\b/i.test(lower)) {
    return 'aqi';
  }
  if (/\b(humidity|humid|moisture|muggy|नमी|ભેજ)\b/i.test(lower)) {
    return 'humidity';
  }
  return 'general';
}

// 100% Dynamic Context-Aware Meteorological Generator
function buildLocalReasonedResponse(
  userQuery: string,
  lang: typeof INDIAN_LANGUAGES[0],
  loc: typeof INDIA_LOCATIONS[0],
  weather: any,
  forecast: any,
  alerts: any[],
  advisories: any,
  _climate: any,
  historicalResult?: HistoricalQueryResult
): string {
  const time = parseTimeHorizon(userQuery);
  const aspect = parseWeatherAspect(userQuery);
  const histRec = historicalResult?.record;

  const currentTemp = Math.round(weather.temperature);
  const feelsLike = weather.feels_like;
  const currentRainProb = weather.rain_probability;
  const currentCond = getLocalizedCondition(weather.condition_text, lang.code);

  const tomorrowForecast = forecast?.daily?.[1] || {
    temp_max: weather.temp_max,
    temp_min: weather.temp_min,
    rain_probability: currentRainProb,
    condition: weather.condition_text
  };
  const tomorrowRainProb = tomorrowForecast.rain_probability;
  const tomorrowCond = getLocalizedCondition(tomorrowForecast.condition, lang.code);

  // --- GUJARATI ---
  if (lang.code === 'gu') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `હા, ${histRec.city}માં ${histRec.date_formatted}ના રોજ વરસાદ પડ્યો હતો. હવામાન વિભાગ (IMD) અનુસાર ${histRec.rainfall_mm} mm વરસાદ નોંધાયો હતો. મહત્તમ તાપમાન ${histRec.temp_max}°C અને લઘુત્તમ ${histRec.temp_min}°C રહ્યું હતું.`
          : `ના, ${histRec.city}માં ${histRec.date_formatted}ના રોજ વરસાદ નોંધાયો ન હતો (0.0 mm). વાતાવરણ મુખ્યત્વે સાફ અને સૂકું રહ્યું હતું (મહત્તમ તાપમાન ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city}માં ${histRec.date_formatted}ના રોજ મહત્તમ તાપમાન ${histRec.temp_max}°C અને લઘુત્તમ ${histRec.temp_min}°C (સરેરાશ ${histRec.temp_avg}°C) નોંધાયું હતું.`;
      }
      return histRec.summary_gu;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted}ના રોજ ${histRec.city}માં ${histRec.rainfall_mm} mm વરસાદ અને મહત્તમ ${histRec.temp_max}°C તાપમાન નોંધાયું હતું. સરખામણીમાં આજે તાપમાન ${currentTemp}°C છે અને વરસાદની શક્યતા ${currentRainProb}% છે.`;
    }

    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `વરસાદની શક્યતા હોવાથી હાલ સિંચાઈ મોકૂફ રાખવી અને પાકમાં જંતુનાશક દવાઓનો છંટકાવ ટાળવો.`
        : `હાલનું વાતાવરણ સામાન્ય સિંચાઈ અને ખેતીકામ માટે અનુકૂળ છે. પવન શાંત હોય ત્યારે જ છંટકાવ કરવો.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `દરિયામાં ઊંચા મોજા અને ભારે પવન હોવાથી માછીમારોને દરિયો ન ખેડવાની સલાહ છે.`
        : `દરિયાકાંઠે સ્થિતિ સામાન્ય છે. માછીમારો નિયમિત સાવચેતી સાથે કામગીરી કરી શકે છે.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} અને આસપાસના વિસ્તાર માટે IMD દ્વારા '${alerts[0].headline}' જાહેર કરવામાં આવેલ છે. સાવચેત રહેવું.`;
      }
      return `${loc.city} માટે હાલ કોઈ ગંભીર હવામાન ચેતવણી સક્રિય નથી. પરિસ્થિતિ સામાન્ય છે.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `હા, આવતીકાલે ${loc.city}માં વરસાદની શક્યતા ${tomorrowRainProb}% છે. બહાર નીકળતી વખતે છત્રી સાથે રાખવી.`
          : `ના, આવતીકાલે ${loc.city}માં વરસાદની શક્યતા ઓછી છે (${tomorrowRainProb}%). વાતાવરણ મુખ્યત્વે સાફ રહેશે.`;
      }
      return currentRainProb >= 40
        ? `હા, આજે ${loc.city}માં વરસાદની શક્યતા ${currentRainProb}% છે. સાવચેતી રાખવી.`
        : `ના, આજે ${loc.city}માં વરસાદની શક્યતા ઓછી છે (${currentRainProb}%).`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `આવતીકાલે ${loc.city}માં મહત્તમ તાપમાન આશરે ${tomorrowForecast.temp_max}°C અને લઘુત્તમ ${tomorrowForecast.temp_min}°C રહેવાની ધારણા છે.`;
      }
      return `${loc.city}માં હાલનું તાપમાન ${currentTemp}°C છે (અનુભવ: ${feelsLike}°C). દિવસ દરમિયાન મહત્તમ ${weather.temp_max}°C અને લઘુત્તમ ${weather.temp_min}°C રહેશે.`;
    }
    if (aspect === 'wind') {
      return `${loc.city}માં પવનની ગતિ ${weather.wind_speed_kmh} કિમી/કલાક (${weather.wind_direction_compass}) છે અને ઝાપટાં ${weather.wind_gust_kmh} કિમી/કલાક સુધી જઈ શકે છે.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city}માં વાયુ ગુણવત્તા સૂચકાંક (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) છે.`;
    }
    // General overview
    if (time === 'tomorrow') {
      return `આવતીકાલે ${loc.city}માં વાતાવરણ મુખ્યત્વે ${tomorrowCond} રહેશે (તાપમાન ${tomorrowForecast.temp_max}°/${tomorrowForecast.temp_min}°C, વરસાદની શક્યતા ${tomorrowRainProb}%).`;
    }
    return `${loc.city}માં આજે વાતાવરણ મુખ્યત્વે ${currentCond} છે, તાપમાન ${currentTemp}°C (અનુભવ ${feelsLike}°C) અને વરસાદની શક્યતા ${currentRainProb}% છે.`;
  }

  // --- HINDI ---
  if (lang.code === 'hi') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `हाँ, ${histRec.city} में ${histRec.date_formatted} को बारिश हुई थी। मौसम केंद्र (IMD) के अनुसार ${histRec.rainfall_mm} मिमी बारिश दर्ज की गई। अधिकतम तापमान ${histRec.temp_max}°C और न्यूनतम ${histRec.temp_min}°C रहा।`
          : `नहीं, ${histRec.city} में ${histRec.date_formatted} को कोई बारिश दर्ज नहीं हुई (0.0 मिमी)। मौसम मुख्य रूप से साफ और शुष्क रहा (अधिकतम तापमान ${histRec.temp_max}°C)।`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} में ${histRec.date_formatted} को अधिकतम तापमान ${histRec.temp_max}°C और न्यूनतम ${histRec.temp_min}°C (औसत ${histRec.temp_avg}°C) दर्ज हुआ था।`;
      }
      return histRec.summary_hi;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} को ${histRec.city} में ${histRec.rainfall_mm} मिमी बारिश और अधिकतम तापमान ${histRec.temp_max}°C दर्ज हुआ था। तुलना में आज तापमान ${currentTemp}°C है और बारिश की संभावना ${currentRainProb}% है।`;
    }

    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `आगामी बारिश की संभावना को देखते हुए सिंचाई स्थगित रखें और कीटनाशक छिड़काव से बचें।`
        : `वर्तमान मौसम सामान्य सिंचाई और कृषि कार्यों के लिए अनुकूल है। हवा शांत होने पर ही छिड़काव करें।`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `तटीय समुद्र में तेज लहरों के कारण मछुआरों को गहरे समुद्र में न जाने की सलाह दी जाती है।`
        : `तटीय समुद्र में स्थिति सामान्य है। मछुआरे आवश्यक सावधानी के साथ कार्य कर सकते हैं।`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} के लिए IMD की चेतावनी: '${alerts[0].headline}'। आवश्यक सावधानी बरतें।`;
      }
      return `${loc.city} के लिए वर्तमान में कोई गंभीर मौसम चेतावनी सक्रिय नहीं है।`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `हाँ, कल ${loc.city} में बारिश होने की संभावना है (${tomorrowRainProb}%)। बाहर जाते समय छाता साथ रखें।`
          : `नहीं, कल ${loc.city} में बारिश की संभावना कम है (${tomorrowRainProb}%)। मौसम मुख्य रूप से साफ रहेगा।`;
      }
      return currentRainProb >= 40
        ? `हाँ, आज ${loc.city} में बारिश की संभावना ${currentRainProb}% है। छाता साथ रखें।`
        : `नहीं, आज ${loc.city} में बारिश की संभावना केवल ${currentRainProb}% है। मौसम साफ रहेगा।`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `कल ${loc.city} में अधिकतम तापमान लगभग ${tomorrowForecast.temp_max}°C और न्यूनतम ${tomorrowForecast.temp_min}°C रहने का अनुमान है।`;
      }
      return `${loc.city} में वर्तमान तापमान ${currentTemp}°C है (महसूस: ${feelsLike}°C), अधिकतम ${weather.temp_max}°C और न्यूनतम ${weather.temp_min}°C दर्ज है।`;
    }
    if (aspect === 'wind') {
      return `${loc.city} में हवा की गति ${weather.wind_speed_kmh} किमी/घंटा (${weather.wind_direction_compass}) है और झोंके ${weather.wind_gust_kmh} किमी/घंटा तक हैं।`;
    }
    if (aspect === 'aqi') {
      return `${loc.city} में वायु गुणवत्ता (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) दर्ज है।`;
    }
    // General overview
    if (time === 'tomorrow') {
      return `कल ${loc.city} में मौसम मुख्य रूप से ${tomorrowCond} रहेगा, अधिकतम तापमान ${tomorrowForecast.temp_max}°C और बारिश की संभावना ${tomorrowRainProb}% है।`;
    }
    return `${loc.city} में आज मौसम मुख्य रूप से ${currentCond} बना हुआ है, तापमान ${currentTemp}°C (महसूस ${feelsLike}°C) और बारिश की संभावना ${currentRainProb}% है।`;
  }

  // --- MARATHI ---
  if (lang.code === 'mr') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `होय, ${histRec.city} मध्ये ${histRec.date_formatted} रोजी पाऊस झाला होता. हवामान विभागाच्या (IMD) नोंदीनुसार ${histRec.rainfall_mm} मिमी पाऊस पडला. कमाल तापमान ${histRec.temp_max}°C आणि किमान ${histRec.temp_min}°C होते.`
          : `नाही, ${histRec.city} मध्ये ${histRec.date_formatted} रोजी पाऊस झाला नाही (0.0 मिमी). हवामान प्रामुख्याने कोरडे राहिले (कमाल तापमान ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} मध्ये ${histRec.date_formatted} रोजी कमाल तापमान ${histRec.temp_max}°C आणि किमान ${histRec.temp_min}°C (सरासरी ${histRec.temp_avg}°C) नोंदवले गेले.`;
      }
      return histRec.summary_hi;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} रोजी ${histRec.city} मध्ये ${histRec.rainfall_mm} मिमी पाऊस आणि कमाल ${histRec.temp_max}°C तापमान होते. आज तुलना करता तापमान ${currentTemp}°C आहे आणि पावसाची शक्यता ${currentRainProb}% आहे.`;
    }

    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `पावसाची शक्यता असल्याने सध्या पिकांना पाणी देणे पुढे ढकलावे आणि कीटकनाशक फवारणी टाळावी.`
        : `सध्याचे हवामान पिकांना पाणी देण्यासाठी आणि शेतीकामासाठी अनुकूल आहे. वारा शांत असतानाच फवारणी करावी.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `समुद्रात उंच लाटा असल्याने मच्छीमारांनी खोल समुद्रात जाऊ नये असा इशारा देण्यात आला आहे.`
        : `किनारपट्टीवरील समुद्राची स्थिती सामान्य आहे. मच्छीमार नियमित काळजी घेऊन काम करू शकतात.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} आणि परिसरासाठी हवामान खात्याने '${alerts[0].headline}' इशारा जारी केला आहे. सावध राहा.`;
      }
      return `${loc.city} साठी सध्या कोणतीही गंभीर हवामान चेतावणी सक्रिय नाही. परिस्थिती सामान्य आहे.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `होय, उद्या ${loc.city} मध्ये पावसाची शक्यता ${tomorrowRainProb}% आहे. बाहेर पडताना छत्री सोबत ठेवा.`
          : `नाही, उद्या ${loc.city} मध्ये पावसाची शक्यता कमी आहे (${tomorrowRainProb}%). हवामान मुख्यत्वे कोरडे राहील.`;
      }
      return currentRainProb >= 40
        ? `होय, आज ${loc.city} मध्ये पावसाची शक्यता ${currentRainProb}% आहे. आवश्यक ती काळजी घ्या.`
        : `नाही, आज ${loc.city} मध्ये पावसाची शक्यता फक्त ${currentRainProb}% आहे. हवामान स्वच्छ राहील.`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `उद्या ${loc.city} मध्ये कमाल तापमान अंदाजे ${tomorrowForecast.temp_max}°C आणि किमान ${tomorrowForecast.temp_min}°C राहण्याचा अंदाज आहे.`;
      }
      return `${loc.city} मध्ये सध्याचे तापमान ${currentTemp}°C आहे (जाणवणारे तापमान: ${feelsLike}°C). दिवसभरात कमाल ${weather.temp_max}°C आणि किमान ${weather.temp_min}°C राहील.`;
    }
    if (aspect === 'wind') {
      return `${loc.city} मध्ये वाऱ्याचा वेग ${weather.wind_speed_kmh} किमी/तास (${weather.wind_direction_compass}) आहे आणि झोके ${weather.wind_gust_kmh} किमी/तास पर्यंत जाऊ शकतात.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city} मध्ये हवेचा गुणवत्ता निर्देशांक (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) आहे.`;
    }
    if (time === 'tomorrow') {
      return `उद्या ${loc.city} मध्ये हवामान मुख्यत्वे स्वच्छ राहील, कमाल तापमान ${tomorrowForecast.temp_max}°C आणि पावसाची शक्यता ${tomorrowRainProb}% आहे.`;
    }
    return `${loc.city} मध्ये आज तापमान ${currentTemp}°C (जाणवणारे ${feelsLike}°C) असून पावसाची शक्यता ${currentRainProb}% आहे.`;
  }

  // --- TAMIL ---
  if (lang.code === 'ta') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `ஆம், ${histRec.city} நகரில் ${histRec.date_formatted} அன்று மழை பெய்தது. இந்திய வானிலை மையம் (IMD) பதிவின்படி ${histRec.rainfall_mm} மிமீ மழை பதிவானது. அதிகபட்ச வெப்பநிலை ${histRec.temp_max}°C மற்றும் குறைந்தபட்சம் ${histRec.temp_min}°C ஆக இருந்தது.`
          : `இல்லை, ${histRec.city} நகரில் ${histRec.date_formatted} அன்று மழை பெய்யவில்லை (0.0 மிமீ). வானிலை பெரும்பாலும் வறண்டதாக இருந்தது (அதிகபட்ச வெப்பநிலை ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} நகரில் ${histRec.date_formatted} அன்று அதிகபட்ச வெப்பநிலை ${histRec.temp_max}°C மற்றும் குறைந்தபட்சம் ${histRec.temp_min}°C (சராசரி ${histRec.temp_avg}°C) பதிவானது.`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} அன்று ${histRec.city} நகரில் ${histRec.rainfall_mm} மிமீ மழையும், அதிகபட்சம் ${histRec.temp_max}°C வெப்பநிலையும் இருந்தது. இன்று வெப்பநிலை ${currentTemp}°C ஆக உள்ளது மற்றும் மழை வாய்ப்பு ${currentRainProb}% ஆகும்.`;
    }
    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `மழை பெய்ய வாய்ப்புள்ளதால் நீர்ப்பாசனத்தை ஒத்திவைக்கவும், பூச்சிக்கொல்லி தெளிப்பதைத் தவிர்க்கவும்.`
        : `தற்போதைய வானிலை பயிர்களுக்கு நீர் பாய்ச்சவும் விவசாய பணிகளுக்கும் சாதகமாக உள்ளது.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `கடலில் உயரமான அலைகள் உள்ளதால் மீனவர்கள் கடலுக்குச் செல்ல வேண்டாம் என எச்சரிக்கப்படுகிறார்கள்.`
        : `கடல் நிலை சீராக உள்ளது. மீனவர்கள் வழக்கமான முன்னெச்சரிக்கையுடன் செல்லலாம்.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} பகுதிக்கு IMD '${alerts[0].headline}' எச்சரிக்கை விடுத்துள்ளது. கவனமாக இருக்கவும்.`;
      }
      return `${loc.city} பகுதிக்கு தற்போது வானிலை எச்சரிக்கை ஏதுமில்லை. நிலைமை சீராக உள்ளது.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `ஆம், நாளை ${loc.city} நகரில் மழை பெய்ய வாய்ப்புள்ளது (${tomorrowRainProb}%). குடை எடுத்துச் செல்லவும்.`
          : `இல்லை, நாளை ${loc.city} நகரில் மழைக்கு வாய்ப்பு குறைவு (${tomorrowRainProb}%). வானிலை சீராக இருக்கும்.`;
      }
      return currentRainProb >= 40
        ? `ஆம், இன்று ${loc.city} நகரில் மழை பெய்ய வாய்ப்புள்ளது (${currentRainProb}%).`
        : `இல்லை, இன்று ${loc.city} நகரில் மழைக்கு வாய்ப்பு குறைவு (${currentRainProb}%).`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `நாளை ${loc.city} நகரில் அதிகபட்ச வெப்பநிலை ${tomorrowForecast.temp_max}°C ஆகவும் குறைந்தபட்சம் ${tomorrowForecast.temp_min}°C ஆகவும் இருக்கும்.`;
      }
      return `${loc.city} நகரில் தற்போதைய வெப்பநிலை ${currentTemp}°C (உணரப்படுவது: ${feelsLike}°C). அதிகபட்சம் ${weather.temp_max}°C, குறைந்தபட்சம் ${weather.temp_min}°C.`;
    }
    if (aspect === 'wind') {
      return `${loc.city} நகரில் காற்றின் வேகம் மணிக்கு ${weather.wind_speed_kmh} கி.மீ (${weather.wind_direction_compass}) ஆகும்.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city} நகரில் காற்றின் தரக் குறியீடு (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) ஆகும்.`;
    }
    if (time === 'tomorrow') {
      return `நாளை ${loc.city} நகரில் அதிகபட்ச வெப்பநிலை ${tomorrowForecast.temp_max}°C மற்றும் மழை வாய்ப்பு ${tomorrowRainProb}% ஆகும்.`;
    }
    return `${loc.city} நகரில் இன்றைய வெப்பநிலை ${currentTemp}°C மற்றும் மழைக்கான வாய்ப்பு ${currentRainProb}% ஆக உள்ளது.`;
  }

  // --- TELUGU ---
  if (lang.code === 'te') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `అవును, ${histRec.city}లో ${histRec.date_formatted}న వర్షం పడింది. భారత వాతావరణ శాఖ (IMD) రికార్డుల ప్రకారం ${histRec.rainfall_mm} మి.మీ వర్షపాతం నమోదైంది. గరిష్ట ఉష్ణోగ్రత ${histRec.temp_max}°C మరియు కనిష్ట ఉష్ణోగ్రత ${histRec.temp_min}°C గా ఉంది.`
          : `లేదు, ${histRec.city}లో ${histRec.date_formatted}న వర్షం పడలేదు (0.0 మి.మీ). వాతావరణం పొడిగా ఉంది (గరిష్ట ఉష్ణోగ్రత ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city}లో ${histRec.date_formatted}న గరిష్ట ఉష్ణోగ్రత ${histRec.temp_max}°C మరియు కనిష్ట ఉష్ణోగ్రత ${histRec.temp_min}°C నమోదైంది.`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted}న ${histRec.city}లో ${histRec.rainfall_mm} మి.మీ వర్షపాతం మరియు ${histRec.temp_max}°C ఉష్ణోగ్రత నమోదైంది. ఈరోజుతో పోలిస్తే ఉష్ణోగ్రత ${currentTemp}°C మరియు వర్షం అవకాశం ${currentRainProb}% గా ఉంది.`;
    }
    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `వర్ష సూచన ఉన్నందున సాగునీరు పెట్టడం వాయిదా వేయండి మరియు మందుల పిచికారీని నివారించండి.`
        : `ప్రస్తుత వాతావరణం పంటలకు నీరు పెట్టడానికి మరియు వ్యవసాయ పనులకు అనుకూలంగా ఉంది.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `సముద్రంలో అలల తీవ్రత ఎక్కువగా ఉన్నందున మత్స్యకారులు సముద్రంలోకి వెళ్లవద్దని హెచ్చరిక.`
        : `సముద్ర పరిస్థితి సాధారణంగా ఉంది. మత్స్యకారులు తగిన జాగ్రత్తలతో వేటకు వెళ్లవచ్చు.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} ప్రాంతానికి IMD '${alerts[0].headline}' హెచ్చరిక జారీ చేసింది. అప్రమత్తంగా ఉండండి.`;
      }
      return `${loc.city} ప్రాంతానికి ప్రస్తుతం ఎలాంటి తీవ్ర వాతావరణ హెచ్చరికలు లేవు.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `అవును, రేపు ${loc.city}లో వర్షం కురిసే అవకాశం ఉంది (${tomorrowRainProb}%). గొడుగు వెంట ఉంచుకోండి.`
          : `లేదు, రేపు ${loc.city}లో వర్షం కురిసే అవకాశం తక్కువ (${tomorrowRainProb}%). వాతావరణం పొడిగా ఉంటుంది.`;
      }
      return currentRainProb >= 40
        ? `అవును, ఈరోజు ${loc.city}లో వర్షం కురిసే అవకాశం ${currentRainProb}% ఉంది.`
        : `లేదు, ఈరోజు ${loc.city}లో వర్షం కురిసే అవకాశం తక్కువ (${currentRainProb}%).`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `రేపు ${loc.city}లో గరిష్ట ఉష్ణోగ్రత సుమారు ${tomorrowForecast.temp_max}°C మరియు కనిష్ట ఉష్ణోగ్రత ${tomorrowForecast.temp_min}°C ఉండే అవకాశం ఉంది.`;
      }
      return `${loc.city}లో ప్రస్తుత ఉష్ణోగ్రత ${currentTemp}°C (అనిపించే ఉష్ణోగ్రత: ${feelsLike}°C), గరిష్ట ${weather.temp_max}°C మరియు కనిష్ట ${weather.temp_min}°C.`;
    }
    if (aspect === 'wind') {
      return `${loc.city}లో గాలి వేగం గంటకు ${weather.wind_speed_kmh} కి.మీ (${weather.wind_direction_compass}) గా ఉంది.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city}లో గాలి నాణ్యత సూచిక (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) గా ఉంది.`;
    }
    if (time === 'tomorrow') {
      return `రేపు ${loc.city}లో ఉష్ణోగ్రత ${tomorrowForecast.temp_max}°C మరియు వర్షం అవకాశం ${tomorrowRainProb}% గా ఉంటుంది.`;
    }
    return `${loc.city}లో ఈరోజు ఉష్ణోగ్రత ${currentTemp}°C మరియు వర్షం అవకాశం ${currentRainProb}% గా ఉంది.`;
  }

  // --- KANNADA ---
  if (lang.code === 'kn') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `ಹೌದು, ${histRec.city} ನಲ್ಲಿ ${histRec.date_formatted} ರಂದು ಮಳೆಯಾಗಿತ್ತು. ಹವಾಮಾನ ಇಲಾಖೆ (IMD) ಪ್ರಕಾರ ${histRec.rainfall_mm} ಮಿಮೀ ಮಳೆ ದಾಖಲಾಗಿದೆ. ಗರಿಷ್ಠ ತಾಪಮಾನ ${histRec.temp_max}°C ಮತ್ತು ಕನಿಷ್ಠ ${histRec.temp_min}°C ಇತ್ತು.`
          : `ಇಲ್ಲ, ${histRec.city} ನಲ್ಲಿ ${histRec.date_formatted} ರಂದು ಮಳೆ ದಾಖಲಾಗಿಲ್ಲ (0.0 ಮಿಮೀ). ವಾತಾವರಣ ಒಣಗಿತ್ತು (ಗರಿಷ್ಠ ತಾಪಮಾನ ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} ನಲ್ಲಿ ${histRec.date_formatted} ರಂದು ಗರಿಷ್ಠ ತಾಪಮಾನ ${histRec.temp_max}°C ಮತ್ತು ಕನಿಷ್ಠ ${histRec.temp_min}°C (ಸರಾಸರಿ ${histRec.temp_avg}°C) ದಾಖಲಾಗಿತ್ತು.`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} ರಂದು ${histRec.city} ನಲ್ಲಿ ${histRec.rainfall_mm} ಮಿಮೀ ಮಳೆ ಮತ್ತು ${histRec.temp_max}°C ತಾಪಮಾನ ಇತ್ತು. ಇಂದಿನ ತಾಪಮಾನ ${currentTemp}°C ಆಗಿದ್ದು, ಮಳೆಯ ಸಾಧ್ಯತೆ ${currentRainProb}% ಆಗಿದೆ.`;
    }
    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `ಮಳೆಯ ಸಂಭವನೀಯತೆ ಇರುವುದರಿಂದ ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡಿ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ತಪ್ಪಿಸಿ.`
        : `ಪ್ರಸ್ತುತ ಹವಾಮಾನವು ಬೆಳೆಗಳಿಗೆ ನೀರುಣಿಸಲು ಮತ್ತು ಕೃಷಿ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ. ಗಾಳಿ ಶಾಂತವಾಗಿರುವಾಗ ಮಾತ್ರ ಸಿಂಪಡಣೆ ಮಾಡಿ.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `ಸಮುದ್ರದಲ್ಲಿ ಎತ್ತರದ ಅಲೆಗಳು ಇರುವುದರಿಂದ ಮೀನುಗಾರರು ಆಳ ಸಮುದ್ರಕ್ಕೆ ಇಳಿಯದಂತೆ ಸೂಚಿಸಲಾಗಿದೆ.`
        : `ಕರಾವಳಿ ಸಮುದ್ರದ ಸ್ಥಿತಿ ಸಾಧಾರಣವಾಗಿದೆ. ಮೀನುಗಾರರು ಸಾಮಾನ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಯೊಂದಿಗೆ ಕಾಯಕ ಮುಂದುವರಿಸಬಹುದು.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} ಪ್ರದೇಶಕ್ಕೆ ಹವಾಮಾನ ಇಲಾಖೆಯಿಂದ '${alerts[0].headline}' ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ. ಜಾಗರೂಕರಾಗಿರಿ.`;
      }
      return `${loc.city} ಗೆ ಪ್ರಸ್ತುತ ಯಾವುದೇ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ. ಪರಿಸ್ಥಿತಿ ಸಹಜವಾಗಿದೆ.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `ಹೌದು, ನಾಳೆ ${loc.city} ನಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ${tomorrowRainProb}% ಇದೆ. ಹೊರಗೆ ಹೋಗುವಾಗ ಛತ್ರಿ ಇಟ್ಟುಕೊಳ್ಳಿ.`
          : `ಇಲ್ಲ, ನಾಳೆ ${loc.city} ನಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಕಡಿಮೆ (${tomorrowRainProb}%). ಹವಾಮಾನ ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛವಾಗಿರುತ್ತದೆ.`;
      }
      return currentRainProb >= 40
        ? `ಹೌದು, ಇಂದು ${loc.city} ನಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಂಭವ ${currentRainProb}% ಇದೆ.`
        : `ಇಲ್ಲ, ಇಂದು ${loc.city} ನಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಕಡಿಮೆ (${currentRainProb}%).`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `ನಾಳೆ ${loc.city} ನಲ್ಲಿ ಗರಿಷ್ಠ ತಾಪಮಾನ ಸುಮಾರು ${tomorrowForecast.temp_max}°C ಮತ್ತು ಕನಿಷ್ಠ ${tomorrowForecast.temp_min}°C ಇರುವ ನಿರೀಕ್ಷೆಯಿದೆ.`;
      }
      return `${loc.city} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${currentTemp}°C ಆಗಿದೆ (ಅನುಭವ: ${feelsLike}°C). ಗರಿಷ್ಠ ${weather.temp_max}°C ಮತ್ತು ಕನಿಷ್ಠ ${weather.temp_min}°C ದಾಖಲಾಗಿದೆ.`;
    }
    if (aspect === 'wind') {
      return `${loc.city} ನಲ್ಲಿ ಗಾಳಿಯ ವೇಗ ${weather.wind_speed_kmh} ಕಿಮೀ/ಗಂಟೆ (${weather.wind_direction_compass}) ಆಗಿದೆ.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city} ನಲ್ಲಿ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) ಆಗಿದೆ.`;
    }
    if (time === 'tomorrow') {
      return `ನಾಳೆ ${loc.city} ನಲ್ಲಿ ತಾಪಮಾನ ${tomorrowForecast.temp_max}°C ಇರಲಿದ್ದು, ಮಳೆಯ ಸಾಧ್ಯತೆ ${tomorrowRainProb}% ಆಗಿದೆ.`;
    }
    return `${loc.city} ನಲ್ಲಿ ಇಂದು ತಾಪಮಾನ ${currentTemp}°C (ಅನುಭವ ${feelsLike}°C) ಮತ್ತು ಮಳೆಯ ಸಾಧ್ಯತೆ ${currentRainProb}% ಇದೆ.`;
  }

  // --- MALAYALAM ---
  if (lang.code === 'ml') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `അതെ, ${histRec.city} ൽ ${histRec.date_formatted} തീയതിയിൽ മഴ പെയ്തിരുന്നു. കാലാവസ്ഥാ വകുപ്പ് (IMD) പ്രകാരം ${histRec.rainfall_mm} മില്ലിമീറ്റർ മഴ രേഖപ്പെടുത്തി. പരമാവധി താപനില ${histRec.temp_max}°C ഉം കുറഞ്ഞ താപനില ${histRec.temp_min}°C ഉം ആയിരുന്നു.`
          : `ഇല്ല, ${histRec.city} ൽ ${histRec.date_formatted} തീയതിയിൽ മഴ രേഖപ്പെടുത്തിയിട്ടില്ല (0.0 mm). കാലാവസ്ഥ വരണ്ടതായിരുന്നു (പരമാവധി താപനില ${histRec.temp_max}°C).`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} ൽ ${histRec.date_formatted} തീയതിയിൽ പരമാവധി താപനില ${histRec.temp_max}°C ഉം കുറഞ്ഞ താപനില ${histRec.temp_min}°C ഉം രേഖപ്പെടുത്തിയിരുന്നു.`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} തീയതിയിൽ ${histRec.city} ൽ ${histRec.rainfall_mm} mm മഴയും ${histRec.temp_max}°C താപനിലയും ഉണ്ടായിരുന്നു. ഇന്നുമായി താരതമ്യം ചെയ്യുമ്പോൾ താപനില ${currentTemp}°C ഉം മഴ സാധ്യത ${currentRainProb}% ഉം ആണ്.`;
    }
    if (aspect === 'agri') {
      return currentRainProb >= 40 || tomorrowRainProb >= 40
        ? `മഴ സാധ്യതയുള്ളതിനാൽ നനയ്ക്കുന്നത് മാറ്റിവെക്കുക, കീടനാശിനി പ്രയോഗം ഒഴിവാക്കുക.`
        : `നിലവിലെ കാലാവസ്ഥ വിളകൾക്ക് നനയ്ക്കാനും കൃഷിപ്പണികൾക്കും അനുകൂലമാണ്. കാറ്റ് ശാന്തമാകുമ്പോൾ മാത്രം മരുന്ന് തളിക്കുക.`;
    }
    if (aspect === 'marine') {
      return advisories.marine.sea_condition === 'Rough'
        ? `കടലിൽ ഉയർന്ന തിരമാലകൾ ഉള്ളതിനാൽ മത്സ്യത്തൊഴിലാളികൾ കടലിൽ പോകരുതെന്ന് മുന്നറിയിപ്പുണ്ട്.`
        : `തീരദേശ കടൽ സ്ഥിതി ശാന്തമാണ്. മത്സ്യത്തൊഴിലാളികൾക്ക് മുൻകരുതലുകളോടെ കടലിൽ പോകാം.`;
    }
    if (aspect === 'alert') {
      if (alerts && alerts.length > 0) {
        return `${loc.city} മേഖലയിൽ കാലാവസ്ഥാ വകുപ്പ് '${alerts[0].headline}' മുന്നറിയിപ്പ് പുറപ്പെടുവിച്ചിട്ടുണ്ട്. ജാഗ്രത പാലിക്കുക.`;
      }
      return `${loc.city} മേഖലയിൽ നിലവിൽ വലിയ കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ ഒന്നുമില്ല.`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `അതെ, നാളെ ${loc.city} ൽ മഴയ്ക്ക് ${tomorrowRainProb}% സാധ്യതയുണ്ട്. പുറത്തിറങ്ങുമ്പോൾ കുട കരുതുക.`
          : `ഇല്ല, നാളെ ${loc.city} ൽ മഴ സാധ്യത കുറവാണ് (${tomorrowRainProb}%). കാലാവസ്ഥ വരണ്ടതായിരിക്കും.`;
      }
      return currentRainProb >= 40
        ? `അതെ, ഇന്ന് ${loc.city} ൽ മഴ പെയ്യാൻ ${currentRainProb}% സാധ്യതയുണ്ട്.`
        : `ഇല്ല, ഇന്ന് ${loc.city} ൽ മഴ സാധ്യത കുറവാണ് (${currentRainProb}%).`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `നാളെ ${loc.city} ൽ പരമാവധി താപനില ${tomorrowForecast.temp_max}°C ഉം കുറഞ്ഞ താപനില ${tomorrowForecast.temp_min}°C ഉം ആയിരിക്കും.`;
      }
      return `${loc.city} ൽ നിലവിലെ താപനില ${currentTemp}°C ആണ് (അനുഭവപ്പെടുന്നത്: ${feelsLike}°C).`;
    }
    if (aspect === 'wind') {
      return `${loc.city} ൽ കാറ്റിന്റെ വേഗത മണിക്കൂറിൽ ${weather.wind_speed_kmh} കി.മീ (${weather.wind_direction_compass}) ആണ്.`;
    }
    if (aspect === 'aqi') {
      return `${loc.city} ൽ വായു നിലവാര സൂചിക (AQI) ${weather.air_quality.aqi_in} (${weather.air_quality.category}) ആണ്.`;
    }
    if (time === 'tomorrow') {
      return `നാളെ ${loc.city} ൽ താപനില ${tomorrowForecast.temp_max}°C ഉം മഴ സാധ്യത ${tomorrowRainProb}% ഉം ആയിരിക്കും.`;
    }
    return `${loc.city} ൽ ഇന്ന് താപനില ${currentTemp}°C ഉം മഴ സാധ്യത ${currentRainProb}% ഉം ആണ്.`;
  }

  // --- BENGALI ---
  if (lang.code === 'bn' || lang.code === 'as') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `হ্যাঁ, ${histRec.city}-এ ${histRec.date_formatted} তারিখে বৃষ্টি হয়েছিল। আবহাওয়া দপ্তর (IMD) অনুসারে ${histRec.rainfall_mm} মিমি বৃষ্টিপাত রেকর্ড করা হয়েছে। সর্বোচ্চ তাপমাত্রা ছিল ${histRec.temp_max}°C এবং সর্বনিম্ন ${histRec.temp_min}°C।`
          : `না, ${histRec.city}-এ ${histRec.date_formatted} তারিখে কোনো বৃষ্টি রেকর্ড করা হয়নি (0.0 মিমি)। আবহাওয়া মূলত শুষ্ক ও পরিষ্কার ছিল (সর্বোচ্চ তাপমাত্রা ${histRec.temp_max}°C)।`;
      }
      if (aspect === 'temp') {
        return `${histRec.city}-এ ${histRec.date_formatted} তারিখে সর্বোচ্চ তাপমাত্রা ${histRec.temp_max}°C এবং সর্বনিম্ন ${histRec.temp_min}°C (গড় ${histRec.temp_avg}°C) রেকর্ড করা হয়েছিল।`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} তারিখে ${histRec.city}-এ ${histRec.rainfall_mm} মিমি বৃষ্টি এবং ${histRec.temp_max}°C তাপমাত্রা ছিল। আজকের তুলনায় তাপমাত্রা ${currentTemp}°C এবং বৃষ্টির সম্ভাবনা ${currentRainProb}%।`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `হ্যাঁ, আগামীকাল ${loc.city}-এ বৃষ্টির সম্ভাবনা রয়েছে (${tomorrowRainProb}%)। বাইরে বের হলে ছাতা সাথে রাখুন।`
          : `না, আগামীকাল ${loc.city}-এ বৃষ্টির সম্ভাবনা কম (${tomorrowRainProb}%)। আবহাওয়া মূলত পরিষ্কার থাকবে।`;
      }
      return currentRainProb >= 40
        ? `হ্যাঁ, আজ ${loc.city}-এ বৃষ্টির সম্ভাবনা ${currentRainProb}% রয়েছে।`
        : `না, আজ ${loc.city}-এ বৃষ্টির সম্ভাবনা কম (${currentRainProb}%)।`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `আগামীকাল ${loc.city}-এ সর্বোচ্চ তাপমাত্রা প্রায় ${tomorrowForecast.temp_max}°C এবং সর্বনিম্ন ${tomorrowForecast.temp_min}°C হতে পারে।`;
      }
      return `${loc.city}-এ বর্তমান তাপমাত্রা ${currentTemp}°C (অনুভূত: ${feelsLike}°C), সর্বোচ্চ ${weather.temp_max}°C ও সর্বনিম্ন ${weather.temp_min}°C।`;
    }
    if (time === 'tomorrow') {
      return `আগামীকাল ${loc.city}-এ তাপমাত্রা ${tomorrowForecast.temp_max}°C এবং বৃষ্টির সম্ভাবনা ${tomorrowRainProb}% থাকবে।`;
    }
    return `${loc.city}-এ আজ তাপমাত্রা ${currentTemp}°C এবং বৃষ্টির সম্ভাবনা ${currentRainProb}%।`;
  }

  // --- PUNJABI ---
  if (lang.code === 'pa') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `ਹਾਂ, ${histRec.city} ਵਿੱਚ ${histRec.date_formatted} ਨੂੰ ਮੀਂਹ ਪਿਆ ਸੀ। ਮੌਸਮ ਵਿਭਾਗ (IMD) ਅਨੁਸਾਰ ${histRec.rainfall_mm} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਦਰਜ ਕੀਤਾ ਗਿਆ ਸੀ। ਵੱਧ ਤੋਂ ਵੱਧ ਤਾਪਮਾਨ ${histRec.temp_max}°C ਅਤੇ ਘੱਟੋ-ਘੱਟ ${histRec.temp_min}°C ਰਿਹਾ।`
          : `ਨਹੀਂ, ${histRec.city} ਵਿੱਚ ${histRec.date_formatted} ਨੂੰ ਮੀਂਹ ਨਹੀਂ ਪਿਆ (0.0 ਮਿਲੀਮੀਟਰ)। ਮੌਸਮ ਮੁੱਖ ਤੌਰ 'ਤੇ ਸਾਫ਼ ਅਤੇ ਖੁਸ਼ਕ ਰਿਹਾ (ਵੱਧ ਤੋਂ ਵੱਧ ਤਾਪਮਾਨ ${histRec.temp_max}°C)।`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} ਵਿੱਚ ${histRec.date_formatted} ਨੂੰ ਵੱਧ ਤੋਂ ਵੱਧ ਤਾਪਮਾਨ ${histRec.temp_max}°C ਅਤੇ ਘੱਟੋ-ਘੱਟ ${histRec.temp_min}°C ਦਰਜ ਕੀਤਾ ਗਿਆ ਸੀ।`;
      }
      return histRec.summary_en;
    }
    if (time === 'comparative' && histRec) {
      return `${histRec.date_formatted} ਨੂੰ ${histRec.city} ਵਿੱਚ ${histRec.rainfall_mm} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਅਤੇ ${histRec.temp_max}°C ਤਾਪਮਾਨ ਸੀ। ਅੱਜ ਤਾਪਮਾਨ ${currentTemp}°C ਹੈ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${currentRainProb}% ਹੈ।`;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `ਹਾਂ, ਕੱਲ੍ਹ ${loc.city} ਵਿੱਚ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ (${tomorrowRainProb}%)। ਛਤਰੀ ਨਾਲ ਰੱਖੋ।`
          : `ਨਹੀਂ, ਕੱਲ੍ਹ ${loc.city} ਵਿੱਚ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਘੱਟ ਹੈ (${tomorrowRainProb}%)। ਮੌਸਮ ਸਾਫ਼ ਰਹੇਗਾ।`;
      }
      return currentRainProb >= 40
        ? `ਹਾਂ, ਅੱਜ ${loc.city} ਵਿੱਚ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ${currentRainProb}% ਹੈ।`
        : `ਨਹੀਂ, ਅੱਜ ${loc.city} ਵਿੱਚ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਘੱਟ ਹੈ (${currentRainProb}%)।`;
    }
    if (aspect === 'temp') {
      if (time === 'tomorrow') {
        return `ਕੱਲ੍ਹ ${loc.city} ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ਤਾਪਮਾਨ ਲਗਭਗ ${tomorrowForecast.temp_max}°C ਅਤੇ ਘੱਟੋ-ਘੱਟ ${tomorrowForecast.temp_min}°C ਰਹਿਣ ਦਾ ਅਨੁਮਾਨ ਹੈ।`;
      }
      return `${loc.city} ਵਿੱਚ ਮੌਜੂਦਾ ਤਾਪਮਾਨ ${currentTemp}°C ਹੈ (ਮਹਿਸੂਸ: ${feelsLike}°C), ਵੱਧ ਤੋਂ ਵੱਧ ${weather.temp_max}°C ਅਤੇ ਘੱਟੋ-ਘੱਟ ${weather.temp_min}°C ਹੈ।`;
    }
    if (time === 'tomorrow') {
      return `ਕੱਲ੍ਹ ${loc.city} ਵਿੱਚ ਤਾਪਮਾਨ ${tomorrowForecast.temp_max}°C ਰਹੇਗਾ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${tomorrowRainProb}% ਹੈ।`;
    }
    return `${loc.city} ਵਿੱਚ ਅੱਜ ਤਾਪਮਾਨ ${currentTemp}°C ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${currentRainProb}% ਹੈ।`;
  }

  // --- ODIA ---
  if (lang.code === 'or') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `ହଁ, ${histRec.city}ରେ ${histRec.date_formatted}ରେ ବର୍ଷା ହୋଇଥିଲା। ପାଣିପାଗ ବିଭାଗ (IMD) ଅନୁସାରେ ${histRec.rainfall_mm} ମିଲିମିଟର ବର୍ଷା ରେକର୍ଡ କରାଯାଇଛି। ସର୍ବୋଚ୍ଚ ତାପମାତ୍ରା ${histRec.temp_max}°C ଏବଂ ସର୍ବନିମ୍ନ ${histRec.temp_min}°C ଥିଲା।`
          : `ନାହିଁ, ${histRec.city}ରେ ${histRec.date_formatted}ରେ କୌଣସି ବର୍ଷା ରେକର୍ଡ ହୋଇନାହିଁ (0.0 mm)। ପାଣିପାଗ ମୁଖ୍ୟତଃ ଶୁଖିଲା ଥିଲା (ସର୍ବୋଚ୍ଚ ତାପମାତ୍ରା ${histRec.temp_max}°C)।`;
      }
      if (aspect === 'temp') {
        return `${histRec.city}ରେ ${histRec.date_formatted}ରେ ସର୍ବୋଚ୍ଚ ତାପମାତ୍ରା ${histRec.temp_max}°C ଏବଂ ସର୍ବନିମ୍ନ ${histRec.temp_min}°C ଥିଲା।`;
      }
      return histRec.summary_en;
    }
    if (aspect === 'rain') {
      return currentRainProb >= 40
        ? `ହଁ, ଆଜି ${loc.city}ରେ ବର୍ଷା ହେବାର ସମ୍ଭାବନା ${currentRainProb}% ଅଛି।`
        : `ନାହିଁ, ଆଜି ${loc.city}ରେ ବର୍ଷା ହେବାର ସମ୍ଭାବନା କମ୍ (${currentRainProb}%)।`;
    }
    return `${loc.city}ରେ ଆଜି ତାପମାତ୍ରା ${currentTemp}°C ଏବଂ ବର୍ଷା ସମ୍ଭାବନା ${currentRainProb}%।`;
  }

  // --- URDU ---
  if (lang.code === 'ur') {
    if (time === 'historical' && histRec) {
      if (aspect === 'rain') {
        return histRec.rain_occurred
          ? `ہاں، ${histRec.city} میں ${histRec.date_formatted} کو بارش ہوئی تھی۔ محکمہ موسمیات (IMD) کے مطابق ${histRec.rainfall_mm} ملی میٹر بارش ریکارڈ کی گئی۔ زیادہ سے زیادہ درجہ حرارت ${histRec.temp_max}°C اور کم سے کم ${histRec.temp_min}°C رہا۔`
          : `نہیں، ${histRec.city} میں ${histRec.date_formatted} کو کوئی بارش درج نہیں ہوئی (0.0 ملی میٹر)۔ موسم بنیادی طور پر خشک اور صاف رہا (زیادہ سے زیادہ درجہ حرارت ${histRec.temp_max}°C)۔`;
      }
      if (aspect === 'temp') {
        return `${histRec.city} میں ${histRec.date_formatted} کو زیادہ سے زیادہ درجہ حرارت ${histRec.temp_max}°C اور کم سے کم ${histRec.temp_min}°C ریکارڈ کیا گیا تھا۔`;
      }
      return histRec.summary_en;
    }
    if (aspect === 'rain') {
      if (time === 'tomorrow') {
        return tomorrowRainProb >= 40
          ? `ہاں، کل ${loc.city} میں بارش کا امکان ہے (${tomorrowRainProb}%)۔ چھتری ساتھ رکھیں۔`
          : `نہیں، کل ${loc.city} میں بارش کا امکان کم ہے (${tomorrowRainProb}%)۔ موسم صاف رہے گا۔`;
      }
      return currentRainProb >= 40
        ? `ہاں، آج ${loc.city} میں بارش کا امکان ${currentRainProb}% ہے۔`
        : `نہیں، آج ${loc.city} میں بارش کا امکان کم ہے (${currentRainProb}%)۔`;
    }
    return `${loc.city} میں آج درجہ حرارت ${currentTemp}°C اور بارش کا امکان ${currentRainProb}% ہے۔`;
  }

  // --- ENGLISH & DEFAULT ---
  if (time === 'historical' && histRec) {
    if (aspect === 'rain') {
      return histRec.rain_occurred
        ? `Yes, there was rain in ${histRec.city} on ${histRec.date_formatted}. The IMD meteorological station recorded ${histRec.rainfall_mm} mm of rainfall with conditions described as ${histRec.condition_text.toLowerCase()}. Daytime maximum temperature was ${histRec.temp_max}°C and night minimum was ${histRec.temp_min}°C.`
        : `No, there was no rain in ${histRec.city} on ${histRec.date_formatted} (0.0 mm recorded). The weather remained predominantly dry and clear with a daytime maximum of ${histRec.temp_max}°C.`;
    }
    if (aspect === 'temp') {
      return `On ${histRec.date_formatted}, ${histRec.city} recorded a maximum temperature of ${histRec.temp_max}°C and a minimum of ${histRec.temp_min}°C (mean ${histRec.temp_avg}°C).`;
    }
    return histRec.summary_en;
  }
  if (time === 'comparative' && histRec) {
    return `On ${histRec.date_formatted}, ${histRec.city} recorded ${histRec.rainfall_mm} mm of rainfall and a maximum temperature of ${histRec.temp_max}°C. In comparison, today's temperature is ${currentTemp}°C with a ${currentRainProb}% rain probability.`;
  }

  if (aspect === 'agri') {
    return currentRainProb >= 40 || tomorrowRainProb >= 40
      ? `Postpone irrigation as expected rainfall will provide adequate moisture. Avoid chemical spraying during rain or windy periods.`
      : `Weather conditions are favorable for scheduled irrigation and field activities. Apply spray treatments when wind is calm.`;
  }
  if (aspect === 'marine') {
    return advisories.marine.sea_condition === 'Rough'
      ? `Sea conditions are rough along coastal areas. Fishermen are advised not to venture into open waters.`
      : `Sea conditions are moderate and stable. Coastal fishing operations may proceed with regular vigilance.`;
  }
  if (aspect === 'alert') {
    if (alerts && alerts.length > 0) {
      return `Active alert for ${loc.city}: ${alerts[0].headline}. Severity: ${alerts[0].severity}. Stay updated with civil advisories.`;
    }
    return `There are currently no severe meteorological alerts active for ${loc.city}.`;
  }
  if (aspect === 'rain') {
    if (time === 'tomorrow') {
      return tomorrowRainProb >= 40
        ? `Yes, rain is likely in ${loc.city} tomorrow (${tomorrowRainProb}% probability). Keep an umbrella handy if stepping out.`
        : `No, rain is not expected in ${loc.city} tomorrow (${tomorrowRainProb}% probability). Conditions will stay mostly clear.`;
    }
    return currentRainProb >= 40
      ? `Yes, there is an elevated chance of rain in ${loc.city} today (${currentRainProb}%). Keep an umbrella with you.`
      : `No, rain is unlikely in ${loc.city} today (${currentRainProb}% probability). The weather is expected to remain mostly dry.`;
  }
  if (aspect === 'temp') {
    if (time === 'tomorrow') {
      return `Tomorrow in ${loc.city}, the expected high is ${tomorrowForecast.temp_max}°C and the low is ${tomorrowForecast.temp_min}°C.`;
    }
    return `The current temperature in ${loc.city} is ${currentTemp}°C (feels like ${feelsLike}°C), with a daytime high of ${weather.temp_max}°C and low of ${weather.temp_min}°C.`;
  }
  if (aspect === 'wind') {
    return `Surface wind in ${loc.city} is blowing at ${weather.wind_speed_kmh} km/h from the ${weather.wind_direction_compass}, with gusts reaching up to ${weather.wind_gust_kmh} km/h.`;
  }
  if (aspect === 'aqi') {
    return `The Air Quality Index in ${loc.city} is currently ${weather.air_quality.aqi_in} (${weather.air_quality.category}), with PM2.5 at ${weather.air_quality.pm2_5} µg/m³.`;
  }
  if (aspect === 'humidity') {
    return `Relative humidity in ${loc.city} is currently ${weather.humidity}%, with barometric pressure at ${weather.pressure_hpa} hPa.`;
  }
  // General overview
  if (time === 'tomorrow') {
    return `Tomorrow in ${loc.city}, expect ${tomorrowCond} conditions with a high of ${tomorrowForecast.temp_max}°C and a ${tomorrowRainProb}% probability of rain.`;
  }
  return `In ${loc.city} today, the weather is ${currentCond} with a temperature of ${currentTemp}°C (feels like ${feelsLike}°C) and a ${currentRainProb}% chance of rain.`;
}

// Helper to detect explicit user instructions requesting a specific language
function checkExplicitLanguageRequest(text: string): typeof INDIAN_LANGUAGES[0] | null {
  const lower = text.toLowerCase();
  if (
    /\b(in english|into english|translate to english|to english|in angrezi|english me|english ma|અંગ્રેજીમાં|अंग्रेजी में|इंग्रजीत)\b/i.test(lower) ||
    /અંગ્રેજીમાં|अंग्रेजी में|इंग्रजीत/.test(text)
  ) {
    return getLanguageByCode('en');
  }
  if (
    /\b(in gujarati|into gujarati|translate to gujarati|to gujarati|gujarati ma|gujarati me)\b/i.test(lower) ||
    /ગુજરાતીમાં|गुजराती में/.test(text)
  ) {
    return getLanguageByCode('gu');
  }
  if (
    /\b(in hindi|into hindi|translate to hindi|to hindi|hindi me|hindi ma)\b/i.test(lower) ||
    /હિન્દીમાં|हिंदी में/.test(text)
  ) {
    return getLanguageByCode('hi');
  }
  if (
    /\b(in marathi|into marathi|translate to marathi|marathi me|marathit)\b/i.test(lower) ||
    /मराठीत|मराठी में/.test(text)
  ) {
    return getLanguageByCode('mr');
  }
  if (
    /\b(in tamil|into tamil|translate to tamil)\b/i.test(lower) ||
    /தமிழில்/.test(text)
  ) {
    return getLanguageByCode('ta');
  }
  if (
    /\b(in telugu|into telugu|translate to telugu)\b/i.test(lower) ||
    /తెలుగులో/.test(text)
  ) {
    return getLanguageByCode('te');
  }
  if (
    /\b(in kannada|into kannada|translate to kannada)\b/i.test(lower) ||
    /ಕನ್ನಡದಲ್ಲಿ/.test(text)
  ) {
    return getLanguageByCode('kn');
  }
  if (
    /\b(in malayalam|into malayalam|translate to malayalam)\b/i.test(lower) ||
    /മലയാളത്തിൽ/.test(text)
  ) {
    return getLanguageByCode('ml');
  }
  if (
    /\b(in bengali|into bengali|translate to bengali)\b/i.test(lower) ||
    /বাংলায়/.test(text)
  ) {
    return getLanguageByCode('bn');
  }
  if (
    /\b(in punjabi|into punjabi|translate to punjabi)\b/i.test(lower) ||
    /ਪੰਜਾਬੀ ਵਿੱਚ/.test(text)
  ) {
    return getLanguageByCode('pa');
  }
  if (
    /\b(in odia|into odia|translate to odia)\b/i.test(lower) ||
    /ଓଡ଼ିଆରେ/.test(text)
  ) {
    return getLanguageByCode('or');
  }
  if (
    /\b(in urdu|into urdu|translate to urdu)\b/i.test(lower) ||
    /اردو میں/.test(text)
  ) {
    return getLanguageByCode('ur');
  }
  return null;
}

// Conversational AI Weather Agent Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      languageCode,
      voiceLanguageCode,
      isVoice,
      locationId,
      location: clientLoc,
      conversationHistory
    } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message parameter is required' });
      return;
    }

    // 1. Language Detection & Strict Voice/Text Language Consistency
    // Voice Query → Voice Answer: detect query language and return answer in same language.
    // Text Query → Text Answer: return answer in the query's language (no unnecessary translation to/from English).
    let detectedLang: typeof INDIAN_LANGUAGES[0];

    const explicitLang = checkExplicitLanguageRequest(message);

    if (explicitLang) {
      detectedLang = explicitLang;
    } else if (/[\u0A80-\u0AFF]/.test(message)) {
      // Gujarati script explicitly in text
      detectedLang = getLanguageByCode('gu');
    } else if (/[\u0900-\u097F]/.test(message)) {
      // Devanagari script: check for Marathi markers
      if (/\b(आहे|होता|होती|झाला|नाही|काय|कसे|उद्या|काल|कधी|पाऊस|रोजी|सप्टेंबर|ऑगस्ट|जुलै|जून|मे|एप्रिल|मार्च|फेब्रुवारी|जानेवारी)\b/.test(message)) {
        detectedLang = getLanguageByCode('mr');
      } else {
        detectedLang = getLanguageByCode('hi');
      }
    } else if (/[\u0B80-\u0BFF]/.test(message)) {
      detectedLang = getLanguageByCode('ta');
    } else if (/[\u0C00-\u0C7F]/.test(message)) {
      detectedLang = getLanguageByCode('te');
    } else if (/[\u0C80-\u0CFF]/.test(message)) {
      detectedLang = getLanguageByCode('kn');
    } else if (/[\u0D00-\u0D7F]/.test(message)) {
      detectedLang = getLanguageByCode('ml');
    } else if (/[\u0980-\u09FF]/.test(message)) {
      if (message.includes('হ’বনে') || message.includes('বতৰ')) {
        detectedLang = getLanguageByCode('as');
      } else {
        detectedLang = getLanguageByCode('bn');
      }
    } else if (/[\u0A00-\u0A7F]/.test(message)) {
      detectedLang = getLanguageByCode('pa');
    } else if (/[\u0B00-\u0B7F]/.test(message)) {
      detectedLang = getLanguageByCode('or');
    } else if (/[\u0600-\u06FF]/.test(message)) {
      detectedLang = getLanguageByCode('ur');
    } else if (isVoice) {
      // Voice query explicitly in native regional language
      if (voiceLanguageCode && voiceLanguageCode !== 'en') {
        detectedLang = getLanguageByCode(voiceLanguageCode);
      } else if (languageCode && languageCode !== 'en') {
        detectedLang = getLanguageByCode(languageCode);
      } else {
        detectedLang = getLanguageByCode('en');
      }
    } else {
      // Typed text query without native script:
      // First check for Romanized regional queries (e.g. "Ahmedabad ma varsad che?", "Aaj barish hogi kya?", "Paus padel ka?")
      const queryLang = detectLanguageFromText(message);
      if (queryLang.code !== 'en') {
        detectedLang = queryLang;
      } else if (/\b(rain|raining|rainfall|was|is|will|what|how|temperature|temp|weather|forecast|today|tomorrow|yesterday|there|in|on|at|the|for|humidity|wind|hot|cold|air|climate|sky|cloud|cloudy)\b/i.test(message)) {
        // Query has explicit English vocabulary -> User typed in English, so answer ONLY in English!
        detectedLang = getLanguageByCode('en');
      } else if (languageCode && languageCode !== 'en') {
        // Neutral or place-only query with active regional UI selection
        detectedLang = getLanguageByCode(languageCode);
      } else {
        detectedLang = getLanguageByCode('en');
      }
    }

    // 2. Location Resolution (Handles explicit mentions and conversational follow-ups)
    let loc: typeof INDIA_LOCATIONS[0];
    const locationInQuery = findLocationByQuery(message);
    const isDirectMatch = message.toLowerCase().includes(locationInQuery.city.toLowerCase());

    if (isDirectMatch) {
      loc = locationInQuery;
    } else if (clientLoc && clientLoc.latitude && clientLoc.longitude) {
      loc = clientLoc;
    } else if (locationId) {
      const found = INDIA_LOCATIONS.find(l => l.id === locationId);
      loc = found || locationInQuery;
    } else {
      loc = locationInQuery;
    }

    // 3. Historical Weather Database Querying
    // Interrogates the historical weather database for the specified date and city
    const histResult = queryHistoricalWeather(message, loc.city);

    // 4. Meteorological Live & Forecast Tools Invocation
    const weather = await fetchLiveWeatherData(loc);
    const [forecast, alerts, advisories, climate, ragDocs] = await Promise.all([
      fetchForecastData(loc, weather),
      Promise.resolve(getActiveAlerts(loc, weather)),
      Promise.resolve(getSectorAdvisories(loc, weather)),
      Promise.resolve(getHistoricalClimate(loc.city, loc)),
      Promise.resolve(retrieveRelevantKnowledge(message))
    ]);

    const toolInvocations: { tool: string; params: Record<string, any>; status: 'success' | 'warning' | 'info' }[] = [];

    if (histResult.queryMatched && histResult.record) {
      toolInvocations.push({
        tool: 'query_historical_weather_database',
        params: {
          city: histResult.record.city,
          state: histResult.record.state,
          date: histResult.parsedDate?.dateStr || '2026-09-13',
          recorded_rainfall_mm: histResult.record.rainfall_mm,
          rain_occurred: histResult.record.rain_occurred,
          max_temp_c: histResult.record.temp_max,
          min_temp_c: histResult.record.temp_min,
          station: histResult.record.station_name
        },
        status: 'success'
      });
    }

    toolInvocations.push(
      {
        tool: 'get_realtime_weather',
        params: { latitude: loc.latitude, longitude: loc.longitude, city: loc.city },
        status: 'success'
      },
      {
        tool: 'get_forecast_nwp',
        params: { models: ['GFS', 'ECMWF', 'WRF-India'], horizon: '7-day' },
        status: 'success'
      },
      {
        tool: 'retrieve_agromet_disaster_rag',
        params: { query: message, docs_retrieved: ragDocs.length },
        status: 'success'
      }
    );

    const timeIntent = histResult.queryMatched ? 'historical' : parseTimeHorizon(message);
    const aspectIntent = parseWeatherAspect(message);

    let aiResponseText = '';

    // 5. AI Reasoning with Gemini (Strict Language Parity & Historical Grounding)
    if (aiClient) {
      let historicalPromptSection = '';
      if (histResult.record) {
        historicalPromptSection = `
HISTORICAL WEATHER DATABASE VERIFIED GROUND TRUTH FOR ${histResult.record.city} ON ${histResult.record.date_formatted} (${histResult.record.date}):
- Rain Occurred: ${histResult.record.rain_occurred ? 'YES (RAIN RECORDED)' : 'NO (NO RAIN / DRY)'}
- Measured Rainfall: ${histResult.record.rainfall_mm} mm
- Condition: ${histResult.record.condition_text}
- Temperature: Max ${histResult.record.temp_max}°C, Min ${histResult.record.temp_min}°C, Average ${histResult.record.temp_avg}°C
- Humidity: ${histResult.record.humidity}%, Wind: ${histResult.record.wind_speed_kmh} km/h
- Official Meteorological Station: ${histResult.record.station_name}
- Pre-computed Verified Summary (Gujarati): ${histResult.record.summary_gu}
- Pre-computed Verified Summary (Hindi): ${histResult.record.summary_hi}
- Pre-computed Verified Summary (English): ${histResult.record.summary_en}
`;
      }

      const systemPrompt = `You are WeatherNova, a helpful real-time and historical meteorological intelligence assistant for India.

CRITICAL INSTRUCTIONS:
- STRICT VOICE & TEXT LANGUAGE CONSISTENCY:
  You MUST answer strictly in the EXACT SAME LANGUAGE as the user: ${detectedLang.name} (${detectedLang.native_name}).
  • If detected language is Gujarati (${detectedLang.name}), write ONLY in Gujarati script (ગુજરાતી લિપિ). NEVER output English.
  • If detected language is Hindi (${detectedLang.name}), write ONLY in Hindi (Devanagari script). NEVER output English.
  • If detected language is Marathi, write in Marathi (Devanagari script).
  • If detected language is Tamil, write in Tamil script (தமிழ்).
  • If detected language is Telugu, write in Telugu script (తెలుగు).
  • If detected language is Kannada, write in Kannada script (ಕನ್ನಡ).
  • If detected language is Malayalam, write in Malayalam script (മലയാളം).
  • If detected language is Bengali, write in Bengali script (বাংলা).
  • If detected language is English, write in clear English.
  • NEVER default to English when the voice or text query is in another language!
${historicalPromptSection ? `
- HISTORICAL DATABASE QUERY: The user is asking about historical weather data for ${histResult.record?.city} on ${histResult.parsedDate?.formattedDate || 'the requested date'}.
- State clearly and unequivocally whether there was rain or not based on the historical ground truth.
- Quote the measured rainfall (${histResult.record?.rainfall_mm} mm) and recorded temperatures.
- Seamlessly blend historical, current, and forecast data if the user asked a comparative question.
` : `
- The user is asking about: "${timeIntent.toUpperCase()}" and aspect "${aspectIntent.toUpperCase()}".
- Answer the user's EXACT question directly in 1 to 2 concise, natural sentences.
- Do NOT talk about tomorrow if the user asked about TODAY or CURRENT weather!
- Do NOT talk about today if the user asked about TOMORROW!
`}
- Do NOT hallucinate; use the factual data below.

FACTUAL DATA FOR ${loc.city}, ${loc.state}:
- Current Observation (TODAY):
  • Temperature: ${Math.round(weather.temperature)}°C (Feels like: ${weather.feels_like}°C, Max: ${weather.temp_max}°C, Min: ${weather.temp_min}°C)
  • Rain Probability TODAY: ${weather.rain_probability}%, Sky: ${weather.condition_text}
  • Wind: ${weather.wind_speed_kmh} km/h (${weather.wind_direction_compass}), Gusts: ${weather.wind_gust_kmh} km/h
  • Air Quality Index: ${weather.air_quality.aqi_in} (${weather.air_quality.category})
- Tomorrow's Forecast (TOMORROW):
  • Condition: ${forecast?.daily?.[1]?.condition || weather.condition_text}
  • Rain Probability TOMORROW: ${forecast?.daily?.[1]?.rain_probability ?? weather.rain_probability}%
  • Max Temp: ${forecast?.daily?.[1]?.temp_max ?? weather.temp_max}°C, Min Temp: ${forecast?.daily?.[1]?.temp_min ?? weather.temp_min}°C

USER QUERY: "${message}"`;

      // Primary Gemini call using gemini-3.8-flash
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt
        });
        if (response.text && response.text.trim()) {
          const candidate = response.text.trim();
          // Ensure response script adheres to the target language
          let scriptValid = true;
          if (detectedLang.code === 'gu' && !/[\u0A80-\u0AFF]/.test(candidate)) scriptValid = false;
          if ((detectedLang.code === 'hi' || detectedLang.code === 'mr') && !/[\u0900-\u097F]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'ta' && !/[\u0B80-\u0BFF]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'te' && !/[\u0C00-\u0C7F]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'kn' && !/[\u0C80-\u0CFF]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'ml' && !/[\u0D00-\u0D7F]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'bn' && !/[\u0980-\u09FF]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'pa' && !/[\u0A00-\u0A7F]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'or' && !/[\u0B00-\u0B7F]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'ur' && !/[\u0600-\u06FF]/.test(candidate)) scriptValid = false;
          if (detectedLang.code === 'en' && /[\u0900-\u0D7F]/.test(candidate)) scriptValid = false;

          if (scriptValid) {
            aiResponseText = candidate;
          } else {
            console.warn(`Gemini output did not conform to script for ${detectedLang.code}, using local reasoned response.`);
          }
        }
      } catch (err38: any) {
        // Fallback to gemini-3.6-flash if needed
        try {
          const response2 = await aiClient.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: systemPrompt
          });
          if (response2.text && response2.text.trim()) {
            aiResponseText = response2.text.trim();
          }
        } catch (err36: any) {
          console.warn('Gemini models unavailable, proceeding with intelligent dynamic generator:', err36?.message);
        }
      }
    }

    // 6. Dynamic deterministic generator if Gemini was unavailable, silent, or script-deviant
    if (!aiResponseText) {
      aiResponseText = buildLocalReasonedResponse(
        message,
        detectedLang,
        loc,
        weather,
        forecast,
        alerts,
        advisories,
        climate,
        histResult
      );
    }

    res.json({
      text: aiResponseText.trim(),
      language: detectedLang,
      languageCode: detectedLang.code,
      is_voice: isVoice || false,
      location: loc,
      weather_snapshot: weather,
      forecast_snapshot: forecast,
      active_alerts: alerts,
      advisories_snapshot: advisories,
      historical_snapshot: histResult.record || null,
      tool_invocations: toolInvocations
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing AI chat' });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherNova server running on port ${PORT}`);
  });
}

startServer();
