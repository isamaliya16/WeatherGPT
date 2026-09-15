export interface AppTranslations {
  nav: {
    chat: string;
    chat_sub: string;
    dashboard: string;
    dashboard_sub: string;
    alerts: string;
    alerts_sub: string;
    advisories: string;
    advisories_sub: string;
    map: string;
    map_sub: string;
    climate: string;
    climate_sub: string;
    decision_intel: string;
    location?: string;
  };
  actions: {
    newChat: string;
    selectLocation: string;
    detectLocation: string;
    detectingLocation: string;
    login: string;
    logout: string;
    myAccount: string;
    guest: string;
    loginToSaveHistory: string;
    recentChats: string;
    noRecentChats: string;
    noSavedChats: string;
    searchLocationPlaceholder: string;
    send: string;
    listening: string;
    askQuestionPlaceholder: string;
    disclaimer: string;
    switchLanguage: string;
    autoSpeak: string;
    active: string;
    collapseSidebar: string;
    expandSidebar: string;
    today: string;
    tomorrow: string;
    forecast7Days: string;
    hourlyForecast: string;
    nwpConsensus: string;
    askAi: string;
    listen: string;
    stopVoice: string;
    copy: string;
    copied: string;
    share: string;
  };
  metrics: {
    temp: string;
    feelsLike: string;
    high: string;
    low: string;
    rainProb: string;
    precipitation: string;
    humidity: string;
    wind: string;
    windDirection: string;
    gusts: string;
    pressure: string;
    uvIndex: string;
    airQuality: string;
    cloudCover: string;
    dewPoint: string;
    visibility: string;
    sunrise: string;
    sunset: string;
    liveGroundStation?: string;
    updatedAt?: string;
    groundTruthSources?: string;
    currentObservation?: string;
    hourlyForecast?: string;
    dailyForecast?: string;
    nwpModels?: string;
    consensusTemp?: string;
  };
  alerts: {
    title: string;
    noAlerts: string;
    all: string;
    red: string;
    orange: string;
    yellow: string;
    green: string;
    safetyTips: string;
    emergencyHelpline: string;
    severity: string;
    effectiveTill: string;
  };
  sectors: {
    title: string;
    subtitle: string;
    agriculture: string;
    marine: string;
    health: string;
    disaster: string;
    irrigation: string;
    spraying: string;
    pestRisk: string;
    seaCondition: string;
    waveHeight: string;
    fishermanWarning: string;
    heatIndex: string;
    heatStress?: string;
    hydration: string;
    vulnerableGroups: string;
    primaryCrops: string;
    emergencyActions: string;
  };
  climate: {
    title: string;
    subtitle: string;
    meanRainfall: string;
    heatwaveDays: string;
    extremeRainDays: string;
    monsoonShift: string;
    annualTrajectory: string;
    eventFrequency: string;
    tempEvolution: string;
    monthlyClimatology: string;
    synthesis: string;
    explainTrend: string;
  };
  authModal: {
    loginTitle: string;
    loginDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    signInBtn: string;
    continueGuest: string;
    signedInAs: string;
    optionalNotice: string;
  };
  auth: {
    title: string;
    statusLoggedIn: string;
    statusGuest: string;
    permanentNote: string;
    temporaryNotice: string;
    optionalNotice: string;
    nameLabel: string;
    emailLabel: string;
    signInBtn: string;
    continueGuest: string;
    loginToSave: string;
  };
}

