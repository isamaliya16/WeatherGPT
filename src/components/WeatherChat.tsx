import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  User,
  CheckCircle2,
  Globe,
  MapPin,
  Sprout,
  ShieldCheck,
  Droplets,
  Wind,
  Thermometer,
  ChevronDown,
  Copy,
  Check,
  Square,
  ArrowUpRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { ChatMessage, IndianLanguage, LocationPreset, WeatherAlert } from '../types';
import { INDIAN_LANGUAGES } from '../data/indianLanguages';
import { getMetricLabels, translateCondition, getTranslations } from '../services/weatherTranslations';

interface WeatherChatProps {
  currentLanguage: IndianLanguage;
  currentLocation: LocationPreset;
  messages: ChatMessage[];
  onSendMessage: (text: string, options?: { isVoice?: boolean; voiceLang?: string }) => Promise<void>;
  isLoading: boolean;
  onSelectLanguage: (lang: IndianLanguage) => void;
  onOpenLocationPicker: () => void;
  activeAlerts: WeatherAlert[];
  autoSpeak: boolean;
  onOpenAlerts: () => void;
  onOpenTab: (tab: string) => void;
}

export const WeatherChat: React.FC<WeatherChatProps> = ({
  currentLanguage,
  currentLocation,
  messages,
  onSendMessage,
  isLoading,
  onSelectLanguage,
  onOpenLocationPicker,
  activeAlerts,
  autoSpeak,
  onOpenAlerts
}) => {
  const t = getTranslations(currentLanguage.code);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLangPopover, setShowLangPopover] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const langPopoverRef = useRef<HTMLDivElement>(null);
  const lastInputWasVoiceRef = useRef<boolean>(false);
  const lastVoiceLangUsedRef = useRef<string>(currentLanguage.code);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice Query → Voice Answer: Speak ONLY if the user asked via voice.
  // Text Query → Text Answer: If the user typed the question, return answer ONLY as text; do NOT automatically play voice!
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (
        lastMsg.role === 'assistant' &&
        !lastMsg.content.startsWith('Error') &&
        !spokenMessageIdsRef.current.has(lastMsg.id)
      ) {
        // Only speak if this assistant reply was in response to a voice query
        if (lastMsg.is_voice) {
          spokenMessageIdsRef.current.add(lastMsg.id);
          handleSpeak(lastMsg.id, lastMsg.content, lastMsg.language_code);
        }
      }
    }
  }, [messages]);

  // Close language popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langPopoverRef.current && !langPopoverRef.current.contains(e.target as Node)) {
        setShowLangPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech Recognition setup - strictly locked to current regional language
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.tts_lang_code || 'hi-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
        lastInputWasVoiceRef.current = true;
        lastVoiceLangUsedRef.current = currentLanguage.code;
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [currentLanguage]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput('');
      const targetLang = currentLanguage.tts_lang_code || 'hi-IN';
      recognitionRef.current.lang = targetLang;
      lastVoiceLangUsedRef.current = currentLanguage.code;
      lastInputWasVoiceRef.current = true;
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
        setIsRecording(false);
      }
    }
  };

  // Text-To-Speech with exact language voice consistency
  // NEVER default to English when the voice query or message was in another language
  const handleSpeak = (id: string, text: string, msgLang?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingAudioId(id);

    // Clean markdown and symbols for speech
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Strict language identification for TTS
    let targetLangCode = 'en-IN';

    if (/[\u0A80-\u0AFF]/.test(text) || msgLang === 'gu') {
      targetLangCode = 'gu-IN';
    } else if (/[\u0900-\u097F]/.test(text)) {
      if (/\b(आहे|होता|होती|झाला|नाही|काय|कसे|उद्या|काल|कधी|पाऊस)\b/.test(text) || msgLang === 'mr') {
        targetLangCode = 'mr-IN';
      } else {
        targetLangCode = 'hi-IN';
      }
    } else if (/[\u0B80-\u0BFF]/.test(text) || msgLang === 'ta') {
      targetLangCode = 'ta-IN';
    } else if (/[\u0C00-\u0C7F]/.test(text) || msgLang === 'te') {
      targetLangCode = 'te-IN';
    } else if (/[\u0C80-\u0CFF]/.test(text) || msgLang === 'kn') {
      targetLangCode = 'kn-IN';
    } else if (/[\u0D00-\u0D7F]/.test(text) || msgLang === 'ml') {
      targetLangCode = 'ml-IN';
    } else if (/[\u0980-\u09FF]/.test(text) || msgLang === 'bn') {
      targetLangCode = 'bn-IN';
    } else if (/[\u0A00-\u0A7F]/.test(text) || msgLang === 'pa') {
      targetLangCode = 'pa-IN';
    } else if (/[\u0B00-\u0B7F]/.test(text) || msgLang === 'or') {
      targetLangCode = 'or-IN';
    } else if (/[\u0600-\u06FF]/.test(text) || msgLang === 'ur') {
      targetLangCode = 'ur-IN';
    } else if (msgLang === 'en') {
      targetLangCode = 'en-IN';
    } else if (msgLang && msgLang !== 'en') {
      const matched = INDIAN_LANGUAGES.find(l => l.code === msgLang);
      targetLangCode = matched?.tts_lang_code || 'hi-IN';
    } else {
      targetLangCode = 'en-IN';
    }

    utterance.lang = targetLangCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const prefix = targetLangCode.split('-')[0].toLowerCase();
    const matchingVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(prefix);
    });
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isLoading) return;

    // If overrideText is supplied (clicked from card or suggestion), it was NOT voice
    const wasVoice = overrideText ? false : lastInputWasVoiceRef.current;
    const voiceLang = lastVoiceLangUsedRef.current;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setInput('');
    lastInputWasVoiceRef.current = false;
    onSendMessage(textToSend, { isVoice: wasVoice, voiceLang: wasVoice ? voiceLang : undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.native_name.toLowerCase().includes(langSearch.toLowerCase())
  );

  // Dynamic Suggestion Cards in all 9 supported languages
  const getLocalizedSuggestions = () => {
    const city = currentLocation.city;
    const lang = currentLanguage.code;

    switch (lang) {
      case 'hi':
        return [
          {
            id: 'history',
            title: 'ऐतिहासिक मौसम रिकॉर्ड',
            query: `क्या 13 सितंबर को ${city} में बारिश हुई थी?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          },
          {
            id: 'rain',
            title: 'बारिश व मौसम पूर्वानुमान',
            query: `क्या कल ${city} में बारिश होगी? मौसम कैसा रहेगा?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'कृषि छिड़काव सुरक्षा',
            query: `क्या आज ${city} में फसलों पर कीटनाशक दवा का छिड़काव करना सुरक्षित है?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'मछुआरों के लिए समुद्री चेतावनी',
            query: `तटीय क्षेत्रों में समुद्र की स्थिति और हवा की गति कैसी रहेगी?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          }
        ];
      case 'gu':
        return [
          {
            id: 'history',
            title: 'ઐતિહાસિક હવામાન રેકોર્ડ',
            query: `13 સપ્ટેમ્બરના રોજ ${city}માં વરસાદ હતો?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          },
          {
            id: 'rain',
            title: 'વરસાદ અને હવામાન આગાહી',
            query: `કાલે ${city}માં વરસાદ પડશે? બહાર જવું સલામત છે?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'કૃષિ દવાનો છંટકાવ સલાહ',
            query: `આજે ${city}માં પાક પર જંતુનાશક દવાનો છંટકાવ કરવો યોગ્ય છે?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'દરિયાઈ સુરક્ષા અને મોજા',
            query: `દરિયાકાંઠે મોજાની સ્થિતિ અને માછીમારો માટે શું સલાહ છે?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          }
        ];
      case 'kn':
        return [
          {
            id: 'rain',
            title: 'ಮಳೆ ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
            query: `ನಾಳೆ ${city} ನಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ? ಹವಾಮಾನ ಹೇಗಿರುತ್ತದೆ?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'ಕೃಷಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ',
            query: `ಇಂದು ಬೆಳೆಗಳಿಗೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಲು ಹವಾಮಾನ ಸೂಕ್ತವೇ?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'ಮೀನುಗಾರರ ಕಡಲ ಎಚ್ಚರಿಕೆ',
            query: `ಕರಾವಳಿ ಸಮುದ್ರ ಸ್ಥಿತಿ ಮತ್ತು ಗಾಳಿಯ ವೇಗ ಹೇಗಿದೆ?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '10 ವರ್ಷಗಳ ಹವಾಮಾನ ಬದಲಾವಣೆ',
            query: `${city} ನಲ್ಲಿ ಕಳೆದ 10 ವರ್ಷಗಳಲ್ಲಿ ಮಾನ್ಸೂನ್ ಹೇಗೆ ಬದಲಾಗಿದೆ?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      case 'ml':
        return [
          {
            id: 'rain',
            title: 'മഴയും കാലാവസ്ഥാ പ്രവചനവും',
            query: `നാളെ ${city} ൽ മഴ പെയ്യാൻ സാധ്യതയുണ്ടോ?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'കാർഷിക കീടനാശിനി തളിക്കൽ',
            query: `ഇന്ന് വിളകളിൽ മരുന്ന് തളിക്കാൻ കാലാവസ്ഥ അനുകൂലമാണോ?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'തീരദേശ സമുദ്ര മുന്നറിയിപ്പ്',
            query: `തീരത്ത് കടൽക്ഷോഭവും കാറ്റിന്റെ വേഗതയും എങ്ങനെയുണ്ട്?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '10 വർഷത്തെ കാലാവസ്ഥാ മാറ്റം',
            query: `${city} ൽ കഴിഞ്ഞ 10 വർഷത്തെ കാലവർഷ വ്യതിയാനം എന്താണ്?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      case 'mr':
        return [
          {
            id: 'rain',
            title: 'पाऊस व हवामान अंदाज',
            query: `उद्या ${city} मध्ये पाऊस पडेल का? हवामान कसे राहील?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'कृषी फवारणी सल्ला',
            query: `आज पिकांवर औषध फवारणी करणे सुरक्षित आहे का?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'मच्छीमारांसाठी सागरी इशारा',
            query: `सागरी लाटा आणि वाऱ्याचा वेग कसा आहे?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '१० वर्षांचे हवामान बदल',
            query: `${city} मध्ये गेल्या १० वर्षांत मान्सून आणि तापमानात काय बदल झाला?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      case 'ta':
        return [
          {
            id: 'rain',
            title: 'மழை மற்றும் வானிலை முன்னறிவிப்பு',
            query: `நாளை ${city} இல் மழை பெய்யுமா? வானிலை எப்படி இருக்கும்?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'விவசாய பூச்சிக்கொல்லி தெளிப்பு',
            query: `இன்று பயிர்களுக்கு மருந்து தெளிக்க வானிலை உகந்ததா?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'மீனவர்களுக்கான கடல் எச்சரிக்கை',
            query: `கடல் அலைகளின் நிலை மற்றும் காற்றின் வேகம் எப்படி உள்ளது?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '10 ஆண்டு காலநிலை மாற்றம்',
            query: `${city} இல் கடந்த 10 ஆண்டுகளில் பருவமழை எப்படி மாறியுள்ளது?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      case 'te':
        return [
          {
            id: 'rain',
            title: 'వర్షం మరియు వాతావరణ అంచనా',
            query: `రేపు ${city} లో వర్షం పడుతుందా? వాతావరణం ఎలా ఉంటుంది?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'వ్యవసాయ మందుల పిచికారీ',
            query: `ఈరోజు పంటలపై పురుగుమందుల పిచికారీకి అనుకూలమా?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'మత్స్యకారుల సముద్ర హెచ్చరిక',
            query: `సముద్రంలో అలల తీవ్రత మరియు గాలుల వేగం ఎలా ఉంది?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '10 సంవత్సరాల వాతావరణ మార్పు',
            query: `${city} లో గత 10 ఏళ్లలో రుతుపవనాల్లో వచ్చిన మార్పులేమిటి?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      case 'bn':
        return [
          {
            id: 'rain',
            title: 'বৃষ্টি ও আবহাওয়ার পূর্বাভাস',
            query: `কাল কি ${city}-তে বৃষ্টি হবে? আবহাওয়া কেমন থাকবে?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'কৃষি কীটনাশক স্প্রে পরামর্শ',
            query: `আজকে ফসলে কীটনাশক স্প্রে করার জন্য আবহাওয়া কি উপযোগী?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'মৎস্যজীবীদের সমুদ্র সতর্কতা',
            query: `উপকূলবর্তী এলাকায় সমুদ্রের ঢেউ ও বাতাসের গতিবেগ কেমন?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          },
          {
            id: 'climate',
            title: '১০ বছরের জলবায়ু পরিবর্তন',
            query: `${city}-তে গত ১০ বছরে বর্ষা ও তাপমাত্রায় কী পরিবর্তন এসেছে?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          }
        ];
      default:
        return [
          {
            id: 'history',
            title: 'Historical Weather Database',
            query: `Was there rain in ${city} on 13 September?`,
            icon: <Clock className="w-4 h-4 text-purple-600" />
          },
          {
            id: 'rain',
            title: 'Rain & Weather Forecast',
            query: `Will it rain tomorrow in ${city}? What is the precipitation probability?`,
            icon: <Droplets className="w-4 h-4 text-sky-600" />
          },
          {
            id: 'crop',
            title: 'Crop Spraying Advisory',
            query: `Is it safe to spray pesticides or fertilizers on crops today in ${city}?`,
            icon: <Sprout className="w-4 h-4 text-emerald-600" />
          },
          {
            id: 'marine',
            title: 'Fishermen Sea Advisory',
            query: `What is the marine sea condition, wave height, and wind gust advisory?`,
            icon: <Wind className="w-4 h-4 text-cyan-600" />
          }
        ];
    }
  };

  const suggestionCards = getLocalizedSuggestions();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* 1. WeatherNova Centered Front Page (when no messages yet) */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              WeatherNova
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 max-w-xl">
              {t.sectors.subtitle}
            </p>
          </div>

          {/* Active Location & Language Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5 text-xs">
            <button
              onClick={onOpenLocationPicker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-2xs transition-all font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {currentLocation.city}, {currentLocation.state}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">({currentLocation.region_type})</span>
            </button>

            <button
              onClick={() => setShowLangPopover(!showLangPopover)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-2xs transition-all font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentLanguage.native_name}</span>
              <span className="text-[10px] text-slate-400">({currentLanguage.name})</span>
            </button>

            {activeAlerts.length > 0 && (
              <button
                onClick={onOpenAlerts}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 shadow-2xs transition-all font-semibold"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{activeAlerts.length} {t.nav.alerts}</span>
              </button>
            )}
          </div>

          {/* Large Prominent Central Search & Chat Input Box */}
          <div className="w-full relative mb-5">
            <div
              className={`w-full bg-white rounded-3xl border ${
                isRecording ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'
              } shadow-lg focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all p-3 sm:p-4`}
            >
              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={t.actions.askQuestionPlaceholder}
                className="w-full bg-transparent resize-none border-0 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none leading-relaxed"
              />

              {/* Bottom Action Strip Inside the Big Box */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Location Selector Pill */}
                  <button
                    type="button"
                    onClick={onOpenLocationPicker}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                    title={t.actions.selectLocation}
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="max-w-[120px] truncate">{currentLocation.city}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Language Selector Popover Trigger */}
                  <div className="relative" ref={langPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setShowLangPopover(!showLangPopover)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                      title={t.actions.switchLanguage}
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentLanguage.native_name}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Language Dropdown Popover */}
                    {showLangPopover && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-64 flex flex-col">
                        <div className="p-1 border-b border-slate-100 mb-1">
                          <input
                            type="text"
                            placeholder="Search languages..."
                            value={langSearch}
                            onChange={e => setLangSearch(e.target.value)}
                            autoFocus
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-0.5">
                          {filteredLanguages.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                onSelectLanguage(lang);
                                setShowLangPopover(false);
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
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Microphone Voice Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2.5 rounded-2xl transition-all ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20 ring-4 ring-rose-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={isRecording ? t.actions.stopVoice : `${t.actions.listen} (${currentLanguage.native_name})`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className={`p-2.5 rounded-2xl font-semibold flex items-center justify-center transition-all ${
                      input.trim() && !isLoading
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title={t.actions.send}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {isRecording && (
              <div className="mt-2 text-center text-xs text-emerald-700 font-medium animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{t.actions.listening}: {currentLanguage.native_name}...</span>
              </div>
            )}
          </div>

          {/* 4 Clean Prompt Starter Cards in Native Language */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestionCards.map(card => (
              <div
                key={card.id}
                onClick={() => onSendMessage(card.query)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer transition-all hover:shadow-sm hover:border-emerald-300 hover:bg-emerald-50/30 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      {card.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{card.title}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{card.query}"
                </p>
              </div>
            ))}
          </div>

          {/* Quick Platform Quality Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Dynamic Meteorological Data</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Native Language Intelligence</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sector-Specific Decision Support</span>
            </span>
          </div>
        </div>
      ) : (
        /* 2. Active Chat Stream View */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 pr-1">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isPlaying = playingAudioId === msg.id;

              // Detect language of the message for native labels & TTS
              let msgLangCode = currentLanguage.code;
              if (!isUser) {
                if (/[\u0A80-\u0AFF]/.test(msg.content)) msgLangCode = 'gu';
                else if (/[\u0900-\u097F]/.test(msg.content)) {
                  msgLangCode = msg.content.includes('आहे') || msg.content.includes('नाही') ? 'mr' : 'hi';
                }
                else if (/[\u0B80-\u0BFF]/.test(msg.content)) msgLangCode = 'ta';
                else if (/[\u0C00-\u0C7F]/.test(msg.content)) msgLangCode = 'te';
                else if (/[\u0C80-\u0CFF]/.test(msg.content)) msgLangCode = 'kn';
                else if (/[\u0D00-\u0D7F]/.test(msg.content)) msgLangCode = 'ml';
                else if (/[\u0980-\u09FF]/.test(msg.content)) msgLangCode = 'bn';
                else if (/^[a-zA-Z0-9\s.,!?'"-]+$/.test(msg.content)) msgLangCode = 'en';
              }
              const labels = getMetricLabels(msgLangCode);

              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] sm:max-w-[80%] space-y-2.5`}>
                    {/* Message Bubble Card */}
                    <div
                      className={`p-4 rounded-3xl ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-br-xs shadow-sm ml-auto'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {/* Markdown Text */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>

                      {/* Embedded Mini Weather Snapshot */}
                      {!isUser && msg.weather_snapshot && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                          {/* Translated condition tag */}
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{translateCondition(msg.weather_snapshot.condition_text, msgLangCode)}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">{labels.temperature}</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.weather_snapshot.temperature}°C
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">{labels.rain_prob}</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.weather_snapshot.rain_probability}%
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Wind className="w-4 h-4 text-cyan-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">{labels.wind}</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.weather_snapshot.wind_speed_kmh} km/h
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">{labels.aqi}</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.weather_snapshot.air_quality?.aqi_in || 'Good'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Embedded Historical Weather Snapshot */}
                      {!isUser && msg.historical_snapshot && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              <span>
                                {msg.historical_snapshot.city}, {msg.historical_snapshot.state} • {msg.historical_snapshot.date_formatted}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              IMD: {msg.historical_snapshot.station_name || 'Station #42647'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">Recorded Rain</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.historical_snapshot.rainfall_mm} mm
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">Max / Min Temp</div>
                                <div className="text-xs font-bold text-slate-800">
                                  {msg.historical_snapshot.temp_max}° / {msg.historical_snapshot.temp_min}°C
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">Rain Status</div>
                                <div className={`text-xs font-bold ${msg.historical_snapshot.rain_occurred ? 'text-emerald-700' : 'text-slate-700'}`}>
                                  {msg.historical_snapshot.rain_occurred ? 'Rain Occurred' : 'No Rain'}
                                </div>
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                              <Wind className="w-4 h-4 text-cyan-500 shrink-0" />
                              <div>
                                <div className="text-[10px] text-slate-600">Observation</div>
                                <div className="text-xs font-bold text-slate-800 truncate max-w-[85px]">
                                  {msg.historical_snapshot.condition_text}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Row Under Assistant Message (Read Aloud, Copy) */}
                    {!isUser && (
                      <div className="flex items-center gap-2 pl-2">
                        {/* Voice Listen Button (Same Language) */}
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content, msg.language_code || msgLangCode)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isPlaying
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title={isPlaying ? t.actions.stopVoice : t.actions.listen}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current text-emerald-600" />
                              <span>{t.actions.stopVoice}</span>
                              <span className="flex gap-0.5 items-end h-3 ml-1">
                                <span className="w-1 bg-emerald-600 rounded-full h-2 animate-bounce"></span>
                                <span className="w-1 bg-emerald-600 rounded-full h-3 animate-bounce [animation-delay:0.1s]"></span>
                                <span className="w-1 bg-emerald-600 rounded-full h-1.5 animate-bounce [animation-delay:0.2s]"></span>
                              </span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{t.actions.listen}</span>
                            </>
                          )}
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title={t.actions.copy}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">{t.actions.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{t.actions.copy}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Generating State */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 items-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t.actions.detectingLocation}...</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-slate-100 rounded-full w-48 animate-pulse"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-36 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Chat Input Bar */}
          <div className="pt-2 pb-4 bg-transparent">
            <div
              className={`w-full bg-white rounded-2xl sm:rounded-3xl border ${
                isRecording ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'
              } shadow-lg focus-within:border-emerald-500 focus-within:ring-3 focus-within:ring-emerald-500/10 transition-all p-2.5 sm:p-3`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  lastInputWasVoiceRef.current = false;
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={t.actions.askQuestionPlaceholder}
                className="w-full bg-transparent resize-none border-0 text-slate-900 placeholder-slate-400 text-sm focus:outline-none max-h-32"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                {/* Location & Language Quick Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenLocationPicker}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs border border-slate-200"
                    title={t.actions.selectLocation}
                  >
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span className="truncate max-w-[100px]">{currentLocation.city}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLangPopover(!showLangPopover)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs border border-slate-200"
                    title={t.actions.switchLanguage}
                  >
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>{currentLanguage.native_name}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Voice Mic Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2 rounded-xl transition-all ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-xs ring-2 ring-rose-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={isRecording ? t.actions.stopVoice : `${t.actions.listen} (${currentLanguage.native_name})`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className={`p-2 rounded-xl transition-all ${
                      input.trim() && !isLoading
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title={t.actions.send}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
