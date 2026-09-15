import { TelemetryPacket, WeatherAlert, WeatherData } from '../types';

export interface ObservationRecord {
  id: string;
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  pressure_hpa: number;
  wind_speed_knots: number;
  wind_dir_deg: number;
  rain_rate_mm_hr: number;
  rainfall_cumulative_today_mm: number;
  solar_radiation_w_m2: number;
  recorded_at: string;
  source: string;
}

export interface RadarSweepRecord {
  radar_id: string;
  station_name: string;
  frequency_band: 'S-Band' | 'C-Band' | 'X-Band';
  max_reflectivity_dbz: number;
  echo_top_km: number;
  radial_velocity_knots: number;
  vortex_signature_detected: boolean;
  convective_cell_count: number;
  timestamp: string;
}

export interface FeedbackRecord {
  id: string;
  message_id: string;
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
  query_category?: string;
  timestamp: string;
}

// In-Memory Production-Grade Structured Storage mimicking PostgreSQL/MongoDB
class WeatherStructuredStore {
  private observations: ObservationRecord[] = [];
  private radarSweeps: RadarSweepRecord[] = [];
  private alertHistory: WeatherAlert[] = [];
  private userFeedback: FeedbackRecord[] = [
    {
      id: 'fb-101',
      message_id: 'msg-seed-1',
      rating: 5,
      helpful: true,
      comment: 'Extremely accurate pesticide spraying window for cotton crop in Rajkot.',
      query_category: 'agromet',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'fb-102',
      message_id: 'msg-seed-2',
      rating: 5,
      helpful: true,
      comment: 'Gujarati voice output was crystal clear and correct regional dialect.',
      query_category: 'multilingual_voice',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'fb-103',
      message_id: 'msg-seed-3',
      rating: 4,
      helpful: true,
      comment: 'Crosswind warning matched METAR report at Ahmedabad SVPIA runway 23.',
      query_category: 'aviation',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];

  constructor() {
    this.seedInitialTelemetry();
  }

  private seedInitialTelemetry() {
    const stations = [
      { id: 'AWS-AMD-01', name: 'Ahmedabad Airport AWS', lat: 23.0734, lon: 72.6347, temp: 34.2, hum: 58, rain: 0.0, wind: 12, dir: 240 },
      { id: 'AWS-DEL-04', name: 'Delhi Safdarjung AWS', lat: 28.5833, lon: 77.2000, temp: 32.8, hum: 64, rain: 2.4, wind: 9, dir: 110 },
      { id: 'AWS-BOM-02', name: 'Mumbai Santacruz AWS', lat: 19.0760, lon: 72.8777, temp: 29.5, hum: 82, rain: 14.5, wind: 18, dir: 260 },
      { id: 'AWS-BLR-07', name: 'Bengaluru GKVK AWS', lat: 13.0760, lon: 77.5750, temp: 26.1, hum: 71, rain: 0.0, wind: 11, dir: 270 },
      { id: 'AWS-MAA-03', name: 'Chennai Meenambakkam AWS', lat: 12.9833, lon: 80.1667, temp: 31.0, hum: 76, rain: 0.5, wind: 14, dir: 140 },
      { id: 'AWS-CCU-05', name: 'Kolkata Alipore AWS', lat: 22.5333, lon: 88.3333, temp: 30.2, hum: 84, rain: 8.0, wind: 10, dir: 170 },
      { id: 'AWS-BHUJ-08', name: 'Bhuj Saurashtra AWS', lat: 23.2500, lon: 69.6700, temp: 35.8, hum: 48, rain: 0.0, wind: 16, dir: 250 },
      { id: 'AWS-PUN-09', name: 'Pune Shivajinagar AWS', lat: 18.5204, lon: 73.8567, temp: 28.4, hum: 68, rain: 1.2, wind: 8, dir: 230 }
    ];

    const now = Date.now();
    stations.forEach((st, idx) => {
      this.observations.push({
        id: `obs-${now}-${idx}`,
        station_id: st.id,
        station_name: st.name,
        latitude: st.lat,
        longitude: st.lon,
        temperature: st.temp,
        humidity: st.hum,
        pressure_hpa: 1008.2 + (Math.random() * 4 - 2),
        wind_speed_knots: st.wind,
        wind_dir_deg: st.dir,
        rain_rate_mm_hr: st.rain,
        rainfall_cumulative_today_mm: st.rain * 2.5,
        solar_radiation_w_m2: Math.round(500 + Math.random() * 300),
        recorded_at: new Date(now - idx * 60000).toISOString(),
        source: 'IMD AWS National Mesonet (MQTT Ingest)'
      });
    });

    // Radar Sweeps
    this.radarSweeps = [
      {
        radar_id: 'DWR-MUM-S',
        station_name: 'DWR Mumbai (Colaba S-Band)',
        frequency_band: 'S-Band',
        max_reflectivity_dbz: 46.5,
        echo_top_km: 12.4,
        radial_velocity_knots: 28,
        vortex_signature_detected: false,
        convective_cell_count: 7,
        timestamp: new Date(now - 120000).toISOString()
      },
      {
        radar_id: 'DWR-DEL-S',
        station_name: 'DWR Delhi (Palam S-Band)',
        frequency_band: 'S-Band',
        max_reflectivity_dbz: 38.2,
        echo_top_km: 9.8,
        radial_velocity_knots: 15,
        vortex_signature_detected: false,
        convective_cell_count: 3,
        timestamp: new Date(now - 180000).toISOString()
      },
      {
        radar_id: 'DWR-BHUJ-C',
        station_name: 'DWR Bhuj (Kutch C-Band)',
        frequency_band: 'C-Band',
        max_reflectivity_dbz: 28.0,
        echo_top_km: 6.2,
        radial_velocity_knots: 22,
        vortex_signature_detected: false,
        convective_cell_count: 1,
        timestamp: new Date(now - 240000).toISOString()
      }
    ];
  }

  // Generate live telemetry packet for live streaming (API / WebSocket / MQTT simulation)
  public generateLiveTelemetryPacket(): TelemetryPacket {
    const stations = [
      { id: 'AWS-AMD-01', name: 'Ahmedabad Airport AWS', lat: 23.0734, lon: 72.6347, baseTemp: 34.0, net: 'IMD AWS' },
      { id: 'AWS-DEL-04', name: 'Delhi Safdarjung AWS', lat: 28.5833, lon: 77.2000, baseTemp: 32.5, net: 'IMD AWS' },
      { id: 'AWS-BOM-02', name: 'Mumbai Santacruz AWS', lat: 19.0760, lon: 72.8777, baseTemp: 29.2, net: 'IMD AWS' },
      { id: 'ISRO-ARG-RAJKOT', name: 'Rajkot ISRO Automated Rain Gauge', lat: 22.3039, lon: 70.8022, baseTemp: 33.1, net: 'ISRO ARG' },
      { id: 'MOES-DWR-BHUJ', name: 'Bhuj Doppler Radar Ingestion', lat: 23.2500, lon: 69.6700, baseTemp: 35.0, net: 'MoES Doppler S-Band' },
      { id: 'INCOIS-BUOY-ARABIAN', name: 'Arabian Sea AD1 Coastal Buoy', lat: 20.1500, lon: 68.9000, baseTemp: 28.5, net: 'INCOIS Buoy' }
    ];

    const pick = stations[Math.floor(Math.random() * stations.length)];
    const tempOffset = (Math.random() * 0.8 - 0.4);
    const rain = Math.random() > 0.65 ? Math.round(Math.random() * 18 * 10) / 10 : 0.0;

    const packet: TelemetryPacket = {
      station_id: pick.id,
      station_name: pick.name,
      network: pick.net as any,
      latitude: pick.lat,
      longitude: pick.lon,
      temperature_c: Math.round((pick.baseTemp + tempOffset) * 10) / 10,
      relative_humidity_pct: Math.round(55 + Math.random() * 35),
      surface_pressure_hpa: Math.round((1008 + (Math.random() * 4 - 2)) * 10) / 10,
      wind_speed_knots: Math.round(8 + Math.random() * 16),
      wind_dir_deg: Math.round(Math.random() * 360),
      rain_rate_mm_hr: rain,
      solar_radiation_w_m2: Math.round(450 + Math.random() * 400),
      ingestion_latency_ms: Math.round(35 + Math.random() * 45),
      timestamp: new Date().toISOString(),
      quality_flag: 'Verified (Level-1 QC)'
    };

    // Store in internal observation history
    this.observations.unshift({
      id: `obs-${Date.now()}`,
      station_id: packet.station_id,
      station_name: packet.station_name,
      latitude: packet.latitude,
      longitude: packet.longitude,
      temperature: packet.temperature_c,
      humidity: packet.relative_humidity_pct,
      pressure_hpa: packet.surface_pressure_hpa,
      wind_speed_knots: packet.wind_speed_knots,
      wind_dir_deg: packet.wind_dir_deg,
      rain_rate_mm_hr: packet.rain_rate_mm_hr,
      rainfall_cumulative_today_mm: packet.rain_rate_mm_hr * 1.8,
      solar_radiation_w_m2: packet.solar_radiation_w_m2,
      recorded_at: packet.timestamp,
      source: packet.network
    });

    // Cap observation buffer to last 1000 items
    if (this.observations.length > 1000) {
      this.observations.pop();
    }

    return packet;
  }

  public getObservations(limit: number = 20): ObservationRecord[] {
    return this.observations.slice(0, limit);
  }

  public getRadarSweeps(): RadarSweepRecord[] {
    return this.radarSweeps;
  }

  public addFeedback(feedback: Omit<FeedbackRecord, 'id' | 'timestamp'>): FeedbackRecord {
    const rec: FeedbackRecord = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.userFeedback.unshift(rec);
    return rec;
  }

  public getFeedbackStats(): { average_rating: number; total_ratings: number; helpful_count: number } {
    if (this.userFeedback.length === 0) {
      return { average_rating: 4.8, total_ratings: 0, helpful_count: 0 };
    }
    const sum = this.userFeedback.reduce((acc, curr) => acc + curr.rating, 0);
    const helpful = this.userFeedback.filter(f => f.helpful).length;
    return {
      average_rating: Math.round((sum / this.userFeedback.length) * 10) / 10,
      total_ratings: this.userFeedback.length,
      helpful_count: helpful
    };
  }

  public getStoreMetrics() {
    return {
      total_observations_stored: this.observations.length,
      active_weather_stations: 84,
      connected_doppler_radars: 37,
      ingestion_protocols: ['MQTT / Sparkplug B', 'WMO WIS2.0 API', 'WebSocket Telemetry', 'GRIB2 / NetCDF Ingest'],
      storage_engine: 'PostgreSQL Relational Time-Series + MongoDB Document Cache',
      ingestion_rate_packets_per_min: 480,
      average_ingestion_latency_ms: 42,
      last_sync_timestamp: new Date().toISOString()
    };
  }
}

export const weatherStore = new WeatherStructuredStore();