export const TRANSLATIONS: Record<string, Omit<AppTranslations, 'auth'>> = {
  en: {
    nav: {
      chat: 'Weather Chat',
      chat_sub: 'Conversational Weather AI',
      dashboard: 'Deep Weather & NWP',
      dashboard_sub: 'Models, Radar & Metrics',
      alerts: 'Disaster & CAP Alerts',
      alerts_sub: 'Severe Alerts & Warning Radar',
      advisories: 'Agromet & Marine',
      advisories_sub: 'Sector Decision Support',
      map: 'GIS Radar & Satellite',
      map_sub: 'Geospatial Radar & Clouds',
      climate: 'Decadal Climate Trends',
      climate_sub: '10-Year Anomaly Analysis',
      decision_intel: 'Decision Intelligence'
    },
    actions: {
      newChat: 'New Weather Chat',
      selectLocation: 'Location (All India)',
      detectLocation: 'Detect My Location',
      detectingLocation: 'Detecting live location...',
      login: 'Sign In',
      logout: 'Sign Out',
      myAccount: 'Account',
      guest: 'Guest Mode',
      loginToSaveHistory: 'Sign in to save chat history permanently',
      recentChats: 'Recent Conversations',
      noRecentChats: 'No previous conversations',
      noSavedChats: 'Conversations are temporary in guest mode',
      searchLocationPlaceholder: 'Search village, town, district, city...',
      send: 'Send',
      listening: 'Listening...',
      askQuestionPlaceholder: 'Ask about weather, rain forecast, crops, alerts...',
      disclaimer: 'WeatherNova provides real-time meteorological intelligence for India.',
      switchLanguage: 'Language',
      autoSpeak: 'Auto-Speak Responses',
      active: 'Active',
      collapseSidebar: 'Hide Sidebar',
      expandSidebar: 'Show Sidebar',
      today: 'Today',
      tomorrow: 'Tomorrow',
      forecast7Days: '7-Day Synoptic Forecast',
      hourlyForecast: 'Hourly Trend (24h)',
      nwpConsensus: 'NWP Model Consensus (GFS, ECMWF, WRF-India)',
      askAi: 'Ask WeatherNova AI',
      listen: 'Listen',
      stopVoice: 'Stop Voice',
      copy: 'Copy',
      copied: 'Copied',
      share: 'Share'
    },
    metrics: {
      temp: 'Temperature',
      feelsLike: 'Feels Like',
      high: 'High',
      low: 'Low',
      rainProb: 'Rain Probability',
      precipitation: 'Precipitation',
      humidity: 'Humidity',
      wind: 'Wind',
      windDirection: 'Direction',
      gusts: 'Gusts',
      pressure: 'Pressure',
      uvIndex: 'UV Index',
      airQuality: 'Air Quality (AQI)',
      cloudCover: 'Cloud Cover',
      dewPoint: 'Dew Point',
      visibility: 'Visibility',
      sunrise: 'Sunrise',
      sunset: 'Sunset'
    },
    alerts: {
      title: 'Disaster & CAP Meteorological Alerts',
      noAlerts: 'No Severe Alerts Currently Active for this Location',
      all: 'All Alerts',
      red: 'Red Alert (Take Action)',
      orange: 'Orange Alert (Be Prepared)',
      yellow: 'Yellow Alert (Be Aware)',
      green: 'Green (Normal)',
      safetyTips: 'NDMA Safety & Disaster Protocol',
      emergencyHelpline: 'National Emergency: 112 | NDMA Helpline: 1070',
      severity: 'Severity',
      effectiveTill: 'Valid Until'
    },
    sectors: {
      title: 'Sectoral Decision Engines',
      subtitle: 'Grounded in Agromet (GKMS), INCOIS Coastal Advisories, and NDMA Protocol.',
      agriculture: 'Agriculture',
      marine: 'Marine & Fishery',
      health: 'Health & Heat',
      disaster: 'Disaster Mgmt',
      irrigation: 'Irrigation Recommendation',
      spraying: 'Pesticide / Spray Window',
      pestRisk: 'Pest & Disease Microclimate Risk',
      seaCondition: 'Sea Condition Status',
      waveHeight: 'Wave & Swell Height',
      fishermanWarning: 'Official Coastal Fisherman Warning',
      heatIndex: 'Heat Index & Wet-Bulb Stress',
      hydration: 'Hydration & Exposure Guideline',
      vulnerableGroups: 'Vulnerable Demographic Care',
      primaryCrops: 'Primary Regional Crops',
      emergencyActions: 'Emergency Action Checklist'
    },
    climate: {
      title: '10-Year Climate Trends & Meteorological Shifts',
      subtitle: 'Observational climatology and anomaly trends over the last decade.',
      meanRainfall: '10-Yr Mean Rainfall',
      heatwaveDays: 'Heatwave Frequency',
      extremeRainDays: 'Extreme Rain Days (>65mm)',
      monsoonShift: 'Monsoon Onset / Duration Shift',
      annualTrajectory: 'Annual Precipitation Trajectory (2016–2025)',
      eventFrequency: 'Extreme Event Frequency Trend',
      tempEvolution: 'Average Summer Max Temperature (°C)',
      monthlyClimatology: 'Monthly Normal vs Recorded Climatology',
      synthesis: 'Climatological Synthesis',
      explainTrend: 'Explain 10-Yr Trend'
    },
    authModal: {
      loginTitle: 'WeatherNova Account',
      loginDesc: 'Login is completely optional. If you sign in, your conversation history will be permanently saved to your account and accessible when you return.',
      nameLabel: 'Your Name',
      namePlaceholder: 'e.g. Rajesh Sharma',
      emailLabel: 'Email Address',
      emailPlaceholder: 'e.g. rajesh@example.com',
      signInBtn: 'Sign In & Save History',
      continueGuest: 'Continue as Guest (No History Saved)',
      signedInAs: 'Signed in as',
      optionalNotice: 'No password needed. Login is 100% optional.'
    }
  },
  hi: {
    nav: {
      chat: 'मौसम संवाद',
      chat_sub: 'एआई मौसम चर्चा एवं आवाज',
      dashboard: 'गहन मौसम एवं पूर्वानुमान मॉडल',
      dashboard_sub: 'मौसम मॉडल, रडार एवं आंकड़े',
      alerts: 'आपदा एवं सीएपी अलर्ट',
      alerts_sub: 'गंभीर चेतावनी एवं रडार',
      advisories: 'कृषि एवं तटीय सलाह',
      advisories_sub: 'क्षेत्रीय निर्णय प्रणाली',
      map: 'जीआईएस रडार एवं उपग्रह',
      map_sub: 'मानचित्र एवं बादल रडार',
      climate: 'दशकीय जलवायु रुझान',
      climate_sub: '10 वर्षीय मौसम बदलाव विश्लेषण',
      decision_intel: 'निर्णय बुद्धिमत्ता'
    },
    actions: {
      newChat: 'नई मौसम बातचीत',
      selectLocation: 'स्थान (संपूर्ण भारत)',
      detectLocation: 'मेरा लाइव स्थान खोजें',
      detectingLocation: 'स्थान खोजा जा रहा है...',
      login: 'लॉग इन करें',
      logout: 'लॉग आउट',
      myAccount: 'मेरा खाता',
      guest: 'अतिथि मोड',
      loginToSaveHistory: 'बातचीत का इतिहास स्थायी रूप से सुरक्षित करने के लिए लॉग इन करें',
      recentChats: 'हालिया बातचीत',
      noRecentChats: 'कोई पुरानी बातचीत नहीं',
      noSavedChats: 'अतिथि मोड में बातचीत स्थायी रूप से सुरक्षित नहीं होती',
      searchLocationPlaceholder: 'गांव, कस्बा, जिला या शहर खोजें...',
      send: 'भेजें',
      listening: 'सुन रहे हैं...',
      askQuestionPlaceholder: 'मौसम, वर्षा, फसल या चेतावनी के बारे में पूछें...',
      disclaimer: 'WeatherNova भारत के लिए वास्तविक समय की मौसम बुद्धिमत्ता प्रदान करता है।',
      switchLanguage: 'भाषा',
      autoSpeak: 'आवाज से उत्तर सुनें',
      active: 'सक्रिय',
      collapseSidebar: 'साइडबार छिपाएं',
      expandSidebar: 'साइडबार दिखाएं',
      today: 'आज',
      tomorrow: 'कल',
      forecast7Days: '7-दिवसीय मौसम पूर्वानुमान',
      hourlyForecast: 'प्रति घंटे का रुझान (24 घंटे)',
      nwpConsensus: 'पूर्वानुमान मॉडल सहमति (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI से पूछें',
      listen: 'सुनें (हिंदी)',
      stopVoice: 'आवाज रोकें',
      copy: 'कॉपी',
      copied: 'कॉपी हुआ',
      share: 'शेयर करें'
    },
    metrics: {
      temp: 'तापमान',
      feelsLike: 'महसूस',
      high: 'अधिकतम',
      low: 'न्यूनतम',
      rainProb: 'वर्षा संभावना',
      precipitation: 'वर्षा मात्रा',
      humidity: 'नमी (आर्द्रता)',
      wind: 'हवा की गति',
      windDirection: 'दिशा',
      gusts: 'झोंके',
      pressure: 'वायुदाब',
      uvIndex: 'यूवी इंडेक्स',
      airQuality: 'वायु गुणवत्ता (AQI)',
      cloudCover: 'बादलों का फैलाव',
      dewPoint: 'ओस बिंदु',
      visibility: 'दृश्यता',
      sunrise: 'सूर्योदय',
      sunset: 'सूर्यास्त'
    },
    alerts: {
      title: 'आपदा एवं मौसम सीएपी चेतावनियां',
      noAlerts: 'इस स्थान के लिए वर्तमान में कोई गंभीर मौसम चेतावनी सक्रिय नहीं है',
      all: 'सभी अलर्ट',
      red: 'रेड अलर्ट (तुरंत कदम उठाएं)',
      orange: 'ऑरेंज अलर्ट (तैयार रहें)',
      yellow: 'येलो अलर्ट (सजग रहें)',
      green: 'ग्रीन (सामान्य)',
      safetyTips: 'राष्ट्रीय आपदा प्रबंधन (NDMA) सुरक्षा प्रोटोकॉल',
      emergencyHelpline: 'राष्ट्रीय आपातकालीन नंबर: 112 | NDMA हेल्पलाइन: 1070',
      severity: 'गंभीरता',
      effectiveTill: 'मान्य अवधि'
    },
    sectors: {
      title: 'क्षेत्रीय निर्णय प्रणाली',
      subtitle: 'कृषि मौसम विज्ञान, तटीय सलाह एवं आपदा प्रबंधन दिशा-निर्देश।',
      agriculture: 'कृषि एवं फसल',
      marine: 'तटीय एवं मत्स्य पालन',
      health: 'स्वास्थ्य एवं लू प्रबंधन',
      disaster: 'आपदा प्रबंधन',
      irrigation: 'सिंचाई परामर्श',
      spraying: 'कीटनाशक / दवा छिड़काव समय',
      pestRisk: 'कीट एवं रोग सूक्ष्म-जलवायु जोखिम',
      seaCondition: 'समुद्र की स्थिति',
      waveHeight: 'लहरों की ऊंचाई',
      fishermanWarning: 'मछुआरों के लिए तटीय चेतावनी',
      heatIndex: 'गर्मी सूचकांक एवं तनाव',
      hydration: 'जलपान एवं धूप से बचाव',
      vulnerableGroups: 'वृद्ध एवं बच्चों की सुरक्षा',
      primaryCrops: 'प्रमुख क्षेत्रीय फसलें',
      emergencyActions: 'आपातकालीन तैयारी चेकलिस्ट'
    },
    climate: {
      title: '10-वर्षीय जलवायु रुझान एवं मौसमी परिवर्तन',
      subtitle: 'पिछले 10 वर्षों के प्रेक्षण डेटा और विसंगति का गहन विश्लेषण।',
      meanRainfall: '10-वर्षीय औसत वर्षा',
      heatwaveDays: 'लू (हीटवेव) के दिन',
      extremeRainDays: 'भारी वर्षा के दिन (>65mm)',
      monsoonShift: 'मानसून आगमन एवं अवधि में बदलाव',
      annualTrajectory: 'वार्षिक वर्षा प्रक्षेपवक्र (2016–2025)',
      eventFrequency: 'अति-मौसम घटनाओं का रुझान',
      tempEvolution: 'गर्मी के मौसम का औसत तापमान (°C)',
      monthlyClimatology: 'मासिक सामान्य बनाम दर्ज वर्षा',
      synthesis: 'जलवायु सारांश निष्कर्ष',
      explainTrend: '10-वर्षीय रुझान समझें'
    },
    authModal: {
      loginTitle: 'WeatherNova खाता',
      loginDesc: 'लॉग इन करना पूर्णतः ऐच्छिक है। यदि आप लॉग इन करते हैं, तो आपकी बातचीत का इतिहास हमेशा के लिए सुरक्षित रहेगा और लौटने पर दिखाई देगा।',
      nameLabel: 'आपका नाम',
      namePlaceholder: 'उदा. रमेश कुमार',
      emailLabel: 'ईमेल पता',
      emailPlaceholder: 'उदा. ramesh@example.com',
      signInBtn: 'लॉग इन करें और इतिहास सहेजें',
      continueGuest: 'अतिथि के रूप में जारी रखें (इतिहास सुरक्षित नहीं होगा)',
      signedInAs: 'लॉग इन किया गया खाता:',
      optionalNotice: 'पासवर्ड की आवश्यकता नहीं। लॉग इन पूरी तरह से वैकल्पिक है।'
    }
  },
  gu: {
    nav: {
      chat: 'હવામાન સંવાદ',
      chat_sub: 'એઆઈ હવામાન વાતચીત અને અવાજ',
      dashboard: 'ઊંડાણપૂર્વક હવામાન અને મોડેલ્સ',
      dashboard_sub: 'મોડેલ્સ, રડાર અને આંકડા',
      alerts: 'આપત્તિ અને ચેતવણીઓ',
      alerts_sub: 'ગંભીર હવામાન એલર્ટ રડાર',
      advisories: 'કૃષિ અને દરિયાઈ સલાહ',
      advisories_sub: 'ક્ષેત્રીય નિર્ણય માર્ગદર્શન',
      map: 'જીઆઈએસ રડાર અને ઉપગ્રહ',
      map_sub: 'નકશો અને વાદળ રડાર',
      climate: 'દશકીય આબોહવા પરિવર્તન',
      climate_sub: 'છેલ્લા 10 વર્ષનું હવામાન વિશ્લેષણ',
      decision_intel: 'નિર્ણય ક્ષમતા'
    },
    actions: {
      newChat: 'નવી હવામાન ચર્ચા',
      selectLocation: 'સ્થળ (સમગ્ર ભારત)',
      detectLocation: 'મારું લાઈવ લોકેશન મેળવો',
      detectingLocation: 'સ્થળ શોધી રહ્યું છે...',
      login: 'લૉગ ઇન કરો',
      logout: 'લૉગ આઉટ',
      myAccount: 'મારું એકાઉન્ટ',
      guest: 'ગેસ્ટ મોડ',
      loginToSaveHistory: 'વાતચીતનો ઇતિહાસ કાયમ માટે સાચવવા માટે લૉગ ઇન કરો',
      recentChats: 'તાજેતરની વાતચીત',
      noRecentChats: 'કોઈ જૂની વાતચીત નથી',
      noSavedChats: 'ગેસ્ટ મોડમાં વાતચીત કાયમ સાચવવામાં આવતી નથી',
      searchLocationPlaceholder: 'ગામ, તાલુકો, જિલ્લો કે શહેર શોધો...',
      send: 'મોકલો',
      listening: 'સાંભળી રહ્યું છે...',
      askQuestionPlaceholder: 'હવામાન, વરસાદ, પાક કે ચેતવણી વિશે પૂછો...',
      disclaimer: 'WeatherNova સમગ્ર ભારત માટે રીઅલ-ટાઇમ હવામાન બુદ્ધિમત્તા પ્રદાન કરે છે.',
      switchLanguage: 'ભાષા',
      autoSpeak: 'જવાબ આપોઆપ બોલો',
      active: 'સક્રિય',
      collapseSidebar: 'સાઇડબાર છુપાવો',
      expandSidebar: 'સાઇડબાર દર્શાવો',
      today: 'આજે',
      tomorrow: 'આવતીકાલે',
      forecast7Days: '7 દિવસનું હવામાન પૂર્વાનુમાન',
      hourlyForecast: 'કલાકદીઠ હવામાન (24 કલાક)',
      nwpConsensus: 'મોડેલ સર્વસંમતિ (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI ને પૂછો',
      listen: 'સાંભળો (ગુજરાતી)',
      stopVoice: 'અવાજ બંધ કરો',
      copy: 'કોપી',
      copied: 'કોપી થયું',
      share: 'શેર કરો'
    },
    metrics: {
      temp: 'તાપમાન',
      feelsLike: 'અનુભવ',
      high: 'મહત્તમ',
      low: 'લઘુત્તમ',
      rainProb: 'વરસાદની શક્યતા',
      precipitation: 'વરસાદનું પ્રમાણ',
      humidity: 'ભેજનું પ્રમાણ',
      wind: 'પવનની ગતિ',
      windDirection: 'દિશા',
      gusts: 'પવનના ઝાપટાં',
      pressure: 'વાયુનું દબાણ',
      uvIndex: 'યુવી ઇન્ડેક્સ',
      airQuality: 'હવાની ગુણવત્તા (AQI)',
      cloudCover: 'વાદળોનું પ્રમાણ',
      dewPoint: 'ઝાકળ બિંદુ',
      visibility: 'દ્રશ્યતા',
      sunrise: 'સૂર્યોદય',
      sunset: 'સૂર્યાસ્ત'
    },
    alerts: {
      title: 'આપત્તિ અને હવામાન ચેતવણીઓ (CAP Alerts)',
      noAlerts: 'આ સ્થળ માટે હાલ કોઈ ગંભીર હવામાન ચેતવણી સક્રિય નથી',
      all: 'બધા એલર્ટ',
      red: 'રેડ એલર્ટ (તાત્કાલિક સાવચેતી)',
      orange: 'ઓરેન્જ એલર્ટ (તૈયાર રહો)',
      yellow: 'યલો એલર્ટ (સતર્ક રહો)',
      green: 'ગ્રીન (સામાન્ય)',
      safetyTips: 'રાષ્ટ્રીય આપત્તિ વ્યવસ્થાપન (NDMA) માર્ગદર્શિકા',
      emergencyHelpline: 'કટોકટી હેલ્પલાઇન: 112 | આપત્તિ નિયંત્રણ: 1070',
      severity: 'તીવ્રતા',
      effectiveTill: 'માન્ય સમય'
    },
    sectors: {
      title: 'ક્ષેત્રીય નિર્ણય વ્યવસ્થા',
      subtitle: 'કૃષિ વિજ્ઞાન, દરિયાઈ ચેતવણી અને આપત્તિ વ્યવસ્થાપન માર્ગદર્શન.',
      agriculture: 'કૃષિ અને પાક સલાહ',
      marine: 'દરિયાઈ અને માછીમારી',
      health: 'આરોગ્ય અને ગરમીનું નિયંત્રણ',
      disaster: 'આપત્તિ વ્યવસ્થાપન',
      irrigation: 'સિંચાઈ માર્ગદર્શન',
      spraying: 'દવા/ખાતર છંટકાવ અનુકૂળતા',
      pestRisk: 'રોગ-જીવાત અને સૂક્ષ્મ વાતાવરણ જોખમ',
      seaCondition: 'દરિયાની સ્થિતિ',
      waveHeight: 'મોજાંની ઊંચાઈ',
      fishermanWarning: 'માછીમારો માટે સત્તાવાર દરિયાઈ ચેતવણી',
      heatIndex: 'હીટ ઇન્ડેક્સ અને ગરમીનું જોખમ',
      hydration: 'પાણી પીવા અને તડકાથી બચવાની સલાહ',
      vulnerableGroups: 'વૃદ્ધો અને બાળકોની સંભાળ',
      primaryCrops: 'સ્થાનિક મુખ્ય પાકો',
      emergencyActions: 'કટોકટી પગલાંની સૂચિ'
    },
    climate: {
      title: '10 વર્ષના હવામાન પ્રવાહો અને ફેરફારો',
      subtitle: 'છેલ્લા 10 વર્ષમાં તાપમાન અને વરસાદના બદલાવનું વિશ્લેષણ.',
      meanRainfall: '10-વર્ષની સરેરાશ વરસાદ',
      heatwaveDays: 'હીટવેવના દિવસો',
      extremeRainDays: 'ભારે વરસાદના દિવસો (>65mm)',
      monsoonShift: 'ચોમાસાના આગમન અને વિદાયમાં ફેરફાર',
      annualTrajectory: 'વાર્ષિક વરસાદ પ્રવાહ (2016–2025)',
      eventFrequency: 'તીવ્ર હવામાન ઘટનાઓનું વલણ',
      tempEvolution: 'ઉનાળુ સરેરાશ મહત્તમ તાપમાન (°C)',
      monthlyClimatology: 'માસિક સામાન્ય વિરુદ્ધ નોંધાયેલ વરસાદ',
      synthesis: 'આબોહવા સારાંશ',
      explainTrend: '10 વર્ષનું વલણ સમજો'
    },
    authModal: {
      loginTitle: 'WeatherNova એકાઉન્ટ',
      loginDesc: 'લૉગ ઇન કરવું સંપૂર્ણપણે મરજિયાત છે. જો તમે લૉગ ઇન કરશો, તો તમારી વાતચીતનો ઇતિહાસ કાયમ માટે સચવાશે અને ફરી આવો ત્યારે જોવા મળશે.',
      nameLabel: 'તમારું નામ',
      namePlaceholder: 'દા.ત. નરેશભાઈ પટેલ',
      emailLabel: 'ઈમેલ એડ્રેસ',
      emailPlaceholder: 'દા.ત. naresh@example.com',
      signInBtn: 'લૉગ ઇન કરો અને ઇતિહાસ સાચવો',
      continueGuest: 'ગેસ્ટ તરીકે ચાલુ રાખો (ઇતિહાસ સાચવવામાં નહીં આવે)',
      signedInAs: 'લૉગ ઇન થયેલ એકાઉન્ટ:',
      optionalNotice: 'પાસવર્ડની જરૂર નથી. લૉગિન સંપૂર્ણ વૈકલ્પિક છે.'
    }
  },
  kn: {
    nav: {
      chat: 'ಹವಾಮಾನ ಸಂವಾದ',
      chat_sub: 'ಎಐ ಹವಾಮಾನ ಸಹಾಯಕ',
      dashboard: 'ಹವಾಮಾನ ಮತ್ತು ಮಾದರಿಗಳು',
      dashboard_sub: 'ಮಾದರಿಗಳು, ರಡಾರ್ ಮತ್ತು ಅಂಕಿಅಂಶ',
      alerts: 'ವಿಪತ್ತು ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ',
      alerts_sub: 'ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ',
      advisories: 'ಕೃಷಿ ಮತ್ತು ಕರಾವಳಿ ಸಲಹೆ',
      advisories_sub: 'ವಲಯವಾರು ನಿರ್ಧಾರ ಬೆಂಬಲ',
      map: 'ಜಿಐಎಸ್ ರಡಾರ್ ಮತ್ತು ಉಪಗ್ರಹ',
      map_sub: 'ನಕ್ಷೆ ಮತ್ತು ಮೋಡ ರಡಾರ್',
      climate: 'ದಶಕದ ಹವಾಮಾನ ಬದಲಾವಣೆ',
      climate_sub: '10 ವರ್ಷಗಳ ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',
      decision_intel: 'ನಿರ್ಧಾರ ಬುದ್ಧಿಮತ್ತೆ'
    },
    actions: {
      newChat: 'ಹೊಸ ಹವಾಮಾನ ಚರ್ಚೆ',
      selectLocation: 'ಸ್ಥಳ (ಸಮಗ್ರ ಭಾರತ)',
      detectLocation: 'ನನ್ನ ಲೈವ್ ಸ್ಥಳ ಹುಡುಕಿ',
      detectingLocation: 'ಸ್ಥಳವನ್ನು ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...',
      login: 'ಲಾಗಿನ್ ಮಾಡಿ',
      logout: 'ಲಾಗ್ ಔಟ್',
      myAccount: 'ನನ್ನ ಖಾತೆ',
      guest: 'ಅತಿಥಿ ಮೋಡ್',
      loginToSaveHistory: 'ಸಂಭಾಷಣೆಯ ಇತಿಹಾಸವನ್ನು ಉಳಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ',
      recentChats: 'ಇತ್ತೀಚಿನ ಸಂಭಾಷಣೆಗಳು',
      noRecentChats: 'ಹಿಂದಿನ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ',
      noSavedChats: 'ಅತಿಥಿ ಮೋಡ್‌ನಲ್ಲಿ ಇತಿಹಾಸ ಉಳಿಸಲಾಗುವುದಿಲ್ಲ',
      searchLocationPlaceholder: 'ಗ್ರಾಮ, ತಾಲೂಕು, ಜಿಲ್ಲೆ ಅಥವಾ ನಗರ ಹುಡುಕಿ...',
      send: 'ಕಳುಹಿಸಿ',
      listening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
      askQuestionPlaceholder: 'ಹವಾಮಾನ, ಮಳೆ, ಬೆಳೆ ಅಥವಾ ಮುನ್ನೆಚ್ಚರಿಕೆ ಬಗ್ಗೆ ಕೇಳಿ...',
      disclaimer: 'WeatherNova ಭಾರತಕ್ಕಾಗಿ ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ.',
      switchLanguage: 'ಭಾಷೆ',
      autoSpeak: 'ಧ್ವನಿ ಮೂಲಕ ಉತ್ತರಿಸಿ',
      active: 'ಸಕ್ರಿಯ',
      collapseSidebar: 'ಸೈಡ್‌ಬಾರ್ ಮರೆಮಾಡಿ',
      expandSidebar: 'ಸೈಡ್‌ಬಾರ್ ತೋರಿಸಿ',
      today: 'ಇಂದು',
      tomorrow: 'ನಾಳೆ',
      forecast7Days: '7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      hourlyForecast: 'ಪ್ರತಿ ಗಂಟೆಯ ಪ್ರವೃತ್ತಿ (24 ಗಂಟೆಗಳು)',
      nwpConsensus: 'ಮುನ್ಸೂಚನಾ ಮಾದರಿಗಳು (GFS, ECMWF, WRF)',
      askAi: 'WeatherNova AI ಕೇಳಿ',
      listen: 'ಆಲಿಸಿ (ಕನ್ನಡ)',
      stopVoice: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      copy: 'ಕಾಪಿ',
      copied: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ',
      share: 'ಹಂಚಿಕೊಳ್ಳಿ'
    },
    metrics: {
      temp: 'ತಾಪಮಾನ',
      feelsLike: 'ಅನುಭವ',
      high: 'ಗರಿಷ್ಠ',
      low: 'ಕನಿಷ್ಠ',
      rainProb: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
      precipitation: 'ಮಳೆ ಪ್ರಮಾಣ',
      humidity: 'ಆರ್ದ್ರತೆ',
      wind: 'ಗಾಳಿಯ ವೇಗ',
      windDirection: 'ದಿಕ್ಕು',
      gusts: 'ಬಿರುಗಾಳಿ',
      pressure: 'ವಾಯುಭಾರ',
      uvIndex: 'ಯುವಿ ಸೂಚ್ಯಂಕ',
      airQuality: 'ವಾಯು ಗುಣಮಟ್ಟ (AQI)',
      cloudCover: 'ಮೋಡದ ಪ್ರಮಾಣ',
      dewPoint: 'ಇಬ್ಬನಿ ಬಿಂದು',
      visibility: 'ಗೋಚರತೆ',
      sunrise: 'ಸೂರ್ಯೋದಯ',
      sunset: 'ಸೂರ್ಯಾಸ್ತ'
    },
    alerts: {
      title: 'ವಿಪತ್ತು ಮತ್ತು ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು (CAP)',
      noAlerts: 'ಈ ಸ್ಥಳಕ್ಕೆ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ',
      all: 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು',
      red: 'ರೆಡ್ ಅಲರ್ಟ್ (ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ)',
      orange: 'ಆರೆಂಜ್ ಅಲರ್ಟ್ (ಸಿದ್ಧರಾಗಿರಿ)',
      yellow: 'ಯೆಲ್ಲೋ ಅಲರ್ಟ್ (ಜಾಗರೂಕರಾಗಿರಿ)',
      green: 'ಗ್ರೀನ್ (ಸಾಮಾನ್ಯ)',
      safetyTips: 'ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ (NDMA) ಮಾರ್ಗಸೂಚಿಗಳು',
      emergencyHelpline: 'ತುರ್ತು ಸಹಾಯವಾಣಿ: 112 | ವಿಪತ್ತು ನಿಯಂತ್ರಣ: 1070',
      severity: 'ತೀವ್ರತೆ',
      effectiveTill: 'ಮಾನ್ಯತೆ ಅವಧಿ'
    },
    sectors: {
      title: 'ವಲಯವಾರು ನಿರ್ಧಾರ ಬೆಂಬಲ',
      subtitle: 'ಕೃಷಿ ಹವಾಮಾನ, ಕರಾವಳಿ ಎಚ್ಚರಿಕೆ ಮತ್ತು ವಿಪತ್ತು ನಿರ್ವಹಣೆ ಮಾರ್ಗದರ್ಶನ.',
      agriculture: 'ಕೃಷಿ ಮತ್ತು ಬೆಳೆಗಳು',
      marine: 'ಕರಾವಳಿ ಮತ್ತು ಮೀನುಗಾರಿಕೆ',
      health: 'ಆರೋಗ್ಯ ಮತ್ತು ತಾಪಮಾನ ನಿಯಂತ್ರಣ',
      disaster: 'ವಿಪತ್ತು ನಿರ್ವಹಣೆ',
      irrigation: 'ನೀರಾವರಿ ಸಲಹೆ',
      spraying: 'ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಸಮಯ',
      pestRisk: 'ರೋಗ-ಕೀಟ ಬಾಧೆಯ ಅಪಾಯ',
      seaCondition: 'ಸಮುದ್ರದ ಸ್ಥಿತಿ',
      waveHeight: 'ಅಲೆಗಳ ಎತ್ತರ',
      fishermanWarning: 'ಮೀನುಗಾರರಿಗೆ ಕರಾವಳಿ ಎಚ್ಚರಿಕೆ',
      heatIndex: 'ಶಾಖ ಸೂಚ್ಯಂಕ ಮತ್ತು ಅಪಾಯ',
      hydration: 'ನೀರಿನ ಸೇವನೆ ಮತ್ತು ರಕ್ಷಣೆ',
      vulnerableGroups: 'ಮಕ್ಕಳು ಮತ್ತು ಹಿರಿಯರ ಕಾಳಜಿ',
      primaryCrops: 'ಪ್ರಮುಖ ಪ್ರಾದೇಶಿಕ ಬೆಳೆಗಳು',
      emergencyActions: 'ತುರ್ತು ಸಿದ್ಧತೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ'
    },
    climate: {
      title: '10 ವರ್ಷಗಳ ಹವಾಮಾನ ಪ್ರವೃತ್ತಿಗಳು ಮತ್ತು ಬದಲಾವಣೆಗಳು',
      subtitle: 'ಕಳೆದ ಒಂದು ದಶಕದ ಮಳೆ ಮತ್ತು ತಾಪಮಾನದ ಅವಲೋಕನ.',
      meanRainfall: '10 ವರ್ಷಗಳ ಸರಾಸರಿ ಮಳೆ',
      heatwaveDays: 'ಬಿಸಿಗಾಳಿಯ ದಿನಗಳು',
      extremeRainDays: 'ಭಾರೀ ಮಳೆಯ ದಿನಗಳು (>65mm)',
      monsoonShift: 'ಮುಂಗಾರು ಆರಂಭ ಮತ್ತು ಅವಧಿಯಲ್ಲಿ ಬದಲಾವಣೆ',
      annualTrajectory: 'ವಾರ್ಷಿಕ ಮಳೆ ಪ್ರವೃತ್ತಿ (2016–2025)',
      eventFrequency: 'ತೀವ್ರ ಹವಾಮಾನ ಘಟನೆಗಳ ಪ್ರವೃತ್ತಿ',
      tempEvolution: 'ಬೇಸಿಗೆಯ ಸರಾಸರಿ ಗರಿಷ್ಠ ತಾಪಮಾನ (°C)',
      monthlyClimatology: 'ಮಾಸಿಕ ಸಾಮಾನ್ಯ ಮತ್ತು ದಾಖಲಾದ ಮಳೆ',
      synthesis: 'ಹವಾಮಾನ ಸಾರಾಂಶ',
      explainTrend: '10 ವರ್ಷಗಳ ಪ್ರವೃತ್ತಿ ತಿಳಿಯಿರಿ'
    },
    authModal: {
      loginTitle: 'WeatherNova ಖಾತೆ',
      loginDesc: 'ಲಾಗಿನ್ ಸಂಪೂರ್ಣವಾಗಿ ಐಚ್ಛಿಕವಾಗಿದೆ. ನೀವು ಲಾಗಿನ್ ಆದರೆ, ಸಂಭಾಷಣೆ ಇತಿಹಾಸ ಕಾಯಂ ಆಗಿ ಉಳಿಯುತ್ತದೆ.',
      nameLabel: 'ನಿಮ್ಮ ಹೆಸರು',
      namePlaceholder: 'ಉದಾ. ಸುರೇಶ್ ಗೌಡ',
      emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
      emailPlaceholder: 'ಉದಾ. suresh@example.com',
      signInBtn: 'ಲಾಗಿನ್ ಮಾಡಿ ಮತ್ತು ಇತಿಹಾಸ ಉಳಿಸಿ',
      continueGuest: 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ (ಇತಿಹಾಸ ಉಳಿಯುವುದಿಲ್ಲ)',
      signedInAs: 'ಲಾಗಿನ್ ಆದ ಖಾತೆ:',
      optionalNotice: 'ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ. ಲಾಗಿನ್ ಐಚ್ಛಿಕವಾಗಿದೆ.'
    }
  },
  ml: {
    nav: {
      chat: 'കാലാവസ്ഥ സംവാദം',
      chat_sub: 'എഐ കാലാവസ്ഥ സഹായി',
      dashboard: 'കാലാവസ്ഥയും മോഡലുകളും',
      dashboard_sub: 'മോഡലുകൾ, റഡാർ, സ്ഥിതിവിവരങ്ങൾ',
      alerts: 'ദുരന്ത നിവാരണ മുന്നറിയിപ്പുകൾ',
      alerts_sub: 'തീവ്ര കാലാവസ്ഥാ റഡാർ',
      advisories: 'കൃഷിയും തീരദേശ നിർദ്ദേശങ്ങളും',
      advisories_sub: 'മേഖലാതല നിർദ്ദേശങ്ങൾ',
      map: 'ജിഐഎസ് റഡാറും ഉപഗ്രഹവും',
      map_sub: 'ഭൂപടവും മേഘ റഡാറും',
      climate: 'കാലാവസ്ഥാ വ്യതിയാന പ്രവണതകൾ',
      climate_sub: '10 വർഷത്തെ കാലാവസ്ഥാ മാറ്റം',
      decision_intel: 'തീരുമാന ബുദ്ധിശക്തി'
    },
    actions: {
      newChat: 'പുതിയ കാലാവസ്ഥ സംവാദം',
      selectLocation: 'സ്ഥലം (ഇന്ത്യ മുഴുവൻ)',
      detectLocation: 'എന്റെ ലൊക്കേഷൻ കണ്ടെത്തുക',
      detectingLocation: 'ലൊക്കേഷൻ കണ്ടെത്തുന്നു...',
      login: 'ലോഗിൻ ചെയ്യുക',
      logout: 'ലോഗ് ഔട്ട്',
      myAccount: 'എന്റെ അക്കൗണ്ട്',
      guest: 'ഗസ്റ്റ് മോഡ്',
      loginToSaveHistory: 'സംഭാഷണ ചരിത്രം സ്ഥിരമായി സൂക്ഷിക്കാൻ ലോഗിൻ ചെയ്യുക',
      recentChats: 'സമീപകാല സംഭാഷണങ്ങൾ',
      noRecentChats: 'മുൻകാല സംഭാഷണങ്ങളൊന്നുമില്ല',
      noSavedChats: 'ഗസ്റ്റ് മോഡിൽ സംഭാഷണങ്ങൾ സംരക്ഷിക്കപ്പെടുന്നില്ല',
      searchLocationPlaceholder: 'ഗ്രാമം, താലൂക്ക്, ജില്ല അല്ലെങ്കിൽ നഗരം തിരയുക...',
      send: 'അയക്കുക',
      listening: 'കേൾക്കുന്നു...',
      askQuestionPlaceholder: 'കാലാവസ്ഥ, മഴ, കൃഷി, മുന്നറിയിപ്പുകൾ എന്നിവ ചോദിക്കുക...',
      disclaimer: 'WeatherNova ഇന്ത്യയിലെ തത്സമയ കാലാവസ്ഥാ വിവരങ്ങൾ നൽകുന്നു.',
      switchLanguage: 'ഭാഷ',
      autoSpeak: 'ശബ്ദത്തിലൂടെ ഉത്തരം കേൾക്കുക',
      active: 'സജീവം',
      collapseSidebar: 'സൈഡ്‌ബാർ മറയ്ക്കുക',
      expandSidebar: 'സൈഡ്‌ബാർ കാണിക്കുക',
      today: 'ഇന്ന്',
      tomorrow: 'നാളെ',
      forecast7Days: '7 ദിവസത്തെ കാലാവസ്ഥാ പ്രവചനം',
      hourlyForecast: 'മണിക്കൂർ തോറുമുള്ള പ്രവണത (24 മണിക്കൂർ)',
      nwpConsensus: 'പ്രവചന മോഡലുകൾ (GFS, ECMWF, WRF)',
      askAi: 'WeatherNova AI യോട് ചോദിക്കുക',
      listen: 'കേൾക്കുക (മലയാളം)',
      stopVoice: 'ശബ്ദം നിർത്തുക',
      copy: 'പകർത്തുക',
      copied: 'പകർത്തി',
      share: 'പങ്കുവെക്കുക'
    },
    metrics: {
      temp: 'താപനില',
      feelsLike: 'അനുഭവപ്പെടുന്നത്',
      high: 'പരമാവധി',
      low: 'കുറഞ്ഞത്',
      rainProb: 'മഴ സാധ്യത',
      precipitation: 'മഴയുടെ അളവ്',
      humidity: 'ഈർപ്പം',
      wind: 'കാറ്റിന്റെ വേഗത',
      windDirection: 'ദിശ',
      gusts: 'കാറ്റടിച്ചിൽ',
      pressure: 'വായുമർദ്ദം',
      uvIndex: 'യുവി സൂചിക',
      airQuality: 'വായു ഗുണനിലവാരം (AQI)',
      cloudCover: 'മേഘാവൃതത',
      dewPoint: 'മഞ്ഞുബിന്ദു',
      visibility: 'ദൃശ്യപരത',
      sunrise: 'സൂര്യോദയം',
      sunset: 'സൂര്യാസ്തമയം'
    },
    alerts: {
      title: 'ദുരന്ത കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ (CAP)',
      noAlerts: 'ഈ പ്രദേശത്ത് നിലവിൽ കഠിനമായ കാലാവസ്ഥാ മുന്നറിയിപ്പുകളൊന്നുമില്ല',
      all: 'എല്ലാ മുന്നറിയിപ്പുകളും',
      red: 'റെഡ് അലർട്ട് (ഉടൻ ജാഗ്രത പാലിക്കുക)',
      orange: 'ഓറഞ്ച് അലർട്ട് (തയ്യാറെടുക്കുക)',
      yellow: 'യെല്ലോ അലർട്ട് (ശ്രദ്ധിക്കുക)',
      green: 'ഗ്രീൻ (സാധാരണം)',
      safetyTips: 'ദേശീയ ദുരന്ത നിവാരണ അതോറിറ്റി (NDMA) നിർദ്ദേശങ്ങൾ',
      emergencyHelpline: 'അടിയന്തര സഹായം: 112 | ദുരന്ത നിവാരണം: 1070',
      severity: 'തീവ്രത',
      effectiveTill: 'കാലാവധി'
    },
    sectors: {
      title: 'മേഖലാതല തീരുമാന പിന്തുണ',
      subtitle: 'കാർഷിക കാലാവസ്ഥ, തീരദേശ മുന്നറിയിപ്പുകൾ, ദുരന്ത നിവാരണം.',
      agriculture: 'കൃഷിയും വിളകളും',
      marine: 'തീരദേശവും മത്സ്യബന്ധനവും',
      health: 'ആരോഗ്യവും ചൂട് പ്രതിരോധവും',
      disaster: 'ദുരന്ത നിവാരണം',
      irrigation: 'നനയ്ക്കൽ നിർദ്ദേശം',
      spraying: 'കീടനാശിനി തളിക്കൽ സമയം',
      pestRisk: 'കീട-രോഗ സാധ്യത',
      seaCondition: 'കടൽ അവസ്ഥ',
      waveHeight: 'തിരമാലയുടെ ഉയരം',
      fishermanWarning: 'മത്സ്യത്തൊഴിലാളികൾക്കുള്ള തീരദേശ മുന്നറിയിപ്പ്',
      heatIndex: 'ചൂട് സൂചികയും അപായ സാധ്യതയും',
      hydration: 'ധാരാളം വെള്ളം കുടിക്കുക, വെയിൽ ഏൽക്കാതിരിക്കുക',
      vulnerableGroups: 'കുട്ടികളുടെയും മുതിർന്നവരുടെയും സംരക്ഷണം',
      primaryCrops: 'പ്രധാന പ്രാദേശിക വിളകൾ',
      emergencyActions: 'അടിയന്തര നടപടികളുടെ പട്ടിക'
    },
    climate: {
      title: '10 വർഷത്തെ കാലാവസ്ഥാ വ്യതിയാന പ്രവണതകൾ',
      subtitle: 'കഴിഞ്ഞ ദശകത്തിലെ മഴയും താപനിലയും സംബന്ധിച്ച വിശകലനം.',
      meanRainfall: '10 വർഷത്തെ ശരാശരി മഴ',
      heatwaveDays: 'ഉഷ്ണതരംഗ ദിനങ്ങൾ',
      extremeRainDays: 'അതിതീവ്ര മഴ ദിനങ്ങൾ (>65mm)',
      monsoonShift: 'കാലവർഷത്തിന്റെ തുടക്കത്തിലും ദൈർഘ്യത്തിലും മാറ്റം',
      annualTrajectory: 'വാർഷിക മഴ പ്രവണത (2016–2025)',
      eventFrequency: 'തീവ്ര കാലാവസ്ഥാ സംഭവങ്ങളുടെ പ്രവണത',
      tempEvolution: 'വേനൽക്കാല ശരാശരി പരമാവധി താപനില (°C)',
      monthlyClimatology: 'പ്രതിമാസ സാധാരണവും രേഖപ്പെടുത്തിയതുമായ മഴ',
      synthesis: 'കാലാവസ്ഥാ സംഗ്രഹം',
      explainTrend: '10 വർഷത്തെ പ്രവണത മനസ്സിലാക്കുക'
    },
    authModal: {
      loginTitle: 'WeatherNova അക്കൗണ്ട്',
      loginDesc: 'ലോഗിൻ ചെയ്യുന്നത് പൂർണ്ണമായും ഓപ്ഷണലാണ്. ലോഗിൻ ചെയ്താൽ സംഭാഷണ ചരിത്രം സുരക്ഷിതമായി സൂക്ഷിക്കപ്പെടും.',
      nameLabel: 'നിങ്ങളുടെ പേര്',
      namePlaceholder: 'ഉദാ. മോഹൻ കുമാർ',
      emailLabel: 'ഇമെയിൽ വിലാസം',
      emailPlaceholder: 'ഉദാ. mohan@example.com',
      signInBtn: 'ലോഗിൻ ചെയ്ത് ചരിത്രം സംരക്ഷിക്കുക',
      continueGuest: 'ഗസ്റ്റായി തുടരുക (ചരിത്രം സൂക്ഷിക്കില്ല)',
      signedInAs: 'ലോഗിൻ ചെയ്ത അക്കൗണ്ട്:',
      optionalNotice: 'പാസ്‌വേഡ് ആവശ്യമില്ല. ലോഗിൻ ഓപ്ഷണലാണ്.'
    }
  },
  mr: {
    nav: {
      chat: 'हवामान संवाद',
      chat_sub: 'एआय हवामान सहाय्यक व आवाज',
      dashboard: 'सखोल हवामान व मॉडेल्स',
      dashboard_sub: 'हवामान अंदाज मॉडेल्स, रडार व आकडेवारी',
      alerts: 'आपत्ती व सीएपी अलर्ट',
      alerts_sub: 'गंभीर हवामान सूचना व रडार',
      advisories: 'कृषी व सागरी सल्ला',
      advisories_sub: 'क्षेत्रीय निर्णय प्रणाली',
      map: 'जीआयएस रडार व उपग्रह',
      map_sub: 'नकाशा व ढग रडार',
      climate: 'दशकीय हवामान बदल',
      climate_sub: 'गेल्या १० वर्षांचे हवामान विश्लेषण',
      decision_intel: 'निर्णय बुद्धिमत्ता'
    },
    actions: {
      newChat: 'नवीन हवामान संवाद',
      selectLocation: 'स्थान (संपूर्ण भारत)',
      detectLocation: 'माझे थेट स्थान शोधा',
      detectingLocation: 'स्थान शोधत आहे...',
      login: 'लॉग इन करा',
      logout: 'लॉग आउट',
      myAccount: 'माझे खाते',
      guest: 'अतिथी मोड',
      loginToSaveHistory: 'संभाषणाचा इतिहास कायमस्वरूपी जतन करण्यासाठी लॉग इन करा',
      recentChats: 'अलीकडील संभाषणे',
      noRecentChats: 'कोणतीही जुनी संभाषणे नाहीत',
      noSavedChats: 'अतिथी मोडमध्ये इतिहास कायम जतन केला जात नाही',
      searchLocationPlaceholder: 'गाव, तालुका, जिल्हा किंवा शहर शोधा...',
      send: 'पाठवा',
      listening: 'ऐकत आहे...',
      askQuestionPlaceholder: 'हवामान, पाऊस, पिके किंवा अलर्टबद्दल विचारा...',
      disclaimer: 'WeatherNova भारतासाठी रिअल-टाइम हवामान बुद्धिमत्ता प्रदान करते.',
      switchLanguage: 'भाषा',
      autoSpeak: 'आवाजात उत्तर ऐका',
      active: 'सक्रिय',
      collapseSidebar: 'साइडबार लपवा',
      expandSidebar: 'साइडबार दाखवा',
      today: 'आज',
      tomorrow: 'उद्या',
      forecast7Days: '७ दिवसांचा हवामान अंदाज',
      hourlyForecast: 'तासाभराचा अंदाज (२४ तास)',
      nwpConsensus: 'हवामान मॉडेल्स एकमत (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI ला विचारा',
      listen: 'ऐका (मराठी)',
      stopVoice: 'आवाज थांबवा',
      copy: 'कॉपी',
      copied: 'कॉपी केले',
      share: 'शेअर करा'
    },
    metrics: {
      temp: 'तापमान',
      feelsLike: 'जाणवणारे तापमान',
      high: 'कमाल',
      low: 'किमान',
      rainProb: 'पावसाची शक्यता',
      precipitation: 'पावसाचे प्रमाण',
      humidity: 'दमटपणा (आर्द्रता)',
      wind: 'वाऱ्याचा वेग',
      windDirection: 'दिशा',
      gusts: 'झोत',
      pressure: 'हवेचा दाब',
      uvIndex: 'यूव्ही इंडेक्स',
      airQuality: 'हवेची गुणवत्ता (AQI)',
      cloudCover: 'ढगाळ वातावरण',
      dewPoint: 'दव बिंदू',
      visibility: 'दृश्यमानता',
      sunrise: 'सूर्योदय',
      sunset: 'सूर्यास्त'
    },
    alerts: {
      title: 'आपत्ती व हवामान सीएपी सूचना',
      noAlerts: 'या स्थानासाठी सध्या कोणतीही गंभीर हवामान सूचना सक्रिय नाही',
      all: 'सर्व अलर्ट',
      red: 'रेड अलर्ट (तातडीने खबरदारी घ्या)',
      orange: 'ऑरेंज अलर्ट (सज्ज राहा)',
      yellow: 'यलो अलर्ट (दक्ष राहा)',
      green: 'ग्रीन (सामान्य)',
      safetyTips: 'राष्ट्रीय आपत्ती व्यवस्थापन (NDMA) नियमावली',
      emergencyHelpline: 'आपत्कालीन हेल्पलाइन: 112 | आपत्ती नियंत्रण: 1070',
      severity: 'तीव्रता',
      effectiveTill: 'वैधता'
    },
    sectors: {
      title: 'क्षेत्रीय निर्णय प्रणाली',
      subtitle: 'कृषी हवामान, किनारपट्टी सल्ला व आपत्ती व्यवस्थापन दिशा-निर्देश.',
      agriculture: 'शेती व पिके',
      marine: 'किनारपट्टी व मासेमारी',
      health: 'आरोग्य व उष्णता लाट निवारण',
      disaster: 'आपत्ती व्यवस्थापन',
      irrigation: 'पाणी व्यवस्थापन सल्ला',
      spraying: 'कीटकनाशक फवारणी वेळ',
      pestRisk: 'रोग-कीड हवामान धोका',
      seaCondition: 'समुद्राची स्थिती',
      waveHeight: 'लाटांची उंची',
      fishermanWarning: 'मासेमारांसाठी किनारपट्टी इशारा',
      heatIndex: 'उष्णता निर्देशांक व ताण',
      hydration: 'पाणी पिणे व उन्हापासून संरक्षण',
      vulnerableGroups: 'वृद्ध व लहान मुलांची काळजी',
      primaryCrops: 'स्थानिक प्रमुख पिके',
      emergencyActions: 'आपत्कालीन कृती यादी'
    },
    climate: {
      title: '१० वर्षांचे हवामान प्रवाह आणि बदल',
      subtitle: 'गेल्या दशकातील पर्जन्य आणि तापमानातील बदलांचे विश्लेषण.',
      meanRainfall: '१० वर्षांची सरासरी पर्जन्यवृष्टी',
      heatwaveDays: 'उष्णतेच्या लाटेचे दिवस',
      extremeRainDays: 'मुसळधार पावसाचे दिवस (>65mm)',
      monsoonShift: 'मान्सून आगमन व कालावधीत बदल',
      annualTrajectory: 'वार्षिक पाऊस प्रवाह (2016–2025)',
      eventFrequency: 'तीव्र हवामान घटनांचा कल',
      tempEvolution: 'उन्हाळ्यातील सरासरी कमाल तापमान (°C)',
      monthlyClimatology: 'मासिक सामान्य वि. नोंदवलेला पाऊस',
      synthesis: 'हवामान सारांश',
      explainTrend: '१० वर्षांचा कल समजून घ्या'
    },
    authModal: {
      loginTitle: 'WeatherNova खाते',
      loginDesc: 'लॉग इन करणे पूर्णपणे ऐच्छिक आहे. आपण लॉग इन केल्यास आपला संभाषण इतिहास कायमचा जतन राहील.',
      nameLabel: 'आपले नाव',
      namePlaceholder: 'उदा. सचिन पाटील',
      emailLabel: 'ईमेल पत्ता',
      emailPlaceholder: 'उदा. sachin@example.com',
      signInBtn: 'लॉग इन करा आणि इतिहास जतन करा',
      continueGuest: 'अतिथी म्हणून सुरू ठेवा (इतिहास जतन होणार नाही)',
      signedInAs: 'लॉग इन केलेले खाते:',
      optionalNotice: 'पासवर्डची गरज नाही. लॉग इन पूर्णपणे ऐच्छिक आहे.'
    }
  },
  ta: {
    nav: {
      chat: 'வானிலை உரையாடல்',
      chat_sub: 'வானிலை செயற்கை நுண்ணறிவு',
      dashboard: 'வானிலை மற்றும் மாதிரிகள்',
      dashboard_sub: 'வானிலை மாதிரிகள், ரேடார் மற்றும் அளவீடுகள்',
      alerts: 'பேரிடர் மற்றும் எச்சரிக்கைகள்',
      alerts_sub: 'தீவிர வானிலை ரேடார்',
      advisories: 'வேளாண் மற்றும் கடல்சார் ஆலோசனை',
      advisories_sub: 'துறைசார் முடிவு ஆதரவு',
      map: 'ஜிஐஎஸ் ரேடார் மற்றும் செயற்கைக்கோள்',
      map_sub: 'வரைபடம் மற்றும் மேக ரேடார்',
      climate: 'பத்தாண்டு காலநிலை மாற்றங்கள்',
      climate_sub: '10 ஆண்டு காலநிலை பகுப்பாய்வு',
      decision_intel: 'முடிவு நுண்ணறிவு'
    },
    actions: {
      newChat: 'புதிய வானிலை உரையாடல்',
      selectLocation: 'இடம் (இந்தியா முழுவதும்)',
      detectLocation: 'எனது நேரலை இருப்பிடத்தைக் கண்டுபிடி',
      detectingLocation: 'இருப்பிடம் கண்டறியப்படுகிறது...',
      login: 'உள்நுழையவும்',
      logout: 'வெளியேறு',
      myAccount: 'எனது கணக்கு',
      guest: 'விருந்தினர் முறை',
      loginToSaveHistory: 'உரையாடல் வரலாற்றை நிரந்தரமாகச் சேமிக்க உள்நுழையவும்',
      recentChats: 'சமீபத்திய உரையாடல்கள்',
      noRecentChats: 'முந்தைய உரையாடல்கள் எதுவும் இல்லை',
      noSavedChats: 'விருந்தினர் முறையில் வரலாறு சேமிக்கப்படாது',
      searchLocationPlaceholder: 'கிராமம், வட்டம், மாவட்டம் அல்லது நகரம் தேடவும்...',
      send: 'அனுப்பு',
      listening: 'கேட்கிறது...',
      askQuestionPlaceholder: 'வானிலை, மழை, பயிர் அல்லது எச்சரிக்கை பற்றி கேட்கவும்...',
      disclaimer: 'WeatherNova இந்தியாவிற்கான நிகழ்நேர வானிலை தகவல்களை வழங்குகிறது.',
      switchLanguage: 'மொழி',
      autoSpeak: 'குரல் மூலம் பதிலைக் கேட்கவும்',
      active: 'செயலில்',
      collapseSidebar: 'பக்கப்பட்டியை மறைக்கவும்',
      expandSidebar: 'பக்கப்பட்டியைக் காட்டவும்',
      today: 'இன்று',
      tomorrow: 'நாளை',
      forecast7Days: '7 நாள் வானிலை முன்னறிவிப்பு',
      hourlyForecast: 'மணிநேர போக்கு (24 மணிநேரம்)',
      nwpConsensus: 'வானிலை மாதிரிகள் (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI-யிடம் கேளுங்கள்',
      listen: 'கேளுங்கள் (தமிழ்)',
      stopVoice: 'குரலை நிறுத்து',
      copy: 'நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது',
      share: 'பகிர்'
    },
    metrics: {
      temp: 'வெப்பநிலை',
      feelsLike: 'உணரப்படும் வெப்பநிலை',
      high: 'அதிகபட்சம்',
      low: 'குறைந்தபட்சம்',
      rainProb: 'மழை வாய்ப்பு',
      precipitation: 'மழை அளவு',
      humidity: 'ஈரப்பதம்',
      wind: 'காற்றின் வேகம்',
      windDirection: 'திசை',
      gusts: 'காற்று வீச்சு',
      pressure: 'வளிமண்டல அழுத்தம்',
      uvIndex: 'புற ஊதா குறியீடு',
      airQuality: 'காற்று தரம் (AQI)',
      cloudCover: 'மேகமூட்டம்',
      dewPoint: 'பனிப்புள்ளி',
      visibility: 'பார்வை தூரம்',
      sunrise: 'சூரிய உதயம்',
      sunset: 'சூரிய அஸ்தமனம்'
    },
    alerts: {
      title: 'பேரிடர் மற்றும் வானிலை எச்சரிக்கைகள் (CAP)',
      noAlerts: 'இந்த இடத்திற்கு தற்போது தீவிர வானிலை எச்சரிக்கைகள் எதுவும் இல்லை',
      all: 'அனைத்து எச்சரிக்கைகள்',
      red: 'ரெட் அலர்ட் (உடனடி நடவடிக்கை எடுக்கவும்)',
      orange: 'ஆரஞ்சு அலர்ட் (தயாராக இருங்கள்)',
      yellow: 'மஞ்சள் அலர்ட் (விழிப்புடன் இருங்கள்)',
      green: 'பச்சை (சாதாரண)',
      safetyTips: 'தேசிய பேரிடர் மேலாண்மை (NDMA) பாதுகாப்பு வழிகாட்டுதல்கள்',
      emergencyHelpline: 'அவசர உதவி: 112 | பேரிடர் கட்டுப்பாடு: 1070',
      severity: 'தீவிரம்',
      effectiveTill: 'செல்லுபடியாகும் காலம்'
    },
    sectors: {
      title: 'துறைசார் முடிவு ஆதரவு',
      subtitle: 'வேளாண் வானிலை, கடலோர எச்சரிக்கைகள் மற்றும் பேரிடர் மேலாண்மை.',
      agriculture: 'விவசாயம் மற்றும் பயிர்கள்',
      marine: 'கடலோர மற்றும் மீன்பிடி',
      health: 'சுகாதாரம் மற்றும் வெப்ப மேலாண்மை',
      disaster: 'பேரிடர் மேலாண்மை',
      irrigation: 'நீர்ப்பாசன ஆலோசனை',
      spraying: 'பூச்சிக்கொல்லி தெளிக்கும் நேரம்',
      pestRisk: 'பூச்சி-நோய் ஆபத்து',
      seaCondition: 'கடல் நிலை',
      waveHeight: 'அலை உயரம்',
      fishermanWarning: 'மீனவர்களுக்கான கடலோர எச்சரிக்கை',
      heatIndex: 'வெப்பக் குறியீடு மற்றும் ஆபத்து',
      hydration: 'நீரேற்றம் மற்றும் சூரிய ஒளி பாதுகாப்பு',
      vulnerableGroups: 'குழந்தைகள் மற்றும் முதியோர் பராமரிப்பு',
      primaryCrops: 'முக்கிய பிராந்திய பயிர்கள்',
      emergencyActions: 'அவசர நடவடிக்கை சரிபார்ப்புப் பட்டியல்'
    },
    climate: {
      title: '10 ஆண்டு காலநிலை போக்குகள் மற்றும் மாற்றங்கள்',
      subtitle: 'கடந்த தசாப்தத்தின் மழை மற்றும் வெப்பநிலை பற்றிய விரிவான பகுப்பாய்வு.',
      meanRainfall: '10 ஆண்டு சராசரி மழைப்பொழிவு',
      heatwaveDays: 'வெப்ப அலை நாட்கள்',
      extremeRainDays: 'கனமழை நாட்கள் (>65mm)',
      monsoonShift: 'பருவமழை தொடக்கம் மற்றும் கால அளவு மாற்றம்',
      annualTrajectory: 'வருடாந்திர மழைப்பொழிவு (2016–2025)',
      eventFrequency: 'தீவிர வானிலை நிகழ்வுகளின் போக்கு',
      tempEvolution: 'கோடை சராசரி அதிகபட்ச வெப்பநிலை (°C)',
      monthlyClimatology: 'மாதாந்திர இயல்பான மழை v பதிவு செய்யப்பட்ட மழை',
      synthesis: 'காலநிலை சுருக்கம்',
      explainTrend: '10 ஆண்டு போக்கை புரிந்து கொள்ளுங்கள்'
    },
    authModal: {
      loginTitle: 'WeatherNova கணக்கு',
      loginDesc: 'உள்நுழைவது முற்றிலும் விருப்பத்திற்குரியது. உள்நுழைந்தால் உங்கள் உரையாடல் வரலாறு நிரந்தரமாக சேமிக்கப்படும்.',
      nameLabel: 'உங்கள் பெயர்',
      namePlaceholder: 'எ.கா. கார்த்திக்',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      emailPlaceholder: 'எ.கா. karthik@example.com',
      signInBtn: 'உள்நுழைந்து வரலாற்றைச் சேமிக்கவும்',
      continueGuest: 'விருந்தினராக தொடரவும் (வரலாறு சேமிக்கப்படாது)',
      signedInAs: 'உள்நுழைந்துள்ள கணக்கு:',
      optionalNotice: 'கடவுச்சொல் தேவையில்லை. உள்நுழைவு விருப்பத்திற்குரியது.'
    }
  },
  te: {
    nav: {
      chat: 'వాతావరణ సంభాషణ',
      chat_sub: 'వాతావరణ ఏఐ సహాయకుడు',
      dashboard: 'వాతావరణ నమూనాలు',
      dashboard_sub: 'నమూనాలు, రాడార్ మరియు కొలతలు',
      alerts: 'విపత్తు మరియు హెచ్చరికలు',
      alerts_sub: 'తీవ్ర వాతావరణ రాడార్',
      advisories: 'వ్యవసాయ మరియు తీరప్రాంత సలహాలు',
      advisories_sub: 'రంగాల వారీ నిర్ణయ మద్దతు',
      map: 'జిఐఎస్ రాడార్ మరియు ఉపగ్రహం',
      map_sub: 'మ్యాప్ మరియు మేఘాల రాడార్',
      climate: 'దశాబ్దపు వాతావరణ మార్పులు',
      climate_sub: '10 ఏళ్ల వాతావరణ విశ్లేషణ',
      decision_intel: 'నిర్ణయ మేధస్సు'
    },
    actions: {
      newChat: 'కొత్త వాతావరణ సంభాషణ',
      selectLocation: 'ప్రాంతం (భారతదేశం అంతటా)',
      detectLocation: 'నా ప్రస్తుత స్థానాన్ని కనుగొనండి',
      detectingLocation: 'స్థానాన్ని గుర్తిస్తోంది...',
      login: 'లాగిన్ అవ్వండి',
      logout: 'లాగ్ అవుట్',
      myAccount: 'నా ఖాతా',
      guest: 'గెస్ట్ మోడ్',
      loginToSaveHistory: 'సంభాషణ చరిత్రను శాశ్వతంగా భద్రపరచడానికి లాగిన్ అవ్వండి',
      recentChats: 'ఇటీవలి సంభాషణలు',
      noRecentChats: 'మునుపటి సంభాషణలు ఏవీ లేవు',
      noSavedChats: 'గెస్ట్ మోడ్‌లో సంభాషణలు శాశ్వతంగా భద్రపరచబడవు',
      searchLocationPlaceholder: 'గ్రామం, మండలం, జిల్లా లేదా నగరం వెతకండి...',
      send: 'పంపండి',
      listening: 'వింటోంది...',
      askQuestionPlaceholder: 'వాతావరణం, వర్షం, పంటలు లేదా హెచ్చరికల గురించి అడగండి...',
      disclaimer: 'WeatherNova భారతదేశం కోసం ప్రత్యక్ష వాతావరణ సమాచారాన్ని అందిస్తుంది.',
      switchLanguage: 'భాష',
      autoSpeak: 'ధ్వని ద్వారా సమాధానం వినండి',
      active: 'క్రియాశీలం',
      collapseSidebar: 'సైడ్‌బార్‌ను దాచండి',
      expandSidebar: 'సైడ్‌బార్‌ను చూపించండి',
      today: 'ఈ రోజు',
      tomorrow: 'రేపు',
      forecast7Days: '7 రోజుల వాతావరణ సూచన',
      hourlyForecast: 'గంటల వారీ ధోరణి (24 గంటలు)',
      nwpConsensus: 'వాతావరణ నమూనాలు (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI ని అడగండి',
      listen: 'వినండి (తెలుగు)',
      stopVoice: 'ధ్వనిని ఆపండి',
      copy: 'కాపీ',
      copied: 'కాపీ చేయబడింది',
      share: 'షేర్ చేయండి'
    },
    metrics: {
      temp: 'ఉష్ణోగ్రత',
      feelsLike: 'అనిపించే ఉష్ణోగ్రత',
      high: 'గరిష్టం',
      low: 'కనిష్టం',
      rainProb: 'వర్షం పడే అవకాశం',
      precipitation: 'వర్షపాతం మొత్తం',
      humidity: 'తేమ (ఆర్ద్రత)',
      wind: 'గాలి వేగం',
      windDirection: 'దిశ',
      gusts: 'ఈదురు గాలులు',
      pressure: 'వాయుపీడనం',
      uvIndex: 'యువి సూచిక',
      airQuality: 'గాలి నాణ్యత (AQI)',
      cloudCover: 'మేఘావృతం',
      dewPoint: 'మంచు బిందువు',
      visibility: 'దృశ్యమానత',
      sunrise: 'సూర్యోదయం',
      sunset: 'సూర్యాస్తమయం'
    },
    alerts: {
      title: 'విపత్తు మరియు వాతావరణ హెచ్చరికలు (CAP)',
      noAlerts: 'ఈ ప్రాంతానికి ప్రస్తుతం తీవ్రమైన వాతావరణ హెచ్చరికలు ఏవీ లేవు',
      all: 'అన్ని హెచ్చరికలు',
      red: 'రెడ్ అలర్ట్ (వెంటనే చర్య తీసుకోండి)',
      orange: 'ఆరెంజ్ అలర్ట్ (సిద్ధంగా ఉండండి)',
      yellow: 'ఎల్లో అలర్ట్ (జాగ్రత్తగా ఉండండి)',
      green: 'గ్రీన్ (సాధారణం)',
      safetyTips: 'జాతీయ విపత్తు నిర్వహణ (NDMA) మార్గదర్శకాలు',
      emergencyHelpline: 'అత్యవసర సహాయం: 112 | విపత్తు నియంత్రణ: 1070',
      severity: 'తీవ్రత',
      effectiveTill: 'చెల్లుబాటు సమయం'
    },
    sectors: {
      title: 'రంగాల వారీ నిర్ణయ మద్దతు',
      subtitle: 'వ్యవసాయ వాతావరణం, తీరప్రాంత హెచ్చరికలు మరియు విపత్తు నిర్వహణ.',
      agriculture: 'వ్యవసాయం మరియు పంటలు',
      marine: 'తీరప్రాంతం మరియు మత్స్య సంపద',
      health: 'ఆరోగ్యం మరియు వడదెబ్బ నివారణ',
      disaster: 'విపత్తు నిర్వహణ',
      irrigation: 'నీటిపారుదల సలహా',
      spraying: 'పురుగుమందు పిచికారీ సమయం',
      pestRisk: 'తెగుళ్ల ప్రమాదం',
      seaCondition: 'సముద్ర పరిస్థితి',
      waveHeight: 'అలల ఎత్తు',
      fishermanWarning: 'మత్స్యకారులకు తీరప్రాంత హెచ్చరిక',
      heatIndex: 'వేడి సూచిక మరియు ప్రమాదం',
      hydration: 'నీరు ఎక్కువగా తాగండి, ఎండలో తిరగవద్దు',
      vulnerableGroups: 'పిల్లలు మరియు వృద్ధుల సంరక్షణ',
      primaryCrops: 'ప్రధాన ప్రాంతీయ పంటలు',
      emergencyActions: 'అత్యవసర సన్నద్ధత జాబితా'
    },
    climate: {
      title: '10 ఏళ్ల వాతావరణ పోకడలు మరియు మార్పులు',
      subtitle: 'గత దశాబ్దంలో వర్షపాతం మరియు ఉష్ణోగ్రతల విశ్లేషణ.',
      meanRainfall: '10 ఏళ్ల సగటు వర్షపాతం',
      heatwaveDays: 'వడగాల్పుల రోజులు',
      extremeRainDays: 'భారీ వర్షపు రోజులు (>65mm)',
      monsoonShift: 'రుతుపవనాల ప్రారంభం మరియు వ్యవధిలో మార్పు',
      annualTrajectory: 'వార్షిక వర్షపాత గమనం (2016–2025)',
      eventFrequency: 'తీవ్ర వాతావరణ సంఘటనల ధోరణి',
      tempEvolution: 'వేసవి సగటు గరిష్ట ఉష్ణోగ్రత (°C)',
      monthlyClimatology: 'నెలవారీ సాధారణ v నమోదైన వర్షపాతం',
      synthesis: 'వాతావరణ సారాంశం',
      explainTrend: '10 ఏళ్ల ధోరణిని అర్థం చేసుకోండి'
    },
    authModal: {
      loginTitle: 'WeatherNova ఖాతా',
      loginDesc: 'లాగిన్ అవ్వడం పూర్తిగా ఐచ్ఛికం. లాగిన్ అయితే మీ సంభాషణల చరిత్ర శాశ్వతంగా భద్రపరచబడుతుంది.',
      nameLabel: 'మీ పేరు',
      namePlaceholder: 'ఉదా. రమేష్ వర్మ',
      emailLabel: 'ఈమెయిల్ చిరునామా',
      emailPlaceholder: 'ఉదా. ramesh@example.com',
      signInBtn: 'లాగిన్ అయి చరిత్రను భద్రపరచండి',
      continueGuest: 'గెస్ట్‌గా కొనసాగండి (చరిత్ర భద్రపరచబడదు)',
      signedInAs: 'లాగిన్ అయిన ఖాతా:',
      optionalNotice: 'పాస్‌వర్డ్ అవసరం లేదు. లాగిన్ ఐచ్ఛికం.'
    }
  },
  bn: {
    nav: {
      chat: 'আবহাওয়া বার্তা',
      chat_sub: 'এআই আবহাওয়া সহকারী',
      dashboard: 'আবহাওয়া ও মডেল',
      dashboard_sub: 'পূর্বাভাস মডেল, রাডার ও তথ্য',
      alerts: 'দুর্যোগ ও সতর্কতা',
      alerts_sub: 'তীব্র আবহাওয়া রাডার',
      advisories: 'কৃষি ও উপকূলীয় পরামর্শ',
      advisories_sub: 'ক্ষেত্রভিত্তিক সিদ্ধান্ত সহায়তা',
      map: 'জিআইএস রাডার ও উপগ্রহ',
      map_sub: 'মানচিত্র ও মেঘ রাডার',
      climate: 'দশকীয় জলবায়ু পরিবর্তন',
      climate_sub: '১০ বছরের আবহাওয়া বিশ্লেষণ',
      decision_intel: 'সিদ্ধান্ত বুদ্ধিমত্তা'
    },
    actions: {
      newChat: 'নতুন আবহাওয়া বার্তালাপ',
      selectLocation: 'স্থান (সমগ্র ভারত)',
      detectLocation: 'আমার অবস্থান খুঁজুন',
      detectingLocation: 'অবস্থান খোঁজা হচ্ছে...',
      login: 'লগ ইন করুন',
      logout: 'লগ আউট',
      myAccount: 'আমার অ্যাকাউন্ট',
      guest: 'গেস্ট মোড',
      loginToSaveHistory: 'কথোপকথনের ইতিহাস স্থায়ীভাবে সংরক্ষণ করতে লগ ইন করুন',
      recentChats: 'সাম্প্রতিক কথোপকথন',
      noRecentChats: 'কোনো পূর্ববর্তী কথোপকথন নেই',
      noSavedChats: 'গেস্ট মোডে ইতিহাস সংরক্ষিত হয় না',
      searchLocationPlaceholder: 'গ্রাম, থানা, জেলা বা শহর খুঁজুন...',
      send: 'পাঠান',
      listening: 'শুনছি...',
      askQuestionPlaceholder: 'আবহাওয়া, বৃষ্টি, ফসল বা সতর্কতা সম্পর্কে জিজ্ঞাসা করুন...',
      disclaimer: 'WeatherNova ভারতের জন্য রিয়েল-টাইম আবহাওয়া বুদ্ধিমত্তা প্রদান করে।',
      switchLanguage: 'ভাষা',
      autoSpeak: 'ভয়েস দিয়ে উত্তর শুনুন',
      active: 'সক্রিয়',
      collapseSidebar: 'সাইডবার লুকান',
      expandSidebar: 'সাইডবার দেখান',
      today: 'আজ',
      tomorrow: 'আগামীকাল',
      forecast7Days: '৭ দিনের আবহাওয়ার পূর্বাভাস',
      hourlyForecast: 'প্রতি ঘণ্টার পূর্বাভাস (২৪ ঘণ্টা)',
      nwpConsensus: 'আবহাওয়া মডেল (GFS, ECMWF, WRF-India)',
      askAi: 'WeatherNova AI কে জিজ্ঞাসা করুন',
      listen: 'শুনুন (বাংলা)',
      stopVoice: 'ভয়েস বন্ধ করুন',
      copy: 'কপি',
      copied: 'কপি হয়েছে',
      share: 'শেয়ার করুন'
    },
    metrics: {
      temp: 'তাপমাত্রা',
      feelsLike: 'অনুভূত তাপমাত্রা',
      high: 'সর্বোচ্চ',
      low: 'সর্বনিম্ন',
      rainProb: 'বৃষ্টির সম্ভাবনা',
      precipitation: 'বৃষ্টিপাতের পরিমাণ',
      humidity: 'আর্দ্রতা',
      wind: 'বাতাসের গতিবেগ',
      windDirection: 'দিক',
      gusts: 'ঝাপটা বাতাস',
      pressure: 'বায়ুচাপ',
      uvIndex: 'ইউভি সূচক',
      airQuality: 'বায়ুমান (AQI)',
      cloudCover: 'মেঘের পরিমাণ',
      dewPoint: 'শিশিরাঙ্ক',
      visibility: 'দৃশ্যমানতা',
      sunrise: 'সূর্যোদয়',
      sunset: 'সূর্যাস্ত'
    },
    alerts: {
      title: 'দুর্যোগ ও আবহাওয়া সতর্কতা (CAP)',
      noAlerts: 'এই স্থানের জন্য বর্তমানে কোনো তীব্র আবহাওয়া সতর্কতা সক্রিয় নেই',
      all: 'সমস্ত সতর্কতা',
      red: 'রেড অ্যালার্ট (তাত্ক্ষণিক পদক্ষেপ নিন)',
      orange: 'অরেঞ্জ অ্যালার্ট (প্রস্তুত থাকুন)',
      yellow: 'ইয়েলো অ্যালার্ট (সতর্ক থাকুন)',
      green: 'গ্রিন (স্বাভাবিক)',
      safetyTips: 'জাতীয় দুর্যোগ ব্যবস্থাপনা (NDMA) সুরক্ষা নির্দেশিকা',
      emergencyHelpline: 'জরুরি হেল্পলাইন: 112 | দুর্যোগ নিয়ন্ত্রণ: 1070',
      severity: 'তীব্রতা',
      effectiveTill: 'মেয়াদ'
    },
    sectors: {
      title: 'ক্ষেত্রভিত্তিক সিদ্ধান্ত সহায়তা',
      subtitle: 'কৃষি আবহাওয়া, উপকূলীয় সতর্কতা ও দুর্যোগ ব্যবস্থাপনা।',
      agriculture: 'কৃষি ও ফসল',
      marine: 'উপকূলীয় ও মৎস্যচাষ',
      health: 'স্বাস্থ্য ও তাপপ্রবাহ নিয়ন্ত্রণ',
      disaster: 'দুর্যোগ ব্যবস্থাপনা',
      irrigation: 'সেচ পরামর্শ',
      spraying: 'কীটনাশক প্রয়োগের সময়',
      pestRisk: 'কীটপতঙ্গ ও রোগের ঝুঁকি',
      seaCondition: 'সমুদ্রের অবস্থা',
      waveHeight: 'ঢেউয়ের উচ্চতা',
      fishermanWarning: 'মৎস্যজীবীদের জন্য উপকূলীয় সতর্কতা',
      heatIndex: 'তাপ সূচক ও ঝুঁকি',
      hydration: 'পর্যাপ্ত জলপান ও রোদ থেকে সুরক্ষা',
      vulnerableGroups: 'শিশু ও প্রবীণদের যত্ন',
      primaryCrops: 'স্থানীয় প্রধান ফসল',
      emergencyActions: 'জরুরি প্রস্তুতি তালিকা'
    },
    climate: {
      title: '১০ বছরের জলবায়ু প্রবণতা ও পরিবর্তন',
      subtitle: 'গত দশকের বৃষ্টিপাত ও তাপমাত্রার বিস্তারিত বিশ্লেষণ।',
      meanRainfall: '১০ বছরের গড় বৃষ্টিপাত',
      heatwaveDays: 'তাপপ্রবাহের দিন',
      extremeRainDays: 'ভারী বৃষ্টির দিন (>65mm)',
      monsoonShift: 'বর্ষার সূচনা ও সময়কালে পরিবর্তন',
      annualTrajectory: 'বার্ষিক বৃষ্টিপাতের গতিপথ (2016–2025)',
      eventFrequency: 'তীব্র আবহাওয়া ঘটনার প্রবণতা',
      tempEvolution: 'গ্রীষ্মের গড় সর্বোচ্চ তাপমাত্রা (°C)',
      monthlyClimatology: 'মাসিক স্বাভাবিক বনাম রেকর্ডকৃত বৃষ্টিপাত',
      synthesis: 'জলবায়ু সারসংক্ষেপ',
      explainTrend: '১০ বছরের প্রবণতা বুঝুন'
    },
    authModal: {
      loginTitle: 'WeatherNova অ্যাকাউন্ট',
      loginDesc: 'লগ ইন করা সম্পূর্ণ ঐচ্ছিক। আপনি লগ ইন করলে কথোপকথনের ইতিহাস স্থায়ীভাবে সংরক্ষিত থাকবে।',
      nameLabel: 'আপনার নাম',
      namePlaceholder: 'যেমন: অমিত ব্যানার্জী',
      emailLabel: 'ইমেল ঠিকানা',
      emailPlaceholder: 'যেমন: amit@example.com',
      signInBtn: 'লগ ইন করুন ও ইতিহাস সংরক্ষণ করুন',
      continueGuest: 'গেস্ট হিসাবে চালিয়ে যান (ইতিহাস সংরক্ষিত হবে না)',
      signedInAs: 'লগ ইন করা অ্যাকাউন্ট:',
      optionalNotice: 'পাসওয়ার্ডের প্রয়োজন নেই। লগইন সম্পূর্ণ ঐচ্ছिक।'
    }
  }
};

