export interface KnowledgeItem {
  id: string;
  category: 'agromet' | 'disaster' | 'marine' | 'climatology' | 'lightning_damini';
  title: string;
  tags: string[];
  content: string;
  official_source: string;
}

export const RAG_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'imd_agromet_spraying',
    category: 'agromet',
    title: 'IMD Agromet Advisory: Pesticide & Chemical Spraying Rules',
    tags: ['spraying', 'pesticide', 'wind', 'rain', 'crops', 'cotton', 'wheat', 'chili'],
    official_source: 'IMD Gramin Krishi Mausam Sewa (GKMS) Bulletin',
    content: `
      1. Wind threshold: Do not apply foliar chemical sprays when surface wind speed exceeds 15 km/h to prevent spray drift to adjacent plots.
      2. Rain wash-off window: Never spray if rainfall is forecasted within the next 4 to 6 hours or if rain probability is above 60%. A dry window of at least 4 hours is mandatory.
      3. Temperature: Avoid spraying during peak afternoon heat (>35°C) to prevent leaf scorching. Ideal time is early morning (7:00 AM - 10:30 AM) or late evening (4:30 PM - 6:30 PM).
      4. High humidity (>80%): Beware of fungal blast in paddy and bollworm/whitefly surge in cotton following warm rainy spells.
    `
  },
  {
    id: 'imd_agromet_irrigation',
    category: 'agromet',
    title: 'IMD Agromet Advisory: Crop Irrigation Scheduling with Rainfall Forecast',
    tags: ['irrigation', 'water', 'rainfall', 'paddy', 'groundnut', 'sugarcane', 'wheat'],
    official_source: 'ICAR - Central Research Institute for Dryland Agriculture (CRIDA) & IMD',
    content: `
      1. Postpone irrigation if 10 mm or more rainfall is expected within 24–48 hours, or if rain probability is >= 70%.
      2. For Cotton & Groundnut in Saurashtra/Gujarat/Vidarbha: Ensure rapid field drainage in Black Cotton soils if heavy rain (>64.5 mm) is expected to prevent root rot and asphyxiation.
      3. For Paddy: Maintain 3–5 cm standing water during tillering and panicle initiation stages, but lower bunds before very heavy rain to prevent silt accumulation and bund rupture.
    `
  },
  {
    id: 'incois_marine_fishermen',
    category: 'marine',
    title: 'INCOIS & IMD Marine Advisory: Sea State, Wave Height & Fishermen Venturing',
    tags: ['fishermen', 'sea', 'marine', 'cyclone', 'waves', 'coast', 'arabian sea', 'bay of bengal'],
    official_source: 'INCOIS Marine Meteorology & Ocean State Forecast Services',
    content: `
      1. Green / Safe: Significant wave height < 2.0 m, wind speed < 30 km/h (16 knots). Normal artisanal and motorized fishing permitted.
      2. Yellow / Watch: Wave height 2.0 - 2.8 m, wind 30 - 45 km/h. Caution advised for small non-mechanized country craft.
      3. Orange / Alert: Wave height 2.8 - 4.0 m, wind 45 - 65 km/h (Squally weather). Fishermen strictly advised not to venture into deep sea or outer continental shelf. Boats to remain near safe harbor.
      4. Red / Warning (Phenomenal): Significant wave height > 4.0 m, wind > 65 km/h (Gale force). Total suspension of coastal, mid-sea, and deep-sea fishing operations. All anchored craft must double moorings.
    `
  },
  {
    id: 'ndma_cyclone_sop',
    category: 'disaster',
    title: 'NDMA Standard Operating Procedure: Tropical Cyclone Warning Stages',
    tags: ['cyclone', 'ndma', 'evacuation', 'disaster', 'storm surge', 'warning'],
    official_source: 'National Disaster Management Authority (NDMA) Cyclone Guidelines 2024-2026',
    content: `
      1. Pre-Cyclone Watch: Issued 72 hours prior to depression intensification. Fishermen notified to return to shore.
      2. Cyclone Alert (Yellow): Issued 48 hours prior to expected commencement of adverse weather over coastal districts.
      3. Cyclone Warning (Orange): Issued 24 hours prior. Exact landfall coordinates and storm surge heights computed.
      4. Post-Landfall Outlook (Red): Issued 12 hours prior to landfall. Evacuation of population living within 5 km of coast and kutcha houses to cyclone shelters (PMAY/NDMA Multi-Purpose Cyclone Shelters). Emergency helpline: 1070 (State), 1077 (District), 112 (National Emergency).
    `
  },
  {
    id: 'ndma_damini_lightning',
    category: 'lightning_damini',
    title: 'NDMA & IMD Damini Lightning & Severe Thunderstorm Safety Protocol',
    tags: ['lightning', 'thunderstorm', 'damini', 'safety', 'open field', 'farmers'],
    official_source: 'IMD Damini Lightning Alert Network & NDMA',
    content: `
      1. 30-30 Rule: If the time between seeing lightning flash and hearing thunder is less than 30 seconds, seek sturdy shelter immediately. Stay inside for 30 minutes after last thunder roar.
      2. Open field safety: Never take shelter under tall isolated trees, electric poles, metal towers, or tin sheds. If caught in open farmland, crouch low on balls of feet with heels touching, head tucked in ('lightning crouch'). Never lie flat on the ground.
      3. Electronic precautions: Disconnect submersible pump starters, computers, and agricultural machinery during active convective squall alerts.
    `
  },
  {
    id: 'imd_heatwave_action_plan',
    category: 'climatology',
    title: 'IMD National Heatwave Criteria & Heat Action Plan (HAP)',
    tags: ['heatwave', 'temperature', 'hap', 'hydration', 'public health', 'sunstroke'],
    official_source: 'IMD Operational Heatwave Warning Criteria',
    content: `
      1. Heatwave Definition: Plains: Max temp >= 40°C and departure from normal >= 4.5°C; or Max temp >= 45°C regardless of normal. Severe Heatwave: Departure >= 6.5°C or Max temp >= 47°C.
      2. Coastal: Max temp >= 37°C with departure >= 4.5°C.
      3. Advisory: Prohibit outdoor manual agricultural labor and construction between 12:00 PM and 3:30 PM. Drink ORS, nimbu pani, buttermilk (chaas), and carry wet cotton cloth.
    `
  }
];

export function retrieveRelevantKnowledge(query: string): KnowledgeItem[] {
  const q = query.toLowerCase();
  const scored = RAG_KNOWLEDGE_BASE.map(item => {
    let score = 0;
    for (const tag of item.tags) {
      if (q.includes(tag)) score += 3;
    }
    const words = item.title.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && q.includes(w)) score += 2;
    }
    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.item);
}
