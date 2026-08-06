export type LangCode = 'en' | 'hi' | 'pa' | 'ur' | 'ks' | 'doi' | 'ne' | 'ta' | 'te' | 'kn' | 'ml'

export type IntentKey =
  | 'currentAlerts'
  | 'safeRoute'
  | 'highRiskZone'
  | 'latestDetection'
  | 'contactOfficer'
  | 'safetyTips'
  | 'todaySummary'

export interface TuskerDict {
  chatbot: {
    title: string
    status: string
    welcome: string
    placeholder: string
    language: string
    clear: string
    typing: string
  }
  actions: Record<IntentKey, string>
  answers: {
    detection: string
    lastDetection: string
    highRiskZone: string
    todayReport: string
    todayStats: string
    devicesOnline: string
    activeAlerts: string
    safety: string
    contactOfficer: string
    fallback: string
  }
  intents: Record<IntentKey, string[]>
}

export const LANGUAGES: Array<{ code: LangCode; name: string; native: string; region: 'global' | 'north' | 'south' }> = [
  { code: 'en', name: 'English', native: 'English', region: 'global' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'north' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'north' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'north' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर', region: 'north' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', region: 'north' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'north' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'south' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'south' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'south' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'south' },
]

export const DEFAULT_LANG: LangCode = 'en'

export function getDict(lang: LangCode): TuskerDict {
  return DICTS[lang] ?? DICTS.en
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String((vars as Record<string, string | number>)[key]) : m))
}