export function getTranslations(langCode: string): AppTranslations {
  const base = TRANSLATIONS[langCode] || TRANSLATIONS.en;
  const authModal = base.authModal || TRANSLATIONS.en.authModal;

  const auth = {
    title: authModal.loginTitle,
    statusLoggedIn: 'Logged In (Cloud Sync Active)',
    statusGuest: 'Guest Mode (Temporary)',
    permanentNote: 'Your chat threads are saved under your account profile.',
    temporaryNotice: 'Login is optional. In guest mode, chats are temporary.',
    optionalNotice: authModal.optionalNotice || 'No password required. Login is completely optional.',
    nameLabel: authModal.nameLabel || 'Your Name',
    emailLabel: authModal.emailLabel || 'Email Address',
    signInBtn: authModal.signInBtn || 'Sign In',
    continueGuest: authModal.continueGuest || 'Continue as Guest',
    loginToSave: base.actions.loginToSaveHistory || 'Sign in to save chat history permanently'
  };

  const nav = {
    ...base.nav,
    location: base.actions.selectLocation || 'Location'
  };

  const metrics = {
    ...base.metrics,
    liveGroundStation: base.metrics.liveGroundStation || 'Live Ground Station',
    updatedAt: base.metrics.updatedAt || 'Updated at',
    groundTruthSources: base.metrics.groundTruthSources || 'Ground Truth Sources',
    currentObservation: base.metrics.currentObservation || 'Current Observation',
    hourlyForecast: base.metrics.hourlyForecast || 'Hourly Forecast',
    dailyForecast: base.metrics.dailyForecast || '7-Day Forecast',
    nwpModels: base.metrics.nwpModels || 'NWP Model Matrix',
    consensusTemp: base.metrics.consensusTemp || 'Consensus Temperature'
  };

  const sectors = {
    ...base.sectors,
    heatStress: base.sectors.heatStress || base.sectors.heatIndex || 'Heat Stress'
  };

  return {
    ...base,
    nav,
    metrics,
    sectors,
    auth
  };
}

