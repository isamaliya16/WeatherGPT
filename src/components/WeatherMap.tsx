import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Radio,
  Eye,
  AlertTriangle,
  Wind,
  Compass,
  Navigation,
  CloudRain,
  MapPin,
  Sparkles,
  Sun,
  Globe,
  Crosshair,
  Sliders
} from 'lucide-react';
import { INDIA_LOCATIONS } from '../data/indiaLocations';
import { WeatherAlert, LocationPreset } from '../types';

interface WeatherMapProps {
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
  alerts: WeatherAlert[];
  onAskAi: (prompt: string) => void;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
}

type BasemapType = 'streets' | 'satellite' | 'terrain';

const BASEMAPS: Record<BasemapType, { url: string; attribution: string; name: string; icon: string }> = {
  streets: {
    name: 'Google Maps Style',
    icon: '🗺️',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  satellite: {
    name: 'Satellite Aerial',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    name: 'Topographic Terrain',
    icon: '🏔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, METI, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  }
};

export const WeatherMap: React.FC<WeatherMapProps> = ({
  currentLocation,
  onSelectLocation,
  alerts,
  onAskAi,
  onDetectLocation,
  isDetectingLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Active layer toggles
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('streets');
  const [showRadar, setShowRadar] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [showAlertZones, setShowAlertZones] = useState(true);
  const [showCycloneTrack, setShowCycloneTrack] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [selectedPointInfo, setSelectedPointInfo] = useState<{
    lat: number;
    lng: number;
    estimated_temp: number;
    rain_prob: number;
    condition: string;
  } | null>(null);

  const radarLayerRef = useRef<L.LayerGroup | null>(null);
  const satLayerRef = useRef<L.LayerGroup | null>(null);
  const alertLayerRef = useRef<L.LayerGroup | null>(null);
  const cycloneLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map centered on India
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.latitude || 22.0, currentLocation.longitude || 77.0],
        zoom: 6,
        minZoom: 4,
        maxZoom: 16
      });

      // Google Maps style realistic tile layer
      const baseTile = L.tileLayer(BASEMAPS[currentBasemap].url, {
        attribution: BASEMAPS[currentBasemap].attribution,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = baseTile;

      radarLayerRef.current = L.layerGroup().addTo(map);
      satLayerRef.current = L.layerGroup().addTo(map);
      alertLayerRef.current = L.layerGroup().addTo(map);
      cycloneLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle map click for point weather inspection
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const estTemp = Math.round(30 - Math.abs(lat - 20) * 0.4 + Math.sin(lng) * 2);
        const rainProb = Math.min(95, Math.max(10, Math.round(50 + Math.sin(lat * 3) * 35)));
        const condition = rainProb > 60 ? 'Monsoon Showers' : rainProb > 30 ? 'Partly Cloudy' : 'Clear Skies';

        setSelectedPointInfo({
          lat: Math.round(lat * 1000) / 1000,
          lng: Math.round(lng * 1000) / 1000,
          estimated_temp: estTemp,
          rain_prob: rainProb,
          condition
        });
      });
    }

    return () => {
      // Map stays mounted
    };
  }, []);

  // Update Basemap when changed
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(BASEMAPS[currentBasemap].url);
    }
  }, [currentBasemap]);

  // Center when current location changes
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.flyTo([currentLocation.latitude, currentLocation.longitude], 7, {
        duration: 1.2
      });
    }
  }, [currentLocation]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    INDIA_LOCATIONS.forEach(loc => {
      const isCurrent = loc.id === currentLocation.id;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-4 h-4 rounded-full ${
            isCurrent ? 'bg-emerald-500 ring-4 ring-emerald-400/50 scale-125' : 'bg-blue-600'
          } border-2 border-white shadow-md transition-all"></div>
          ${
            isCurrent
              ? '<span class="absolute -top-6 px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[10px] shadow whitespace-nowrap">You are here</span>'
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-station-icon',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 13px; line-height: 1.4; padding: 4px;">
          <strong style="font-size: 15px; color: #047857;">${loc.city}</strong><br/>
          <span style="color: #64748b; font-size: 11px;">${loc.state} • ${loc.region_type}</span>
          <div style="margin-top: 8px; padding: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px;">
            <strong>Primary Crops:</strong> ${loc.primary_crops?.join(', ') || 'Various'}<br/>
            <strong>District:</strong> ${loc.district || loc.city}
          </div>
          <button style="margin-top: 8px; width: 100%; padding: 6px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Select as Active City
          </button>
        </div>
      `);

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [currentLocation, onSelectLocation]);

  // Update Radar Layer
  useEffect(() => {
    if (!radarLayerRef.current) return;
    radarLayerRef.current.clearLayers();

    if (showRadar) {
      // Doppler Radar reflectivity circles over active meteorological corridors
      const radarEchoes = [
        { lat: 21.8, lng: 71.5, radius: 110000, color: '#0284c7', fill: '#38bdf8', opacity: 0.45 * radarOpacity, label: '35 dBZ (Moderate Rain - Saurashtra Corridor)' },
        { lat: 21.3, lng: 72.8, radius: 85000, color: '#f59e0b', fill: '#f59e0b', opacity: 0.55 * radarOpacity, label: '45 dBZ (Heavy Squall - South Gujarat)' },
        { lat: 26.2, lng: 91.8, radius: 130000, color: '#dc2626', fill: '#ef4444', opacity: 0.6 * radarOpacity, label: '52 dBZ (Torrential Cloudburst - Assam/Meghalaya)' },
        { lat: 18.9, lng: 72.8, radius: 70000, color: '#2563eb', fill: '#60a5fa', opacity: 0.4 * radarOpacity, label: '30 dBZ (Coastal Showers - Konkan)' },
        { lat: 13.0, lng: 80.2, radius: 95000, color: '#0891b2', fill: '#22d3ee', opacity: 0.45 * radarOpacity, label: '35 dBZ (Bay of Bengal Influx - Chennai)' },
        { lat: 28.6, lng: 77.2, radius: 75000, color: '#16a34a', fill: '#4ade80', opacity: 0.35 * radarOpacity, label: '25 dBZ (Scattered Pre-Monsoon - NCR)' }
      ];

      radarEchoes.forEach(echo => {
        const circle = L.circle([echo.lat, echo.lng], {
          radius: echo.radius,
          color: echo.color,
          fillColor: echo.fill,
          fillOpacity: echo.opacity,
          weight: 2
        });
        circle.bindTooltip(`<strong>Doppler Radar:</strong> ${echo.label}`);
        radarLayerRef.current?.addLayer(circle);
      });
    }
  }, [showRadar, radarOpacity]);

  // Update Satellite Cloud Layer
  useEffect(() => {
    if (!satLayerRef.current) return;
    satLayerRef.current.clearLayers();

    if (showSatellite) {
      // INSAT Infrared Cloud Cluster Overlays
      const clouds = [
        { lat: 22.0, lng: 69.5, radius: 190000, fill: '#f8fafc', opacity: 0.35 },
        { lat: 25.5, lng: 92.0, radius: 220000, fill: '#f8fafc', opacity: 0.45 },
        { lat: 15.0, lng: 84.0, radius: 260000, fill: '#f8fafc', opacity: 0.30 },
        { lat: 10.0, lng: 76.0, radius: 170000, fill: '#f8fafc', opacity: 0.40 }
      ];

      clouds.forEach(c => {
        const circle = L.circle([c.lat, c.lng], {
          radius: c.radius,
          color: '#cbd5e1',
          fillColor: c.fill,
          fillOpacity: c.opacity,
          weight: 1,
          dashArray: '4, 4'
        });
        circle.bindTooltip('<strong>INSAT-3DR:</strong> Infrared Cloud Cluster');
        satLayerRef.current?.addLayer(circle);
      });
    }
  }, [showSatellite]);

  // Update Alert Zones
  useEffect(() => {
    if (!alertLayerRef.current) return;
    alertLayerRef.current.clearLayers();

    if (showAlertZones) {
      alerts.forEach(alert => {
        const color =
          alert.severity === 'Red'
            ? '#ef4444'
            : alert.severity === 'Orange'
            ? '#f97316'
            : '#eab308';

        const circle = L.circle(alert.coordinates, {
          radius: (alert.radius_km || 100) * 1000,
          color: color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 2
        });

        circle.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
            <div style="font-weight: 800; color: ${color}; font-size: 14px;">${alert.severity} Alert: ${alert.hazard_type}</div>
            <div style="font-weight: 700; margin-top: 4px;">${alert.location} (${alert.state})</div>
            <p style="margin: 6px 0; color: #334155;">${alert.headline}</p>
            <div style="font-size: 11px; color: #64748b;">Source: ${alert.source}</div>
          </div>
        `);

        alertLayerRef.current?.addLayer(circle);
      });
    }
  }, [showAlertZones, alerts]);

  // Update Tropical Cyclone Track
  useEffect(() => {
    if (!cycloneLayerRef.current) return;
    cycloneLayerRef.current.clearLayers();

    if (showCycloneTrack) {
      // Arabian Sea Low Pressure / Depression Track
      const trackPoints: [number, number][] = [
        [17.5, 68.2],
        [19.0, 69.1],
        [20.4, 69.9],
        [21.8, 70.8], // Current position near Saurashtra
        [23.2, 72.1]  // Landfall trajectory
      ];

      const polyline = L.polyline(trackPoints, {
        color: '#e11d48',
        weight: 3.5,
        dashArray: '6, 6'
      });
      polyline.bindTooltip('Simulated Cyclonic Storm Trajectory (IMD RSMC)');
      cycloneLayerRef.current?.addLayer(polyline);

      // Eye marker
      const eyeIcon = L.divIcon({
        className: 'cyclone-eye',
        html: `<div class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg animate-spin flex items-center justify-center text-[10px] text-white font-black">🌀</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const eyeMarker = L.marker([21.8, 70.8], { icon: eyeIcon });
      eyeMarker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="color: #e11d48; font-size: 14px;">Depression ARB-02</strong><br/>
          <span>Max Wind: 55 km/h</span><br/>
          <span>Central Pressure: 996 hPa</span><br/>
          <span style="color: #64748b;">Moving Northeastward towards Gujarat coast</span>
        </div>
      `);
      cycloneLayerRef.current?.addLayer(eyeMarker);
    }
  }, [showCycloneTrack]);

  const flyToLocation = (loc: LocationPreset) => {
    onSelectLocation(loc);
    mapInstanceRef.current?.flyTo([loc.latitude, loc.longitude], 8, { duration: 1.5 });
  };

  const handleCenterOnMe = () => {
    if (currentLocation) {
      mapInstanceRef.current?.flyTo([currentLocation.latitude, currentLocation.longitude], 9, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Map Control Header in Modern Clean Light Style */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              TIS Radar, Satellite & GIS Weather Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Realistic Google Maps-style cartography integrated with Doppler radar reflectivity, INSAT cloud patterns, and IMD warning zones.
          </p>
        </div>

        {/* Basemap Switcher (Google Style vs Satellite vs Terrain) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-bold">Map Style:</span>
          {(['streets', 'satellite', 'terrain'] as BasemapType[]).map(type => (
            <button
              key={type}
              onClick={() => setCurrentBasemap(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentBasemap === type
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{BASEMAPS[type].icon}</span>
              <span>{BASEMAPS[type].name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">Overlays:</span>

          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showRadar
                ? 'bg-sky-50 text-sky-800 border border-sky-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            <span>Doppler Radar</span>
          </button>

          <button
            onClick={() => setShowSatellite(!showSatellite)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showSatellite
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>INSAT Clouds</span>
          </button>

          <button
            onClick={() => setShowAlertZones(!showAlertZones)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showAlertZones
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Warning Polygons</span>
          </button>

          <button
            onClick={() => setShowCycloneTrack(!showCycloneTrack)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showCycloneTrack
                ? 'bg-rose-50 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span>🌀</span>
            <span>Cyclone Track</span>
          </button>
        </div>

        {/* Center on location button */}
        <div className="flex items-center gap-2">
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Detect my current location"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
          )}

          <button
            onClick={handleCenterOnMe}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Recenter on current city"
          >
            <Crosshair className="w-3.5 h-3.5 text-slate-700" />
            <span>Focus {currentLocation.city}</span>
          </button>
        </div>
      </div>

      {/* Map Stage Container */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Quick Station Jumper Floating Dock in Clean White Style */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-lg max-w-xs hidden md:block">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span>Quick Station Focus</span>
            <span className="text-emerald-700 font-extrabold">{currentLocation.city}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {INDIA_LOCATIONS.slice(0, 12).map(loc => (
              <button
                key={loc.id}
                onClick={() => flyToLocation(loc)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  loc.id === currentLocation.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {loc.city}
              </button>
            ))}
          </div>
        </div>

        {/* Point Inspection HUD in Clean White Style */}
        {selectedPointInfo && (
          <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:w-84 z-20 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xl text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-2.5">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <MapPin className="w-4 h-4" />
                Point Meteorological Inspection
              </span>
              <button
                onClick={() => setSelectedPointInfo(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinates:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPointInfo.lat}° N, {selectedPointInfo.lng}° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Temp:</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedPointInfo.estimated_temp}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rain Probability:</span>
                <span className="font-extrabold text-blue-700">{selectedPointInfo.rain_prob}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weather Trajectory:</span>
                <span className="font-bold text-slate-800">{selectedPointInfo.condition}</span>
              </div>
            </div>
            <button
              onClick={() => onAskAi(`What is the meteorological condition at coordinates ${selectedPointInfo.lat}°N, ${selectedPointInfo.lng}°E?`)}
              className="mt-3.5 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask WeatherNova about this spot
            </button>
          </div>
        )}

        {/* Doppler dBZ Scale Legend in Clean White Style */}
        <div className="absolute bottom-6 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-md text-[11px] space-y-1.5 hidden sm:block">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Doppler dBZ Reflectivity</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2.5 rounded bg-blue-500"></span>
            <span className="text-slate-600 font-medium">20–30 Light</span>
            <span className="w-3.5 h-2.5 rounded bg-sky-400 ml-1"></span>
            <span className="text-slate-600 font-medium">35–45 Moderate</span>
            <span className="w-3.5 h-2.5 rounded bg-red-500 ml-1"></span>
            <span className="text-slate-600 font-medium">&gt;50 Torrential</span>
          </div>
        </div>
      </div>
    </div>
  );
};