export const DICTS: Record<LangCode, TuskerDict> = {
  en: {
    chatbot: {
      title: 'Tusker AI Assistant',
      status: 'Online · AI-driven · demo mode',
      welcome:
        'Hello! I am Tusker AI Assistant. I can help you understand elephant alerts, safe routes, risk levels, and system information in your preferred language.',
      placeholder: 'Ask about elephant alerts, safe routes, risk levels…',
      language: 'Language',
      clear: 'Clear chat',
      typing: 'Tusker AI is typing…',
    },
    actions: {
      currentAlerts: 'Current Alerts',
      safeRoute: 'Safe Route',
      highRiskZone: 'High Risk Zone',
      latestDetection: 'Latest Detection',
      contactOfficer: 'Contact Forest Officer',
      safetyTips: 'Safety Tips',
      todaySummary: "Generate Today's Summary",
    },
    answers: {
      detection: 'Elephant detected in Zone 3.',
      lastDetection: 'The last elephant was detected in {zone} at {time}.',
      highRiskZone: '{zone} is currently the highest risk zone at {score}% — elephant presence probability ~{prob}%.',
      todayReport: "Generating today's AI incident summary for you now…",
      todayStats: 'Today, {n} elephant movement event(s) were detected and {a} alert(s) are currently active.',
      devicesOnline: '{n} of {m} ESP8266 devices are online and reporting.',
      activeAlerts: 'Currently {n} active alert(s).',
      safety:
        'Safety instructions:\n• Keep at least 100 metres away from elephants.\n• Avoid walking near forest edges from dusk to dawn.\n• If an elephant blocks the road, stop and take an alternate route.\n• Report sightings immediately to the forest control room.\n• Never corner, chase or provoke an elephant.',
      contactOfficer: 'Contact your forest officer: {name} ({phone}). For emergencies, dial the forest control room.',
      fallback:
        "I can help with current alerts, safe routes, high-risk zones, latest detections, officer contacts, safety tips and today's summary. Try one of the quick actions below.",
    },
    intents: {
      currentAlerts: ['current alerts', 'alerts', 'active alert'],
      safeRoute: ['safe route', 'route', 'roads', 'travel', 'alternate'],
      highRiskZone: ['high risk', 'risk zone', 'dangerous', 'danger'],
      latestDetection: ['last', 'latest', 'where', 'detected', 'found'],
      contactOfficer: ['officer', 'contact', 'phone', 'call', 'emergency'],
      safetyTips: ['safety', 'instructions', 'protect', 'tips'],
      todaySummary: ['report', 'summary', 'today', 'stats', 'statistics'],
    },
  },

  hi: {
    chatbot: {
      title: 'टस्कर AI असिस्टेंट',
      status: 'ऑनलाइन · एआई-संचालित · डेमो मोड',
      welcome:
        'नमस्ते! मैं टस्कर AI असिस्टेंट हूँ। मैं हाथियों के अलर्ट, सुरक्षित मार्गों, जोखिम स्तरों और सिस्टम की जानकारी आपकी पसंदीदा भाषा में समझा सकता हूँ।',
      placeholder: 'हाथी अलर्ट, सुरक्षित मार्ग, जोखिम स्तर…',
      language: 'भाषा',
      clear: 'चैट साफ़ करें',
      typing: 'टस्कर AI लिख रहा है…',
    },
    actions: {
      currentAlerts: 'वर्तमान अलर्ट',
      safeRoute: 'सुरक्षित मार्ग',
      highRiskZone: 'उच्च जोखिम वाला क्षेत्र',
      latestDetection: 'नवीनतम पहचान',
      contactOfficer: 'वन अधिकारी से संपर्क',
      safetyTips: 'सुरक्षा सुझाव',
      todaySummary: 'आज का सारांश बनाएं',
    },
    answers: {
      detection: 'ज़ोन 3 में हाथी देखा गया है।',
      lastDetection: 'अंतिम हाथी {zone} में {time} पर देखा गया।',
      highRiskZone: '{zone} वर्तमान में {score}% के साथ सबसे अधिक जोखिम वाला क्षेत्र है — हाथी उपस्थिति की संभावना ~{prob}%।',
      todayReport: 'आज की घटना रिपोर्ट तैयार हो रही है…',
      todayStats: 'आज {n} हाथी गतिविधि का पता लगा और वर्तमान में {a} अलर्ट सक्रिय हैं।',
      devicesOnline: '{m} में से {n} ESP8266 डिवाइस ऑनलाइन हैं।',
      activeAlerts: 'वर्तमान में {n} सक्रिय अलर्ट हैं।',
      safety:
        'सुरक्षा निर्देश:\n• हाथियों से कम से कम 100 मीटर दूर रहें।\n• शाम से सुबह तक जंगल के किनारों से दूर रहें।\n• यदि हाथी रास्ता रोके तो रुकें और वैकल्पिक मार्ग लें।\n• घटना की सूचना तुरंत वन नियंत्रण कक्ष को दें।\n• हाथी को भड़काएं या घेरें नहीं।',
      contactOfficer: 'वन अधिकारी से संपर्क करें: {name} ({phone})। आपातकाल के लिए वन नियंत्रण कक्ष को कॉल करें।',
      fallback:
        'मैं वर्तमान अलर्ट, सुरक्षित मार्गों, उच्च जोखिम वाले क्षेत्रों, नवीनतम पहचान, अधिकारी संपर्क, सुरक्षा सुझावों और आज के सारांश में मदद कर सकता हूँ। नीचे एक सुझाव आज़माएं।',
    },
    intents: {
      currentAlerts: ['अलर्ट', 'चेतावनी'],
      safeRoute: ['सुरक्षित', 'मार्ग', 'रास्ता'],
      highRiskZone: ['जोखिम', 'खतरनाक', 'ज़ोन', 'क्षेत्र'],
      latestDetection: ['अंतिम', 'नवीनतम', 'कहाँ', 'मिला'],
      contactOfficer: ['अधिकारी', 'संपर्क', 'फोन', 'कॉल'],
      safetyTips: ['सुरक्षा', 'सुझाव', 'निर्देश'],
      todaySummary: ['रिपोर्ट', 'सारांश', 'आज', 'आंकड़े'],
    },
  },

  pa: {
    chatbot: {
      title: 'ਟਸਕਰ AI ਸਹਾਇਕ',
      status: 'ਆਨਲਾਈਨ · ਏਆਈ-ਸੰਚਾਲਿਤ · ਡੈਮੋ ਮੋਡ',
      welcome:
        'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਟਸਕਰ AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਹਾਥੀਆਂ ਦੇ ਅਲਰਟ, ਸੁਰੱਖਿਅਤ ਰਸਤੇ, ਖਤਰੇ ਦੇ ਪੱਧਰ ਅਤੇ ਸਿਸਟਮ ਦੀ ਜਾਣਕਾਰੀ ਨੂੰ ਤੁਹਾਡੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾ ਸਕਦਾ ਹਾਂ।',
      placeholder: 'ਹਾਥੀ ਅਲਰਟ, ਸੁਰੱਖਿਅਤ ਰਸਤੇ, ਖਤਰੇ ਦਾ ਪੱਧਰ…',
      language: 'ਭਾਸ਼ਾ',
      clear: 'ਚੈਟ ਸਾਫ਼ ਕਰੋ',
      typing: 'ਟਸਕਰ AI ਟਾਈਪ ਕਰ ਰਿਹਾ ਹੈ…',
    },
    actions: {
      currentAlerts: 'ਜਾਰੀ ਅਲਰਟ',
      safeRoute: 'ਸੁਰੱਖਿਅਤ ਰਸਤਾ',
      highRiskZone: 'ਉੱਚ ਜੋਖਮ ਵਾਲਾ ਜ਼ੋਨ',
      latestDetection: 'ਤਾਜ਼ਾ ਖੋਜ',
      contactOfficer: 'ਵਣ ਅਧਿਕਾਰੀ ਨਾਲ ਸੰਪਰਕ',
      safetyTips: 'ਸੁਰੱਖਿਆ ਸੁਝਾਅ',
      todaySummary: 'ਅੱਜ ਦਾ ਸਾਰ ਬਣਾਓ',
    },
    answers: {
      detection: 'ਜ਼ੋਨ 3 ਵਿੱਚ ਹਾਥੀ ਮਿਲਿਆ ਹੈ।',
      lastDetection: 'ਆਖ਼ਰੀ ਹਾਥੀ {zone} ਵਿੱਚ {time} ਨੂੰ ਮਿਲਿਆ।',
      highRiskZone: '{zone} ਇਸ ਸਮੇਂ {score}% ਨਾਲ ਸਭ ਤੋਂ ਉੱਚ-ਜੋਖਮ ਵਾਲਾ ਜ਼ੋਨ ਹੈ — ਹਾਥੀ ਦੀ ਮੌਜੂਦਗੀ ਦੀ ਸੰਭਾਵਨਾ ~{prob}%।',
      todayReport: 'ਅੱਜ ਦੀ ਘਟਨਾ ਰਿਪੋਰਟ ਤਿਆਰ ਹੋ ਰਹੀ ਹੈ…',
      todayStats: 'ਅੱਜ {n} ਹਾਥੀ ਗਤੀਵਿਧੀਆਂ ਦਾ ਪਤਾ ਲੱਗਾ ਅਤੇ {a} ਅਲਰਟ ਸਰਗਰਮ ਹਨ।',
      devicesOnline: '{m} ਵਿੱਚੋਂ {n} ESP8266 ਡਿਵਾਈਸ ਆਨਲਾਈਨ ਹਨ।',
      activeAlerts: 'ਇਸ ਸਮੇਂ {n} ਸਰਗਰਮ ਅਲਰਟ।',
      safety:
        'ਸੁਰੱਖਿਆ ਨਿਰਦੇਸ਼:\n• ਹਾਥੀਆਂ ਤੋਂ ਘੱਟੋ-ਘੱਟ 100 ਮੀਟਰ ਦੂਰ ਰਹੋ।\n• ਸ਼ਾਮ ਤੋਂ ਸਵੇਰ ਤੱਕ ਜੰਗਲ ਦੇ ਕਿਨਾਰਿਆਂ ਤੋਂ ਦੂਰ ਰਹੋ।\n• ਜੇ ਹਾਥੀ ਰਸਤਾ ਰੋਕੇ ਤਾਂ ਰੁਕੋ ਅਤੇ ਦੂਜਾ ਰਸਤਾ ਲਓ।\n• ਘਟਨਾ ਦੀ ਸੂਚਨਾ ਤੁਰੰਤ ਵਣ ਵਿਭਾਗ ਨੂੰ ਦਿਓ।\n• ਹਾਥੀ ਨੂੰ ਉਕਸਾਓ ਜਾਂ ਤੰਗ ਨਾ ਕਰੋ।',
      contactOfficer: 'ਵਣ ਅਧਿਕਾਰੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ: {name} ({phone})।',
      fallback:
        'ਮੈਂ ਜਾਰੀ ਅਲਰਟ, ਸੁਰੱਖਿਅਤ ਰਸਤੇ, ਉੱਚ ਜੋਖਮ ਵਾਲੇ ਜ਼ੋਨ, ਤਾਜ਼ਾ ਖੋਜ, ਅਧਿਕਾਰੀ ਸੰਪਰਕ, ਸੁਰੱਖਿਆ ਸੁਝਾਅ ਅਤੇ ਅੱਜ ਦੇ ਸਾਰ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਨੀਂਚੇ ਇੱਕ ਸੁਝਾਅ ਚੁਣੋ।',
    },
    intents: {
      currentAlerts: ['ਅਲਰਟ', 'ਚੇਤਾਵਨੀ'],
      safeRoute: ['ਸੁਰੱਖਿਅਤ', 'ਰਸਤਾ', 'ਸੜਕ'],
      highRiskZone: ['ਜੋਖਮ', 'ਖਤਰਨਾਕ', 'ਜ਼ੋਨ'],
      latestDetection: ['ਆਖ਼ਰੀ', 'ਤਾਜ਼ਾ', 'ਕਿੱਥੇ', 'ਮਿਲਿਆ'],
      contactOfficer: ['ਅਧਿਕਾਰੀ', 'ਸੰਪਰਕ', 'ਫ਼ੋਨ'],
      safetyTips: ['ਸੁਰੱਖਿਆ', 'ਸੁਝਾਅ', 'ਨਿਰਦੇਸ਼'],
      todaySummary: ['ਰਿਪੋਰਟ', 'ਸਾਰ', 'ਅੱਜ', 'ਅੰਕੜੇ'],
    },
  },

  ur: {
    chatbot: {
      title: 'ٹسکر AI اسسٹنٹ',
      status: 'آن لائن · اے آئی سے چلنے والا · ڈیمو موڈ',
      welcome:
        'ہیلو! میں ٹسکر AI اسسٹنٹ ہوں۔ میں ہاتھیوں کے الرٹس، محفوظ راستوں، خطرے کی سطحوں اور نظام کی معلومات کو آپ کی پسندیدہ زبان میں سمجھا سکتا ہوں۔',
      placeholder: 'ہاتھی الرٹس، محفوظ راستے، خطرے کی سطح…',
      language: 'زبان',
      clear: 'چیٹ صاف کریں',
      typing: 'ٹسکر AI لکھ رہا ہے…',
    },
    actions: {
      currentAlerts: 'موجودہ الرٹس',
      safeRoute: 'محفوظ راستہ',
      highRiskZone: 'خطرناک زون',
      latestDetection: 'تازہ ترین شناخت',
      contactOfficer: 'فارسٹ آفیسر سے رابطہ',
      safetyTips: 'حفاظتی نکات',
      todaySummary: 'آج کا خلاصہ بنائیں',
    },
    answers: {
      detection: 'زون 3 میں ہاتھی دیکھا گیا ہے۔',
      lastDetection: 'آخری ہاتھی {zone} میں {time} پر دیکھا گیا۔',
      highRiskZone: '{zone} فی الحال {score}% کے ساتھ سب سے زیادہ خطرناک زون ہے — ہاتھی کی موجودگی کا امکان ~{prob}%۔',
      todayReport: 'آج کی رپورٹ تیار کی جا رہی ہے…',
      todayStats: 'آج {n} ہاتھی کی نقل و حرکت کا پتہ چلا اور {a} الرٹس فعال ہیں۔',
      devicesOnline: '{m} میں سے {n} ESP8266 ڈیوائسز آن لائن ہیں۔',
      activeAlerts: 'فی الحال {n} فعال الرٹس۔',
      safety:
        'حفاظتی نکات:\n• ہاتھیوں سے کم از کم 100 میٹر دور رہیں۔\n• شام سے صبح تک جنگل کے کناروں پر نہ جائیں۔\n• اگر ہاتھی راستہ روکے تو رکیں اور متبادل راستہ لیں۔\n• واقعہ کی اطلاع فوری طور پر دیں۔\n• ہاتھی کو کبھی نہ بھڑکائیں۔',
      contactOfficer: 'فارسٹ آفیسر سے رابطہ کریں: {name} ({phone})۔',
      fallback:
        'میں موجودہ الرٹس، محفوظ راستوں، خطرناک زونز، تازہ شناخت، افسر رابطے، حفاظتی نکات اور آج کے خلاصے میں مدد کر سکتا ہوں۔ نیچے ایک تجویز آزمائیں۔',
    },
    intents: {
      currentAlerts: ['الرٹ', 'الرٹس'],
      safeRoute: ['محفوظ', 'راستہ', 'سڑک'],
      highRiskZone: ['خطرناک', 'خطرہ', 'زون'],
      latestDetection: ['آخری', 'تازہ', 'کہاں', 'دیکھا'],
      contactOfficer: ['افسر', 'رابطہ', 'فون'],
      safetyTips: ['حفاظت', 'نکات', 'ہدایات'],
      todaySummary: ['رپورٹ', 'خلاصہ', 'آج', 'اعداد'],
    },
  },

  ks: {
    chatbot: {
      title: 'टस्कर AI असिस्टंट',
      status: 'ऑनलाइन · एआई-संचालित · डेमो मोड',
      welcome:
        'सलाम! मैं छुस् टस्कर AI असिस्टंट। मैं हाथिन् हुंज़ अलर्ट, सुरक्षित रस्त्, ज़ोख़िम तर् ते सिस्टम हुंज़ ज़ानकारी त्वान् ज़बान् मंज़ समझावन।',
      placeholder: 'हाथिन् हुंज़ अलर्ट, सुरक्षित रस्त्, ज़ोख़िम…',
      language: 'ज़बान',
      clear: 'चैट साफ़ कराव',
      typing: 'टस्कर AI लिखान छु…',
    },
    actions: {
      currentAlerts: 'वर्तमान अलर्ट',
      safeRoute: 'सुरक्षित रस्ता',
      highRiskZone: 'उच्च ज़ोख़िम वरुन',
      latestDetection: 'नविनतम पहचान',
      contactOfficer: 'वन अधिकारीस पत् कराव',
      safetyTips: 'सुरक्षा सुझाव',
      todaySummary: 'अज़ हुंज़ सारांश बनाव',
    },
    answers: {
      detection: 'ज़ोन 3 मंज़ हाथ्य वछावन।',
      lastDetection: 'अख़िरी हाथ्य {zone} मंज़ {time} पेठ वछावन।',
      highRiskZone: '{zone} छु अज़ {score}% सिति बड़ ज़ोख़िम वरुन — हाथ्य उपस्थिति ~{prob}%।',
      todayReport: 'अज़ हुंज़ी रिपोर्ट तैयार गछ़ान…',
      todayStats: 'अज़ {n} हाथ्य गतिविधि पछान्य, ते अज़ {a} अलर्ट सक्रिय छि।',
      devicesOnline: '{m} मंज़ {n} ESP8266 डिवाइस ऑनलाइन छि।',
      activeAlerts: 'अज़ {n} सक्रिय अलर्ट छि।',
      safety:
        'सुरक्षा हिदायत्:\n• हाथिन् त 100 मीटर दूर रहिव।\n• शामि स्यु ब्रान्हि तै जंगल हुंज़ किनारन पेठ नी वुछिव।\n• यदि हाथ्य रस्त रोकावि तुह रुकिव ते विकल्प रस्त वुछिव।\n• हाथ्य वुचि पत् वन नियंत्रण कक्षस खबर दिव।\n• हाथ्यस नी छेंदिव नी भड़काविव।',
      contactOfficer: 'वन अधिकारीस पत् कराव: {name} ({phone})।',
      fallback:
        'मैं वर्तमान अलर्ट, सुरक्षित रस्त्, बड़ ज़ोख़िम वरुन, नविनतम पहचान, अधिकारी संपर्क, सुरक्षा सुझाव ते अज़ हुंज़ सारांश मंज़ मदद करन।',
    },
    intents: {
      currentAlerts: ['अलर्ट', 'अलर'],
      safeRoute: ['सुरक्षित', 'रस्त', 'रस्ता'],
      highRiskZone: ['ज़ोख़िम', 'वरुन', 'ज़ोन'],
      latestDetection: ['अख़िरी', 'नविन', 'कत्', 'वछावन'],
      contactOfficer: ['अधिकारी', 'संपर्क', 'फोन'],
      safetyTips: ['सुरक्षा', 'सुझाव', 'हिदायत'],
      todaySummary: ['रिपोर्ट', 'सारांश', 'अज़'],
    },
  },

  doi: {
    chatbot: {
      title: 'टस्कर AI असिस्टेंट',
      status: 'ऑनलाइन · एआई-संचालित · डेमो मोड',
      welcome:
        'जय हो! मैं टस्कर AI असिस्टेंट आं। मैं हाथियां दे अलर्ट, सुरक्षित रस्ते, जोखिम दी लेवल ते सिस्टम दी जानकारी थुहाड़ी पसंदीदा भाषा च समझा सकदा आं।',
      placeholder: 'हाथी अलर्ट, सुरक्षित रस्ते, जोखिम दी लेवल…',
      language: 'भाषा',
      clear: 'चैट साफ़ करो',
      typing: 'टस्कर AI लिखदा ऐ…',
    },
    actions: {
      currentAlerts: 'वर्तमान अलर्ट',
      safeRoute: 'सुरक्षित रस्ता',
      highRiskZone: 'उच्च जोखिम वाला ज़ोन',
      latestDetection: 'ताज़ा पहचान',
      contactOfficer: 'वन अधिकारी नाल संपर्क',
      safetyTips: 'सुरक्षा सुझाव',
      todaySummary: 'अज दा सारांश बनाओ',
    },
    answers: {
      detection: 'ज़ोन 3 च हाथी दिक्खेआ गेआ ऐ।',
      lastDetection: 'आख़री हाथी {zone} च {time} गै दिक्खेआ गेआ।',
      highRiskZone: '{zone} हाले {score}% दी सतह नाल सबने बड़ा जोखिम वाला ज़ोन ऐ — हाथी दी मौजूदगी ~{prob}%।',
      todayReport: 'अज दी रिपोर्ट तैयार होई गेई ऐ…',
      todayStats: 'अज {n} हाथी दी हरकत दा पता लग्गा ते {a} अलर्ट सक्रिय न।',
      devicesOnline: '{m} चें {n} ESP8266 डिवाइस ऑनलाइन न।',
      activeAlerts: 'हाले {n} सक्रिय अलर्ट।',
      safety:
        'सुरक्षा निर्देश:\n• हाथियां तैं घट्टो-घट्ट 100 मीटर दूर रहो।\n• शाम ते सुबह दे बीच जंगल दे किन्नियां तैं दूर रहो।\n• जे हाथी रस्ता रोके ता रुको ते दूजा रस्ता चलेओ।\n• हाथी दिक्खदे ई वन विभाग नुं सूचित करो।\n• हाथी नुं कदे ना भड़काओ।',
      contactOfficer: 'अपने वन अधिकारी नाल संपर्क करो: {name} ({phone})।',
      fallback:
        'मैं वर्तमान अलर्ट, सुरक्षित रस्ते, उच्च जोखिम वाले ज़ोन, ताज़ा पहचान, अधिकारी संपर्क, सुरक्षा सुझाव ते अज दे सारांश च मदद कर सकदा आं। थल्ले दे सुझावां चें इक चुनो।',
    },
    intents: {
      currentAlerts: ['अलर्ट', 'चेतावनी'],
      safeRoute: ['सुरक्षित', 'रस्ता', 'रस्ते'],
      highRiskZone: ['जोखिम', 'खतरनाक', 'ज़ोन'],
      latestDetection: ['आख़री', 'ताज़ा', 'कित्थे', 'दिक्खेआ'],
      contactOfficer: ['अधिकारी', 'संपर्क', 'फोन'],
      safetyTips: ['सुरक्षा', 'सुझाव', 'निर्देश'],
      todaySummary: ['रिपोर्ट', 'सारांश', 'अज', 'आंकड़े'],
    },
  },

  ne: {
    chatbot: {
      title: 'टस्कर AI सहायक',
      status: 'अनलाइन · एआई-संचालित · डेमो मोड',
      welcome:
        'नमस्ते! म टस्कर सहायक हुँ। म हात्ती अलर्ट, सुरक्षित मार्ग, जोखिम स्तर र प्रणालीको जानकारी तपाईंको मनपर्ने भाषामा बुझाउन सक्छु।',
      placeholder: 'हात्ती अलर्ट, सुरक्षित मार्ग, जोखिम…',
      language: 'भाषा',
      clear: 'च्याट खाली गर्नुहोस्',
      typing: 'टस्कर AI लेख्दैछ…',
    },
    actions: {
      currentAlerts: 'हालका अलर्टहरू',
      safeRoute: 'सुरक्षित मार्ग',
      highRiskZone: 'उच्च जोखिम क्षेत्र',
      latestDetection: 'नयाँ पहिचान',
      contactOfficer: 'वन अधिकृतसँग सम्पर्क',
      safetyTips: 'सुरक्षा सुझाव',
      todaySummary: "आजको सारांश बनाउनुहोस्",
    },
    answers: {
      detection: 'जोन ३ मा हात्ती भेटियो।',
      lastDetection: 'अन्तिम हात्ती {zone} मा {time} मा भेटियो।',
      highRiskZone: 'हाल {zone} जोखिममा छ, स्कोर {score}% — हात्ती आउने सम्भावना ~{prob}%।',
      todayReport: 'आजको रिपोर्ट तयार गर्दैछु…',
      todayStats: 'आज {n} हात्ती गतिविधि पत्ता लाग्यो र {a} अलर्ट सक्रिय छन्।',
      devicesOnline: '{m} मध्ये {n} ESP8266 यन्त्रहरू अनलाइन छन्।',
      activeAlerts: 'हाल {n} सक्रिय अलर्टहरू।',
      safety:
        'सुरक्षा सुझाव:\n• हात्तीबाट कम्तिमा १०० मिटर टाढा रहनुहोस्।\n• साँझदेखि बिहानसम्म जङ्गल किनारमा नहिड्नुहोस्।\n• हात्तीले बाटो रोकेर उभिनुहोस् र फर्कनुहोस्।\n• कुनै घटना देखिए तुरुन्तै वन विभागलाई भन्नुहोस्।',
      contactOfficer: 'वन अधिकृतसँग सम्पर्क: {name} ({phone})।',
      fallback:
        'म हालका अलर्ट, सुरक्षित मार्ग, उच्च जोखिम क्षेत्र, नयाँ पहिचान, अधिकृत स्पर्क, सुरक्षा सुझाव र आजको सारांशमा सहयोग गर्न सक्छु।',
    },
    intents: {
      currentAlerts: ['अलर्ट', 'चेतावनी'],
      safeRoute: ['सुरक्षित', 'मार्ग', 'बाटो'],
      highRiskZone: ['जोखिम', 'खतरनाक', 'क्षेत्र', 'जोन'],
      latestDetection: ['अन्तिम', 'नयाँ', 'कहाँ', 'भेटियो'],
      contactOfficer: ['अधिकृत', 'सम्पर्क', 'फोन'],
      safetyTips: ['सुरक्षा', 'सुझाव', 'निर्देश'],
      todaySummary: ['रिपोर्ट', 'सारांश', 'आज', 'तथ्यांक'],
    },
  },

  ta: {
    chatbot: {
      title: 'டஸ்கர் AI உதவியாளர்',
      status: 'நிகழ்நிலை · AI இயக்கheta · டெமோ முறை',
      welcome:
        'வணக்கம்! நான் டஸ்கர் AI உதவியாளர். யானை எச்சரிக்கைகள், பாதுகாப்பான வழிகள், ஆபத்து நிலைகள், அமைப்பு தகவல்களை உங்கள் மொழியில் விளக்க முடியும்.',
      placeholder: 'யானை எச்சரிக்கை, பாதுகாப்பான வழி, ஆபத்து…',
      language: 'மொழி',
      clear: 'அரட்டையை அழி',
      typing: 'டஸ்கர் AI தட்டச்சு செய்கிறது…',
    },
    actions: {
      currentAlerts: 'தற்போதைய எச்சரிக்கைகள்',
      safeRoute: 'பாதுகாப்பான வழி',
      highRiskZone: 'அதிக ஆபத்து மண்டலம்',
      latestDetection: 'சமீபத்திய கண்டறிதல்',
      contactOfficer: 'வன அதிகாரியை தொடர்பு கொள்ள',
      safetyTips: 'பாதுகாப்பு குறிப்புகள்',
      todaySummary: "இன்றைய சுருக்கத்தை உருவாக்கு",
    },
    answers: {
      detection: 'மண்டலம் 3-ல் யானை கண்டறியப்பட்டது.',
      lastDetection: 'கடைசி யானை {zone}இல் {time} அளவில் கண்டறியப்பட்டது.',
      highRiskZone: '{zone} தற்போது {score}% உடன் அதிக ஆபத்து மண்டலம் — யானை வாய்ப்பு ~{prob}%.',
      todayReport: 'இன்றைய அறிக்கையை உருவாக்குகிறேன்…',
      todayStats: 'இன்று {n} யானை இயக்கங்கள் கண்டறியப்பட்டன, {a} எச்சரிக்கைகள் செயலில் உள்ளன.',
      devicesOnline: '{m} இல் {n} ESP8266 சாதனங்கள் நிலையில் உள்ளன.',
      activeAlerts: 'தற்போது {n} செயலில் எச்சரிக்கைகள்.',
      safety:
        'பாதுகாப்பு குறிப்புகள்:\n• யானைகளில் இருந்து 100 மீட்டர் தொலைவில் இருங்கள்.\n• மாலை-அதிகாலை காடு ஓரங்களில் செல்ல வேண்டாம்.\n• யானை பாதையை மறைத்து மாற்று பாதையைப் பயன்படுத்துங்கள்.\n• சந்தித்தால் உடனே வன அதிகாரிக்கு தெரிவிக்கவும்.',
      contactOfficer: 'வன அதிகாரியை தொடர்பு: {name} ({phone})',
      fallback:
        'தற்போதைய எச்சரிக்கைகள், பாதுகாப்பான வழிகள், ஆபத்து மண்டலங்கள், சமீபத்திய கண்டறிதல், அதிகாரி தொடர்பு, பாதுகாப்பு குறிப்புகள் இவற்றில் உதவ முடியும்.',
    },
    intents: {
      currentAlerts: ['எச்சரிக்கை', 'அலர்ட்'],
      safeRoute: ['பாதுகாப்பு', 'வழி', 'சாலை'],
      highRiskZone: ['ஆபத்து', 'அபாயம்', 'மண்டலம்'],
      latestDetection: ['கடைசி', 'சமீபத்திய', 'எங்கே', 'கண்டறிய'],
      contactOfficer: ['அதிகாரி', 'தொடர்பு', 'ஃபோன்'],
      safetyTips: ['பாதுகாப்பு', 'குறிப்பு', 'வழிமுறை'],
      todaySummary: ['அறிக்கை', 'சுருக்கம்', 'இன்று', 'புள்ளி'],
    },
  },

  te: {
    chatbot: {
      title: 'టస్కర్ AI సహాయకుడు',
      status: 'ఆన్లైన్ · AI నడుపుతున్న · డెమో మోడ్',
      welcome:
        'నమస్తే! నేను టస్కర్ AI సహాయకుణ్ణి. ఏనుగు హెచ్చరికలు, సురక్షిత మార్గాలు, ప్రమాద స్థాయిలు, సిస్టమ్ సమాచారం మీ ఇష్టమైన భాషలో వివరించగలను.',
      placeholder: 'ఏనుగు హెచ్చరికలు, సురక్షిత మార్గాలు, ప్రమాద స్థాయిలు…',
      language: 'భాష',
      clear: 'చాట్ తొలగించండి',
      typing: 'టస్కర్ AI టైప్ చేస్తోంది…',
    },
    actions: {
      currentAlerts: 'ప్రస్తుత హెచ్చరికలు',
      safeRoute: 'సురక్షిత మార్గం',
      highRiskZone: 'అధిక ప్రమాద జోన్',
      latestDetection: 'తాజా గుర్తింపు',
      contactOfficer: 'అటవీ అధికారిని సంప్రదించండి',
      safetyTips: 'భద్రత చిట్కాలు',
      todaySummary: "నేటి సారాంశాన్ని రూపొందించండి",
    },
    answers: {
      detection: 'జోన్ 3లో ఏనుగు గుర్తించబడింది.',
      lastDetection: 'చివరి ఏనుగు {zone}లో {time}కి గుర్తించబడింది.',
      highRiskZone: '{zone} ఇప్పుడు {score}%తో అత్యధిక ప్రమాద జోన్ — ఏనుగు వచ్చే అవకాశ ~{prob}%.',
      todayReport: 'నేటి రిపోర్ట్ సిద్ధం చేస్తున్నా…',
      todayStats: 'ఈరోజు {n} ఏనుగు కదలికల గుర్తించబడ్డాయి, {a} హెచ్చరికలు చురుకుగా.',
      devicesOnline: '{m} లో {n} ESP8266 పరికరాలు ఆన్లైన్‌లో ఉన్నాయి.',
      activeAlerts: 'ప్రస్తుతం {n} చురుకైన హెచ్చరికలు.',
      safety:
        'భద్రతా చిట్కాలు:\n• ఏనుగులకు 100 మీటర్ల దూరంలో ఉండండి.\n• సాయంత్రం నుండి ఉదయం వరకు అడవి అంచుల మార్గాల్లో వెళ్లొద్దు.\n• ఏనుగు మార్గం అడ్డుకుంటే ఆగి మరో మార్గం తీసుకోండి.\n• చూసిన వెంటనే అటవీ అధికారికి తెలియజేయండి.\n• ఏనుగును ఎప్పుడూ రెచ్చగొట్టవద్దు.',
      contactOfficer: 'అటవీ అధికారిని సంప్రదించండి: {name} ({phone})',
      fallback:
        'ప్రస్తుత హెచ్చరికలు, సురక్షిత మార్గాలు, ఎక్కువ ప్రమాద జోన్లు, తాజా గుర్తింపు, అధికారి సంపర్కం, భద్రత చిట్కాలు, నేటి సారాంశం వంటి విషయాలకు సహాయం చేయగలను.',
    },
    intents: {
      currentAlerts: ['హెచ్చరిక', 'అలర్ట్'],
      safeRoute: ['సురక్షిత', 'మార్గం', 'దారి'],
      highRiskZone: ['ప్రమాదం', 'జోన్', 'రిస్క్'],
      latestDetection: ['చివరి', 'తాజా', 'ఎక్కడ', 'గుర్తించ'],
      contactOfficer: ['అధికారి', 'సంపర్క', 'కాల్'],
      safetyTips: ['భద్రత', 'చిట్కా', 'సూచన'],
      todaySummary: ['నివేదిక', 'సారాంశం', 'ఈరోజు', 'గణాంకాలు'],
    },
  },

  kn: {
    chatbot: {
      title: 'ಟಸ್ಕರ್ AI ಸಹಾಯಕ',
      status: 'ಆನ್‌ಲೈನ್ · AI ನಡೆಸುತ್ತೇವೆ · ಡೆಮೊ ಮೋಡ್',
      welcome:
        'ನಮಸ್ಕಾರ! ನಾನು ಟಸ್ಕರ್ AI ಸಹಾಯಕ. ಆನೆ ಎಚ್ಚರಿಕೆಗಳು, ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು, ಅಪಾಯದ ಮಟ್ಟಗಳು, ವ್ಯವಸ್ಥೆಯ ಮಾಹಿತಿಯನ್ನು ನಿಮ್ಮ ಆದ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಬಲ್ಲೆ.',
      placeholder: 'ಆನೆ ಎಚ್ಚರಿಕೆ, ಸುರಕ್ಷಿತ ಮಾರ್ಗ, ಅಪಾಯದ ಮಟ್ಟ…',
      language: 'ಭಾಷೆ',
      clear: 'ಚಾಟ್ ಅಳಿಸಿ',
      typing: 'ಟಸ್ಕರ್ AI ಟೈಪ್ ಮಾಡುತ್ತಿದೆ…',
    },
    actions: {
      currentAlerts: 'ಪ್ರಸನುತ್ತ ಎಚ್ಚರಿಕೆಗಳು',
      safeRoute: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ',
      highRiskZone: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ವಲಯ',
      latestDetection: 'ಇತ್ತೀಚಿನ ಪತ್ತೆ',
      contactOfficer: 'ಅರಣ್ಯ ಅಧಿಕಾರಿಗೆ ಸಂಪರ್ಕಿಸಿ',
      safetyTips: 'ಸುರಕ್ಷತೆ ನಿಯಮಗಳು',
      todaySummary: "ಇಂದಿನ ಸಾರಾಂಶ ರಚಿಸಿ",
    },
    answers: {
      detection: 'ದಿನ 3ರಲ್ಲಿ ಆನೆ ಪತ್ತೆಯಾಗಿದೆ.',
      lastDetection: 'ಕೊನೆಯ ಆನೆ {zone} ನಲ್ಲಿ {time} ಕ್ಕೆ ಪತ್ತೆಯಾಗಿದೆ.',
      highRiskZone: '{zone} ಇದು {score}% ನ ಅಪಾಯದ ವಲಯ — ಆನೆ ಇರುವ ಸಂಭವ ~{prob}%.',
      todayReport: 'ಇಂದಿನ ವರದಿ ತಯಾರಿಸುತ್ತಿದ್ದೇನೆ…',
      todayStats: 'ಇಂದು {n} ಆನೆಗಳು ಪತ್ತೆಯಾದವು, {a} ಎಚ್ಚರಿಕೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.',
      devicesOnline: '{m} ನಲ್ಲಿ {n} ESP8266 ಸಾಧನಗಳು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ.',
      activeAlerts: 'ಇವು {n} ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳ.',
      safety:
        'ಸುರಕ್ಷತೆ ಸಲಹೆಗಳು:\n• ಆನೆಗಳಿಂದ 100 ಮೀటರ್ ದೂರ ಇರಿ.\n• ಸಾಯಂದ್ರದ ನಂತರ ಕಾಡಾದರ್ ಮಾರ್ಗಕ್ಕೆ ಹೋಗಬೇಡಿ.\n• ಆನೆ ಮಾರ್ಗ ತಡೆದರ ಮತ್ತೊಂದ ಮಾರ್ಗ ತೆಗೆದುಕೊಳ್ಳಿ.\n• ಕಂಡ ನಂತರ ಅರಣ್ಯ ಅಧಿಕಾರಿಗೆ ತಿಳಿಸಿಕೊಡಿ.',
      contactOfficer: 'ಅರಣ್ಯ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ: {name} ({phone})',
      fallback: 'ಪ್ರಸ್ತುತ ಎಚ್ಚರಿಕೆಗಳು, ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು, ಅಪಾಯ ವಲಯಗಳು, ಪತ್ತೆ, ಸಂಪರ್ಕ, ಸುರಕ್ಷತಾ ಸಲಹೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    },
    intents: {
      currentAlerts: ['ಎಚ್ಚರಿಕೆ', 'ಅಲರ್ಟ್'],
      safeRoute: ['ಸು ', 'ಮಾರ್ಗ', 'ದಾರಿ'],
      highRiskZone: ['ಅಪಾಯ', 'ವಲಯ', 'ಜೋನ್'],
      latestDetection: ['ಕೊನೆಯ', 'ಇತ್ತೀಚಿನ', 'ಕೆದೆ', 'ಪತ್ತೆಯಾಗಿ'],
      contactOfficer: ['ಅಧಿಕಾರಿ', 'ಸಂಪರ್ಕ', 'ಫೋನ್'],
      safetyTips: ['ಸುರಕ್ಷಗಳ', 'ಸಲಹೆ', 'ಸೂಕ'],
      todaySummary: ['ವರದಿ', 'ಸಾರಾಂಶ', 'ಇಂದು', 'ಅಂಕಿ'],
    },
  },

  ml: {
    chatbot: {
      title: 'ടസ്കർ AI അസിസ്റ്റന്റ്',
      status: 'ഓൺലൈൻ · AI-നിയന്ത്രിതം · ഡെമോ മോഡ്',
      welcome:
        'നമസ്കാരം! ഞാൻ ടസ്കർ AI അസിസ്റ്റന്റ് ആണ്. ആന മുന്നറിയിപ്പുകൾ, സുരക്ഷിത വഴികൾ, അപകട നികകൾ, സിസ്റ്റം വിവരങ്ങൾ എന്നിവ നിങ്ങളുടെ ഭാഷയിൽ വിശദീകരിക്കാം.',
      placeholder: 'ആന മുന്നറിയിപ്പുകൾ, സുരക്ഷിത വഴികൾ, അപകട…',
      language: 'ഭാഷ',
      clear: 'ചാറ്റ് മായിക്കുക',
      typing: 'ടസ്കർ AI ടൈപ്പ് ചെയ്യുന്നു…',
    },
    actions: {
      currentAlerts: 'നിലവിലെ മുന്നറിയിപ്പുകൾ',
      safeRoute: 'സുരക്ഷിത വഴി',
      highRiskZone: 'ഉയർന്ന അപകട മേഖല',
      latestDetection: 'ഏറ്റവും പുതിയ കണ്ടെത്തൽ',
      contactOfficer: 'വന ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുക',
      safetyTips: 'സുരക്ഷാ നിർദ്ദേശങ്ങൾ',
      todaySummary: 'ഇന്നത്തെ സംഗ്രഹം നിർമ്മിക്കുക',
    },
    answers: {
      detection: 'മേഖല 3-ൽ ആനയെ കണ്ടെത്തി.',
      lastDetection: 'അവസാന ആന {zone} ൽ {time} ന് കണ്ടെത്തി.',
      highRiskZone: '{zone} ഇപ്പോൾ {score}% അപകട മേഖല — ആന വരാനുള്ള സാധ്യത ~{prob}%.',
      todayReport: 'ഇന്നത്തെ റിപ്പോർട്ട് തയ്യാറാക്കുന്നു…',
      todayStats: 'ഇന്ന് {n} ആന ചലനങ്ങൾ കണ്ടെതു, {a} മുന്നറിയിപ്പുകൾ സജീവം.',
      devicesOnline: '{m} ൽ {n} ESP8266 ഉപകരണകൾ ഓൺലൈൻ.',
      activeAlerts: 'നിലവിൽ {n} സജീവ മുന്നറിയിപ്പുകൾ.',
      safety:
        'സുരക്ഷാ നിർദ്ദേശങ്ങൾ:\n• ആനകളിൽ നിന്ന് 100 മീറ്റർ അകലെ നിൽക്കുക.\n• വൈകുന്നേരം മുതൽ പുലർച്ച വരെ കാടിന്റെ അരികുകളിൽ സഞ്ചരിക്കരുത്.\n• ആന റോഡ് തടഞ്ഞാൽ നിർത്തി മറ്റൊരു വഴി തിരഞ്ഞെടുക്കുക.\n• ആനയെ കണ്ടാൽ വനം വകുപ്പിനെ ഉടൻ അറിയിക്കുക.',
      contactOfficer: 'ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുക: {name} ({phone})',
      fallback:
        'നിലവിലെ മുന്നറിയിപ്പുകൾ, സുരക്ഷിത വഴികൾ, അപകട മേഖലകൾ, പുതിയ കണ്ടെത്തൽ, ഉദ്യോഗസ്ഥ ബന്ധം എന്നിവയിൽ സഹായിക്കാം.',
    },
    intents: {
      currentAlerts: ['മുന്നറിയിപ്പ്', 'അലർട്ട്'],
      safeRoute: ['സുരക്ഷിത', 'വഴി', 'റോഡ്'],
      highRiskZone: ['അപകടം', 'അപകടകര', 'മേഖല'],
      latestDetection: ['അവസാന', 'പുതിയ', 'എവിടെ', 'കണ്ടെത്തി'],
      contactOfficer: ['ഉദ്യോഗസ്ഥ', 'ബന്ധപ്പെടുക', 'ഫോൺ'],
      safetyTips: ['സുരക്ഷ', 'നിർദ്ദേശം', 'ടിപ്പ്'],
      todaySummary: ['റിപ്പോർട്ട്', 'സംഗ്രഹം', 'ഇന്ന്'],
    },
  },
}
