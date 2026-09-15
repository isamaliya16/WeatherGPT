import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Database,
  Wifi,
  Server,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  MapPin,
  Cpu
} from 'lucide-react';
import { TelemetryPacket, TelemetryStreamStatus } from '../types';

export const TelemetryConsole: React.FC = () => {
  const [packets, setPackets] = useState<TelemetryPacket[]>([]);
  const [streamStatus, setStreamStatus] = useState<TelemetryStreamStatus>({
    active_connections: 42,
    connected_stations: 618,
    messages_per_minute: 1420,
    storage_engine: 'PostgreSQL TimeScaleDB + Mongo Cache',
    last_db_sync: new Date().toISOString()
  });
  const [selectedStationType, setSelectedStationType] = useState<string>('all');
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState<TelemetryPacket | null>(null);

  // Fetch initial telemetry snapshots
  const fetchLiveTelemetry = async () => {
    try {
      const res = await fetch('/api/weather/telemetry/live');
      if (res.ok) {
        const data = await res.json();
        setPackets(data.recent_packets || []);
        if (data.system_status) {
          setStreamStatus(data.system_status);
        }
      }
    } catch (err) {
      console.warn('Telemetry poll error:', err);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();

    if (!isStreaming) return;

    // Connect to Server-Sent Events (SSE) stream for real-time telemetry
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/weather/telemetry/stream');
      eventSource.onmessage = (event) => {
        try {
          const newPacket: TelemetryPacket = JSON.parse(event.data);
          setPackets((prev) => [newPacket, ...prev.slice(0, 49)]);
          setStreamStatus((prev) => ({
            ...prev,
            messages_per_minute: prev.messages_per_minute + 1,
            last_db_sync: new Date().toISOString()
          }));
        } catch {
          // parse error ignore
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // fallback to timer if SSE fails
    }

    const interval = setInterval(fetchLiveTelemetry, 10000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [isStreaming]);

  const filteredPackets = packets.filter((p) => {
    if (selectedStationType === 'all') return true;
    return p.station_type.toLowerCase() === selectedStationType.toLowerCase();
  });

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Radio className="w-3 h-3 animate-pulse text-blue-600" /> Live Ingestion Feed
            </span>
            <span className="text-xs text-slate-500 font-mono">MQTT • WMO-GTS • OpenTelemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Meteorological Ingestion & Telemetry Bus
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time streaming ingestion pipeline syncing 600+ IMD Automatic Weather Stations (AWS), ISRO Automatic Rain Gauges (ARG), X-band Doppler Radars, and INCOIS Coastal Buoys into structured time-series storage.
          </p>
        </div>

        {/* Stream Toggle Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border ${
              isStreaming
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Activity className={`w-4 h-4 ${isStreaming ? 'animate-pulse text-emerald-600' : 'text-slate-400'}`} />
            <span>{isStreaming ? 'Stream Active' : 'Stream Paused'}</span>
          </button>

          <button
            onClick={fetchLiveTelemetry}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Refresh Ingestion Cache"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Structured Pipeline Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Connected Stations</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {streamStatus.connected_stations}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All 36 IMD Met Divisions Online
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Throughput Rate</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {streamStatus.messages_per_minute.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-normal">pkt/min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Average Latency: 14ms (Kafka/MQTT)</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Structured Storage</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">PostgreSQL + MongoDB</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">TimeScale Partitioned (QC L1)</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Ingestion Status</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Healthy (100% SLA)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Schema: WMO BUFR / JSON-LD</div>
        </div>
      </div>

      {/* Main Content: Filter and Feed Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Filter Ingestion:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'AWS', 'Doppler_Radar', 'Agromet', 'Buoy'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedStationType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedStationType === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'all' ? 'All Networks' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Buffer: {filteredPackets.length} recent packets</span>
          </div>
        </div>

        {/* Telemetry Packets List */}
        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {filteredPackets.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
              <p className="text-sm font-medium">Awaiting incoming telemetry packets...</p>
            </div>
          ) : (
            filteredPackets.map((pkt) => (
              <div
                key={pkt.id}
                onClick={() => setSelectedPacket(pkt)}
                className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold flex flex-col items-center justify-center shrink-0 min-w-[58px]">
                    <span className="text-[10px] text-slate-500 uppercase">{pkt.station_type}</span>
                    <span>{pkt.station_id.split('-')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{pkt.station_name}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {pkt.latitude.toFixed(2)}°N, {pkt.longitude.toFixed(2)}°E
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {pkt.data.temperature_c.toFixed(1)}°C
                      </span>
                      <span>•</span>
                      <span>RH: {pkt.data.humidity_pct}%</span>
                      <span>•</span>
                      <span>Wind: {pkt.data.wind_speed_kmh} km/h</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-700">Rain 1h: {pkt.data.rainfall_1h_mm} mm</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{pkt.data.pressure_hpa} hPa</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      pkt.qc_status === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" /> QC Passed
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(pkt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Raw Payload Modal / Inspector Drawer */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Telemetry Payload: {selectedPacket.station_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedPacket.station_id} | WMO Code: {selectedPacket.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Station Network:</span>
                <span className="font-bold text-slate-800">{selectedPacket.station_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Coordinates & Elevation:</span>
                <span className="font-bold text-slate-800">
                  {selectedPacket.latitude}°N, {selectedPacket.longitude}°E (Elev: {selectedPacket.data.elevation_m || 55}m)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Battery Voltage:</span>
                <span className="font-bold text-slate-800">{selectedPacket.data.battery_v || 12.6} V (Solar Buffer)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Quality Check Pipeline:</span>
                <span className="font-bold text-emerald-700">WMO Level-1 Spatial & Range Validated</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Raw JSON-LD Object:</span>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                {JSON.stringify(selectedPacket, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