export function translateCondition(conditionEn: string, langCode: string): string {
  const norm = (conditionEn || '').toLowerCase().trim();

  const dict: Record<string, { hi: string; gu: string; kn: string; ml: string; mr: string; ta: string; te: string; bn: string }> = {
    'clear sky': {
      hi: 'साफ आसमान',
      gu: 'ચોખ્ખું આકાશ',
      kn: 'ಸ್ವಚ್ಛ ಆಕಾಶ',
      ml: 'തെളിഞ്ഞ ആകാശം',
      mr: 'निरभ्र आकाश',
      ta: 'தெளிவான வானம்',
      te: 'నిర్మలమైన ఆకాశం',
      bn: 'পরিষ্কার আকাশ'
    },
    'mainly clear': {
      hi: 'मुख्यतः साफ आसमान',
      gu: 'મોટેભાગે સ્વચ્છ આકાશ',
      kn: 'ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛ ಆಕಾಶ',
      ml: 'പ്രധാനമായും തെളിഞ്ഞ ആകാശം',
      mr: 'मुख्यतः निरभ्र आकाश',
      ta: 'பெரும்பாலும் தெளிவான வானம்',
      te: 'ఎక్కువగా నిర్మలంగా ఉంది',
      bn: 'প্রধানত পরিষ্কার আকাশ'
    },
    'partly cloudy': {
      hi: 'आंशिक रूप से बादल',
      gu: 'અંશતઃ વાદળછાયું',
      kn: 'ಭಾಗಶಃ ಮೋಡ ಕವಿದ ವಾತಾವರಣ',
      ml: 'ഭാഗികമായി മേഘാവൃതം',
      mr: 'अंशतः ढगाळ',
      ta: 'பகுதி மேகமூட்டம்',
      te: 'పాక్షికంగా మేఘావృతం',
      bn: 'আংশিক মেঘলা'
    },
    'overcast': {
      hi: 'घने बादल',
      gu: 'સંપૂર્ણ વાદળછાયું',
      kn: 'ಪೂರ್ಣ ಮೋಡ ಕವಿದಿದೆ',
      ml: 'പൂർണ്ണമായും മേഘാവൃതം',
      mr: 'पूर्णतः ढगाळ',
      ta: 'அடர்ந்த மேகமூட்டம்',
      te: 'పూర్తిగా మేఘావృతం',
      bn: 'মেঘাচ্ছন্ন'
    },
    'fog / mist': {
      hi: 'कोहरा / धुंध',
      gu: 'ઝાકળ / ધુમ્મસ',
      kn: 'ಮಂಜು / ಇಬ್ಬನಿ',
      ml: 'മൂടൽമഞ്ഞ്',
      mr: 'धुके',
      ta: 'பனிமூட்டம்',
      te: 'పొగమంచు',
      bn: 'কুয়াশা'
    },
    'light drizzle': {
      hi: 'हल्की बूंदाबांदी',
      gu: 'હળવી ઝરમર',
      kn: 'ತೆಳು ತುಂತುರು ಮಳೆ',
      ml: 'നേരിയ ചാറ്റൽമഴ',
      mr: 'हलकी रिमझिम',
      ta: 'லேசான தூறல்',
      te: 'తేలికపాటి జల్లులు',
      bn: 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি'
    },
    'moderate rain': {
      hi: 'मध्यम बारिश',
      gu: 'મધ્યમ વરસાદ',
      kn: 'ಮಧ್ಯಮ ಮಳೆ',
      ml: 'മിതമായ മഴ',
      mr: 'मध्यम पाऊस',
      ta: 'மிதமான மழை',
      te: 'మోస్తరు వర్షం',
      bn: 'মাঝারি বৃষ্টি'
    },
    'heavy monsoon rain': {
      hi: 'भारी मानसूनी बारिश',
      gu: 'ભારે ચોમાસુ વરસાદ',
      kn: 'ಭಾರೀ ಮುಂಗಾರು ಮಳೆ',
      ml: 'ശക്തമായ കാലവർഷം',
      mr: 'मुसळधार मान्सून पाऊस',
      ta: 'கனமழை',
      te: 'భారీ వర్షం',
      bn: 'ভারী মৌসুমি বৃষ্টি'
    },
    'rain showers': {
      hi: 'बारिश की बौछारें',
      gu: 'વરસાદી ઝાપટાં',
      kn: 'ಮಳೆಯ ತುಂತುರು',
      ml: 'മഴത്തുള്ളികൾ',
      mr: 'पावसाच्या सरी',
      ta: 'மழைச்சாரல்',
      te: 'వర్షపు జల్లులు',
      bn: 'বৃষ্টির ঝাপটা'
    },
    'thunderstorm with gusty winds': {
      hi: 'तेज हवाओं के साथ आंधी-तूफान',
      gu: 'ઝડપી પવન સાથે ગાજવીજ',
      kn: 'ಬಿರುಗಾಳಿ ಸಹಿತ ಗುಡುಗು ಮಳೆ',
      ml: 'കാറ്റും ഇടിമിന്നലോട് കൂടിയ മഴ',
      mr: 'वादळी वाऱ्यासह पाऊस',
      ta: 'சூறைக்காற்றுடன் இடியுடன் மழை',
      te: 'ఈదురు గాలులతో ఉరుములు',
      bn: 'ঝোড়ো হাওয়া সহ বজ্রবিদ্যুৎ'
    },
    'severe thunderstorm with hail': {
      hi: 'ओलावृष्टि के साथ तीव्र तूफान',
      gu: 'કરા સાથે તીવ્ર વાવાઝોડું',
      kn: 'ಆಲಿಕಲ್ಲು ಸಹಿತ ತೀವ್ರ ಗುಡುಗು',
      ml: 'ആലിപ്പഴത്തോട് കൂടിയ കനത്ത കൊടുങ്കാറ്റ്',
      mr: 'गारांचा पाऊस व वादळ',
      ta: 'ஆலங்கட்டி மழை மற்றும் புயல்',
      te: 'వడగండ్ల వానతో తీవ్ర తుఫాను',
      bn: 'শিলাবৃষ্টি সহ তীব্র ঝড়'
    },
    'fair weather': {
      hi: 'अनुकूल मौसम',
      gu: 'અનુકૂળ હવામાન',
      kn: 'ಉತ್ತಮ ಹವಾಮಾನ',
      ml: 'നല്ല കാലാവസ്ഥ',
      mr: 'चांगले हवामान',
      ta: 'சாதகமான வானிலை',
      te: 'అనుకూలమైన వాతావరణం',
      bn: 'অনুকূল আবহাওয়া'
    }
  };

  for (const [key, val] of Object.entries(dict)) {
    if (norm.includes(key) || key.includes(norm)) {
      if (langCode === 'hi') return val.hi;
      if (langCode === 'gu') return val.gu;
      if (langCode === 'kn') return val.kn;
      if (langCode === 'ml') return val.ml;
      if (langCode === 'mr') return val.mr;
      if (langCode === 'ta') return val.ta;
      if (langCode === 'te') return val.te;
      if (langCode === 'bn') return val.bn;
    }
  }

  return conditionEn;
}

export function getMetricLabels(langCode: string) {
  const t = getTranslations(langCode);
  return {
    temperature: t.metrics.temp,
    feels_like: t.metrics.feelsLike,
    high: t.metrics.high,
    low: t.metrics.low,
    rain_prob: t.metrics.rainProb,
    rainProb: t.metrics.rainProb,
    precipitation: t.metrics.precipitation,
    humidity: t.metrics.humidity,
    wind: t.metrics.wind,
    gusts: t.metrics.gusts,
    windGusts: t.metrics.gusts,
    pressure: t.metrics.pressure,
    uv: t.metrics.uvIndex,
    uv_index: t.metrics.uvIndex,
    aqi: t.metrics.airQuality,
    visibility: t.metrics.visibility,
    cloud_cover: t.metrics.cloudCover,
    dew_point: t.metrics.dewPoint,
    sunrise: t.metrics.sunrise,
    sunset: t.metrics.sunset
  };
}
