import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateUI } from "@/server/i18n.functions";
import { getStoredLanguage } from "@/lib/api";

// Master English dictionary — all UI strings used across pages.
export const STRINGS = {
  // Nav
  nav_home: "Home",
  nav_disease: "Disease",
  nav_yield: "Yield",
  nav_chat: "Chat",
  nav_history: "History",
  nav_weather: "Weather",
  signout: "Sign out",
  // Home
  home_chip: "Your field, your pace",
  home_greet_morning: "Good morning",
  home_greet_afternoon: "Good afternoon",
  home_greet_evening: "Good evening",
  home_intro: "Whatever this season has thrown at you — heavy rain, pests, tired hands — we'll work through it together.",
  card_disease_title: "Diagnose a crop",
  card_disease_desc: "Snap a leaf to identify disease and treatment.",
  card_yield_title: "Predict yield",
  card_yield_desc: "Get an honest estimate based on your conditions.",
  card_chat_title: "Talk it through",
  card_chat_desc: "Share what's on your mind. The AI listens.",
  open: "Open",
  // Disease
  disease_title: "Crop disease analysis",
  disease_sub: "Upload a clear photo of the affected leaf or fruit.",
  upload_click: "Click to upload a photo",
  upload_hint: "JPG / PNG · up to 8MB",
  optional_crop: "Optional: crop name (e.g., tomato, rice)",
  diagnose_now: "Diagnose now",
  analyzing: "Analyzing…",
  diagnosis_appears: "Your diagnosis appears here",
  diagnosis_appears_sub: "Upload a leaf photo to begin.",
  symptoms: "Symptoms",
  treatment: "Treatment",
  prevention: "Prevention",
  confidence: "confidence",
  // Yield
  yield_title: "Yield prediction",
  yield_sub: "Tell us about your field.",
  crop: "Crop",
  area_ha: "Area (hectares)",
  rainfall_mm: "Rainfall (mm/yr)",
  soil_type: "Soil type",
  season: "Season",
  region_optional: "Region (optional)",
  notes_optional: "Notes (optional)",
  notes_placeholder: "Pest pressure, irrigation, fertilizer used…",
  predict_yield: "Predict yield",
  estimating: "Estimating…",
  forecast_appears: "Your forecast appears here",
  forecast_appears_sub: "Fill the form to get a tailored estimate.",
  estimated_yield: "Estimated yield",
  recommendations: "Recommendations",
  key_factors: "Key factors",
  risks: "Risks",
  auto: "Auto",
  // Weather
  weather_title: "Weather forecast",
  weather_sub: "7-day outlook for your location.",
  detect_location: "Detect my location",
  detecting: "Detecting…",
  no_location: "Allow location to see your forecast.",
  // Chat
  chat_title: "Talk it through",
  chat_placeholder: "Tell me what's on your mind…",
  send: "Send",
  // History
  history_title: "Your history",
  history_empty: "Nothing yet — your analyses will appear here.",
} as const;

const LOCAL_TRANSLATIONS: Record<string, Partial<Record<keyof typeof STRINGS, string>>> = {
  Hindi: {
    nav_home: "होम", nav_disease: "रोग", nav_yield: "उपज", nav_chat: "चैट", nav_history: "इतिहास", nav_weather: "मौसम", signout: "साइन आउट",
    disease_title: "फसल रोग विश्लेषण", disease_sub: "प्रभावित पत्ती या फल की साफ फोटो अपलोड करें।", upload_click: "फोटो अपलोड करें", upload_hint: "JPG / PNG · 8MB तक", optional_crop: "वैकल्पिक: फसल का नाम", diagnose_now: "अभी जांचें", analyzing: "विश्लेषण हो रहा है…", diagnosis_appears: "आपकी जांच यहां दिखेगी", symptoms: "लक्षण", treatment: "उपचार", prevention: "रोकथाम", confidence: "विश्वास",
    yield_title: "उपज अनुमान", yield_sub: "अपने खेत की जानकारी दें।", crop: "फसल", area_ha: "क्षेत्र (हेक्टेयर)", rainfall_mm: "वर्षा (मिमी/वर्ष)", soil_type: "मिट्टी का प्रकार", season: "मौसम", region_optional: "क्षेत्र (वैकल्पिक)", notes_optional: "नोट्स (वैकल्पिक)", predict_yield: "उपज अनुमान करें", estimating: "अनुमान लग रहा है…", forecast_appears: "आपका अनुमान यहां दिखेगा", estimated_yield: "अनुमानित उपज", recommendations: "सुझाव", key_factors: "मुख्य कारण", risks: "जोखिम", auto: "ऑटो",
    weather_title: "मौसम पूर्वानुमान", weather_sub: "आपके स्थान का 7 दिन का मौसम।", detect_location: "मेरा स्थान पहचानें", detecting: "पहचान हो रही है…", no_location: "पूर्वानुमान देखने के लिए स्थान अनुमति दें।", chat_title: "बात करें", chat_placeholder: "बताएं, आपके मन में क्या है…", send: "भेजें", history_title: "आपका इतिहास", history_empty: "अभी कुछ नहीं — आपके विश्लेषण यहां दिखेंगे।", open: "खोलें",
  },
  Bengali: { nav_home: "হোম", nav_disease: "রোগ", nav_yield: "ফলন", nav_chat: "চ্যাট", nav_history: "ইতিহাস", nav_weather: "আবহাওয়া", signout: "সাইন আউট", disease_title: "ফসলের রোগ বিশ্লেষণ", diagnose_now: "এখন পরীক্ষা করুন", analyzing: "বিশ্লেষণ হচ্ছে…", yield_title: "ফলন পূর্বাভাস", predict_yield: "ফলন অনুমান করুন", estimating: "অনুমান হচ্ছে…", weather_title: "আবহাওয়ার পূর্বাভাস", detect_location: "আমার অবস্থান শনাক্ত করুন", chat_title: "কথা বলুন", send: "পাঠান", history_title: "আপনার ইতিহাস", symptoms: "লক্ষণ", treatment: "চিকিৎসা", prevention: "প্রতিরোধ", recommendations: "পরামর্শ", risks: "ঝুঁকি", open: "খুলুন" },
  Telugu: { nav_home: "హోమ్", nav_disease: "వ్యాధి", nav_yield: "దిగుబడి", nav_chat: "చాట్", nav_history: "చరిత్ర", nav_weather: "వాతావరణం", signout: "సైన్ అవుట్", disease_title: "పంట వ్యాధి విశ్లేషణ", diagnose_now: "ఇప్పుడు నిర్ధారించండి", analyzing: "విశ్లేషిస్తోంది…", yield_title: "దిగుబడి అంచనా", predict_yield: "దిగుబడిని అంచనా వేయండి", estimating: "అంచనా వేస్తోంది…", weather_title: "వాతావరణ సూచన", detect_location: "నా స్థానాన్ని గుర్తించు", chat_title: "మాట్లాడండి", send: "పంపండి", history_title: "మీ చరిత్ర", symptoms: "లక్షణాలు", treatment: "చికిత్స", prevention: "నివారణ", recommendations: "సిఫార్సులు", risks: "ప్రమాదాలు", open: "తెరవండి" },
  Marathi: { nav_home: "होम", nav_disease: "रोग", nav_yield: "उत्पन्न", nav_chat: "चॅट", nav_history: "इतिहास", nav_weather: "हवामान", signout: "साइन आउट", disease_title: "पिक रोग विश्लेषण", diagnose_now: "आता तपासा", analyzing: "विश्लेषण सुरू आहे…", yield_title: "उत्पन्न अंदाज", predict_yield: "उत्पन्नाचा अंदाज", estimating: "अंदाज घेत आहे…", weather_title: "हवामान अंदाज", detect_location: "माझे स्थान ओळखा", chat_title: "बोला", send: "पाठवा", history_title: "तुमचा इतिहास", symptoms: "लक्षणे", treatment: "उपचार", prevention: "प्रतिबंध", recommendations: "शिफारसी", risks: "जोखीम", open: "उघडा" },
  Tamil: { nav_home: "முகப்பு", nav_disease: "நோய்", nav_yield: "மகசூல்", nav_chat: "அரட்டை", nav_history: "வரலாறு", nav_weather: "வானிலை", signout: "வெளியேறு", disease_title: "பயிர் நோய் பகுப்பாய்வு", diagnose_now: "இப்போது கண்டறி", analyzing: "பகுப்பாய்வு செய்கிறது…", yield_title: "மகசூல் கணிப்பு", predict_yield: "மகசூலை கணிக்கவும்", estimating: "கணக்கிடுகிறது…", weather_title: "வானிலை முன்னறிவிப்பு", detect_location: "என் இடத்தை கண்டறி", chat_title: "பேசலாம்", send: "அனுப்பு", history_title: "உங்கள் வரலாறு", symptoms: "அறிகுறிகள்", treatment: "சிகிச்சை", prevention: "தடுப்பு", recommendations: "பரிந்துரைகள்", risks: "அபாயங்கள்", open: "திற" },
  Urdu: { nav_home: "ہوم", nav_disease: "بیماری", nav_yield: "پیداوار", nav_chat: "چیٹ", nav_history: "تاریخ", nav_weather: "موسم", signout: "سائن آؤٹ", disease_title: "فصل کی بیماری کا تجزیہ", diagnose_now: "اب تشخیص کریں", analyzing: "تجزیہ ہو رہا ہے…", yield_title: "پیداوار کی پیش گوئی", predict_yield: "پیداوار کا اندازہ لگائیں", estimating: "اندازہ ہو رہا ہے…", weather_title: "موسم کی پیش گوئی", detect_location: "میرا مقام معلوم کریں", chat_title: "بات کریں", send: "بھیجیں", history_title: "آپ کی تاریخ", symptoms: "علامات", treatment: "علاج", prevention: "بچاؤ", recommendations: "سفارشات", risks: "خطرات", open: "کھولیں" },
  Gujarati: { nav_home: "હોમ", nav_disease: "રોગ", nav_yield: "ઉપજ", nav_chat: "ચેટ", nav_history: "ઇતિહાસ", nav_weather: "હવામાન", signout: "સાઇન આઉટ", disease_title: "પાક રોગ વિશ્લેષણ", diagnose_now: "હમણાં તપાસો", analyzing: "વિશ્લેષણ થઈ રહ્યું છે…", yield_title: "ઉપજ આગાહી", predict_yield: "ઉપજનો અંદાજ કરો", estimating: "અંદાજ થઈ રહ્યો છે…", weather_title: "હવામાન આગાહી", detect_location: "મારું સ્થાન શોધો", chat_title: "વાત કરો", send: "મોકલો", history_title: "તમારો ઇતિહાસ", symptoms: "લક્ષણો", treatment: "ઉપચાર", prevention: "અટકાવ", recommendations: "ભલામણો", risks: "જોખમો", open: "ખોલો" },
  Kannada: { nav_home: "ಮುಖಪುಟ", nav_disease: "ರೋಗ", nav_yield: "ಇಳುವರಿ", nav_chat: "ಚಾಟ್", nav_history: "ಇತಿಹಾಸ", nav_weather: "ಹವಾಮಾನ", signout: "ಸೈನ್ ಔಟ್", disease_title: "ಬೆಳೆ ರೋಗ ವಿಶ್ಲೇಷಣೆ", diagnose_now: "ಈಗ ಪರಿಶೀಲಿಸಿ", analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…", yield_title: "ಇಳುವರಿ ಮುನ್ಸೂಚನೆ", predict_yield: "ಇಳುವರಿಯನ್ನು ಅಂದಾಜಿಸಿ", estimating: "ಅಂದಾಜಿಸಲಾಗುತ್ತಿದೆ…", weather_title: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ", detect_location: "ನನ್ನ ಸ್ಥಳ ಪತ್ತೆಮಾಡಿ", chat_title: "ಮಾತನಾಡಿ", send: "ಕಳುಹಿಸಿ", history_title: "ನಿಮ್ಮ ಇತಿಹಾಸ", symptoms: "ಲಕ್ಷಣಗಳು", treatment: "ಚಿಕಿತ್ಸೆ", prevention: "ತಡೆಗಟ್ಟುವಿಕೆ", recommendations: "ಶಿಫಾರಸುಗಳು", risks: "ಅಪಾಯಗಳು", open: "ತೆರೆಯಿರಿ" },
  Odia: { nav_home: "ହୋମ୍", nav_disease: "ରୋଗ", nav_yield: "ଉତ୍ପାଦନ", nav_chat: "ଚାଟ୍", nav_history: "ଇତିହାସ", nav_weather: "ପାଗ", signout: "ସାଇନ୍ ଆଉଟ୍", disease_title: "ଫସଲ ରୋଗ ବିଶ୍ଳେଷଣ", diagnose_now: "ଏବେ ଯାଞ୍ଚ କରନ୍ତୁ", analyzing: "ବିଶ୍ଳେଷଣ ହେଉଛି…", yield_title: "ଉତ୍ପାଦନ ପୂର୍ବାନୁମାନ", predict_yield: "ଉତ୍ପାଦନ ଅନୁମାନ କରନ୍ତୁ", estimating: "ଅନୁମାନ ହେଉଛି…", weather_title: "ପାଗ ପୂର୍ବାନୁମାନ", detect_location: "ମୋ ଅବସ୍ଥାନ ଚିହ୍ନଟ କରନ୍ତୁ", chat_title: "କଥା ହୁଅନ୍ତୁ", send: "ପଠାନ୍ତୁ", history_title: "ଆପଣଙ୍କ ଇତିହାସ", symptoms: "ଲକ୍ଷଣ", treatment: "ଚିକିତ୍ସା", prevention: "ପ୍ରତିରୋଧ", recommendations: "ପରାମର୍ଶ", risks: "ଜୋଖିମ", open: "ଖୋଲନ୍ତୁ" },
  Malayalam: { nav_home: "ഹോം", nav_disease: "രോഗം", nav_yield: "വിളവ്", nav_chat: "ചാറ്റ്", nav_history: "ചരിത്രം", nav_weather: "കാലാവസ്ഥ", signout: "സൈൻ ഔട്ട്", disease_title: "വിള രോഗ വിശകലനം", diagnose_now: "ഇപ്പോൾ പരിശോധിക്കുക", analyzing: "വിശകലനം ചെയ്യുന്നു…", yield_title: "വിളവ് പ്രവചനം", predict_yield: "വിളവ് കണക്കാക്കുക", estimating: "കണക്കാക്കുന്നു…", weather_title: "കാലാവസ്ഥ പ്രവചനം", detect_location: "എന്റെ സ്ഥലം കണ്ടെത്തുക", chat_title: "സംസാരിക്കുക", send: "അയയ്ക്കുക", history_title: "നിങ്ങളുടെ ചരിത്രം", symptoms: "ലക്ഷണങ്ങൾ", treatment: "ചികിത്സ", prevention: "തടയൽ", recommendations: "ശുപാർശകൾ", risks: "അപകടസാധ്യതകൾ", open: "തുറക്കുക" },
  Punjabi: { nav_home: "ਹੋਮ", nav_disease: "ਰੋਗ", nav_yield: "ਪੈਦਾਵਾਰ", nav_chat: "ਚੈਟ", nav_history: "ਇਤਿਹਾਸ", nav_weather: "ਮੌਸਮ", signout: "ਸਾਈਨ ਆਉਟ", disease_title: "ਫਸਲ ਰੋਗ ਵਿਸ਼ਲੇਸ਼ਣ", diagnose_now: "ਹੁਣ ਜਾਂਚੋ", analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ…", yield_title: "ਪੈਦਾਵਾਰ ਅਨੁਮਾਨ", predict_yield: "ਪੈਦਾਵਾਰ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ", estimating: "ਅੰਦਾਜ਼ਾ ਲਗ ਰਿਹਾ ਹੈ…", weather_title: "ਮੌਸਮ ਅਨੁਮਾਨ", detect_location: "ਮੇਰਾ ਸਥਾਨ ਲੱਭੋ", chat_title: "ਗੱਲ ਕਰੋ", send: "ਭੇਜੋ", history_title: "ਤੁਹਾਡਾ ਇਤਿਹਾਸ", symptoms: "ਲੱਛਣ", treatment: "ਇਲਾਜ", prevention: "ਰੋਕਥਾਮ", recommendations: "ਸਿਫਾਰਸ਼ਾਂ", risks: "ਖਤਰੇ", open: "ਖੋਲ੍ਹੋ" },
  Assamese: { nav_home: "হোম", nav_disease: "ৰোগ", nav_yield: "উৎপাদন", nav_chat: "চেট", nav_history: "ইতিহাস", nav_weather: "বতৰ", signout: "চাইন আউট", disease_title: "শস্য ৰোগ বিশ্লেষণ", diagnose_now: "এতিয়াই পৰীক্ষা কৰক", analyzing: "বিশ্লেষণ চলিছে…", yield_title: "উৎপাদন পূৰ্বানুমান", predict_yield: "উৎপাদন অনুমান কৰক", estimating: "অনুমান চলিছে…", weather_title: "বতৰৰ পূৰ্বানুমান", detect_location: "মোৰ স্থান চিনাক্ত কৰক", chat_title: "কথা পাতক", send: "পঠিয়াওক", history_title: "আপোনাৰ ইতিহাস", symptoms: "লক্ষণ", treatment: "চিকিৎসা", prevention: "প্ৰতিৰোধ", recommendations: "পৰামৰ্শ", risks: "ঝুঁকি", open: "খোলক" },
  Spanish: { nav_home: "Inicio", nav_disease: "Enfermedad", nav_yield: "Rendimiento", nav_chat: "Chat", nav_history: "Historial", nav_weather: "Clima", signout: "Salir", disease_title: "Análisis de enfermedades del cultivo", diagnose_now: "Diagnosticar ahora", analyzing: "Analizando…", yield_title: "Predicción de rendimiento", predict_yield: "Predecir rendimiento", estimating: "Estimando…", weather_title: "Pronóstico del clima", detect_location: "Detectar mi ubicación", chat_title: "Hablemos", send: "Enviar", history_title: "Tu historial", symptoms: "Síntomas", treatment: "Tratamiento", prevention: "Prevención", recommendations: "Recomendaciones", risks: "Riesgos", open: "Abrir" },
  Portuguese: { nav_home: "Início", nav_disease: "Doença", nav_yield: "Rendimento", nav_chat: "Chat", nav_history: "Histórico", nav_weather: "Clima", signout: "Sair", disease_title: "Análise de doenças da cultura", diagnose_now: "Diagnosticar agora", analyzing: "Analisando…", yield_title: "Previsão de rendimento", predict_yield: "Prever rendimento", estimating: "Estimando…", weather_title: "Previsão do tempo", detect_location: "Detectar minha localização", chat_title: "Conversar", send: "Enviar", history_title: "Seu histórico", symptoms: "Sintomas", treatment: "Tratamento", prevention: "Prevenção", recommendations: "Recomendações", risks: "Riscos", open: "Abrir" },
  French: { nav_home: "Accueil", nav_disease: "Maladie", nav_yield: "Rendement", nav_chat: "Chat", nav_history: "Historique", nav_weather: "Météo", signout: "Déconnexion", disease_title: "Analyse des maladies des cultures", diagnose_now: "Diagnostiquer", analyzing: "Analyse…", yield_title: "Prévision de rendement", predict_yield: "Prédire le rendement", estimating: "Estimation…", weather_title: "Prévisions météo", detect_location: "Détecter ma position", chat_title: "Parlons", send: "Envoyer", history_title: "Votre historique", symptoms: "Symptômes", treatment: "Traitement", prevention: "Prévention", recommendations: "Recommandations", risks: "Risques", open: "Ouvrir" },
  Arabic: { nav_home: "الرئيسية", nav_disease: "المرض", nav_yield: "الإنتاج", nav_chat: "الدردشة", nav_history: "السجل", nav_weather: "الطقس", signout: "تسجيل الخروج", disease_title: "تحليل أمراض المحاصيل", diagnose_now: "شخّص الآن", analyzing: "جارٍ التحليل…", yield_title: "توقع الإنتاج", predict_yield: "توقع الإنتاج", estimating: "جارٍ التقدير…", weather_title: "توقعات الطقس", detect_location: "اكتشف موقعي", chat_title: "تحدث معنا", send: "إرسال", history_title: "سجلك", symptoms: "الأعراض", treatment: "العلاج", prevention: "الوقاية", recommendations: "التوصيات", risks: "المخاطر", open: "افتح" },
  "Mandarin Chinese": { nav_home: "首页", nav_disease: "病害", nav_yield: "产量", nav_chat: "聊天", nav_history: "历史", nav_weather: "天气", signout: "退出", disease_title: "作物病害分析", diagnose_now: "立即诊断", analyzing: "分析中…", yield_title: "产量预测", predict_yield: "预测产量", estimating: "估算中…", weather_title: "天气预报", detect_location: "检测我的位置", chat_title: "聊一聊", send: "发送", history_title: "你的历史", symptoms: "症状", treatment: "治疗", prevention: "预防", recommendations: "建议", risks: "风险", open: "打开" },
  Indonesian: { nav_home: "Beranda", nav_disease: "Penyakit", nav_yield: "Hasil", nav_chat: "Chat", nav_history: "Riwayat", nav_weather: "Cuaca", signout: "Keluar", disease_title: "Analisis penyakit tanaman", diagnose_now: "Diagnosis sekarang", analyzing: "Menganalisis…", yield_title: "Prediksi hasil", predict_yield: "Prediksi hasil", estimating: "Mengestimasi…", weather_title: "Prakiraan cuaca", detect_location: "Deteksi lokasi saya", chat_title: "Mari bicara", send: "Kirim", history_title: "Riwayat Anda", symptoms: "Gejala", treatment: "Perawatan", prevention: "Pencegahan", recommendations: "Rekomendasi", risks: "Risiko", open: "Buka" },
  Vietnamese: { nav_home: "Trang chủ", nav_disease: "Bệnh", nav_yield: "Năng suất", nav_chat: "Chat", nav_history: "Lịch sử", nav_weather: "Thời tiết", signout: "Đăng xuất", disease_title: "Phân tích bệnh cây trồng", diagnose_now: "Chẩn đoán ngay", analyzing: "Đang phân tích…", yield_title: "Dự đoán năng suất", predict_yield: "Dự đoán năng suất", estimating: "Đang ước tính…", weather_title: "Dự báo thời tiết", detect_location: "Phát hiện vị trí", chat_title: "Trò chuyện", send: "Gửi", history_title: "Lịch sử của bạn", symptoms: "Triệu chứng", treatment: "Điều trị", prevention: "Phòng ngừa", recommendations: "Khuyến nghị", risks: "Rủi ro", open: "Mở" },
  Thai: { nav_home: "หน้าแรก", nav_disease: "โรค", nav_yield: "ผลผลิต", nav_chat: "แชท", nav_history: "ประวัติ", nav_weather: "อากาศ", signout: "ออกจากระบบ", disease_title: "วิเคราะห์โรคพืช", diagnose_now: "วินิจฉัยตอนนี้", analyzing: "กำลังวิเคราะห์…", yield_title: "คาดการณ์ผลผลิต", predict_yield: "คาดการณ์ผลผลิต", estimating: "กำลังประเมิน…", weather_title: "พยากรณ์อากาศ", detect_location: "ตรวจหาตำแหน่งของฉัน", chat_title: "พูดคุย", send: "ส่ง", history_title: "ประวัติของคุณ", symptoms: "อาการ", treatment: "การรักษา", prevention: "การป้องกัน", recommendations: "คำแนะนำ", risks: "ความเสี่ยง", open: "เปิด" },
  Swahili: { nav_home: "Nyumbani", nav_disease: "Ugonjwa", nav_yield: "Mavuno", nav_chat: "Gumzo", nav_history: "Historia", nav_weather: "Hali ya hewa", signout: "Ondoka", disease_title: "Uchambuzi wa magonjwa ya mazao", diagnose_now: "Tambua sasa", analyzing: "Inachambua…", yield_title: "Utabiri wa mavuno", predict_yield: "Tabiri mavuno", estimating: "Inakadiria…", weather_title: "Utabiri wa hali ya hewa", detect_location: "Tambua eneo langu", chat_title: "Tuzungumze", send: "Tuma", history_title: "Historia yako", symptoms: "Dalili", treatment: "Matibabu", prevention: "Kinga", recommendations: "Mapendekezo", risks: "Hatari", open: "Fungua" },
  Hausa: { nav_home: "Gida", nav_disease: "Cuta", nav_yield: "Amfani", nav_chat: "Tattaunawa", nav_history: "Tarihi", nav_weather: "Yanayi", signout: "Fita", disease_title: "Binciken cutar amfanin gona", diagnose_now: "Gano yanzu", analyzing: "Ana nazari…", yield_title: "Hasashen amfanin gona", predict_yield: "Yi hasashen amfani", estimating: "Ana kimantawa…", weather_title: "Hasashen yanayi", detect_location: "Gano wurina", chat_title: "Mu tattauna", send: "Aika", history_title: "Tarihinka", symptoms: "Alamomi", treatment: "Magani", prevention: "Rigakafi", recommendations: "Shawarwari", risks: "Hadari", open: "Buɗe" },
  Yoruba: { nav_home: "Ilé", nav_disease: "Àrùn", nav_yield: "Ikore", nav_chat: "Ìfọ̀rọ̀wérọ̀", nav_history: "Ìtàn", nav_weather: "Ojú-ọjọ́", signout: "Jade", disease_title: "Ìtúpalẹ̀ àrùn irugbin", diagnose_now: "Ṣàyẹ̀wò báyìí", analyzing: "Ń ṣe ìtúpalẹ̀…", yield_title: "Àsọtẹ́lẹ̀ ikore", predict_yield: "Sọtẹ́lẹ̀ ikore", estimating: "Ń ṣe ìṣírò…", weather_title: "Àsọtẹ́lẹ̀ ojú-ọjọ́", detect_location: "Ṣàwárí ibi mi", chat_title: "Jẹ́ ká sọ̀rọ̀", send: "Firanṣẹ", history_title: "Ìtàn rẹ", symptoms: "Ààmì", treatment: "Ìtọju", prevention: "Ìdènà", recommendations: "Ìmọ̀ràn", risks: "Ewu", open: "Ṣí" },
  Amharic: { nav_home: "መነሻ", nav_disease: "በሽታ", nav_yield: "ምርት", nav_chat: "ውይይት", nav_history: "ታሪክ", nav_weather: "አየር", signout: "ውጣ", disease_title: "የሰብል በሽታ ትንተና", diagnose_now: "አሁን መርምር", analyzing: "በመተንተን ላይ…", yield_title: "የምርት ትንበያ", predict_yield: "ምርት ተንብይ", estimating: "በመገመት ላይ…", weather_title: "የአየር ትንበያ", detect_location: "ቦታዬን ፈልግ", chat_title: "እንነጋገር", send: "ላክ", history_title: "የእርስዎ ታሪክ", symptoms: "ምልክቶች", treatment: "ሕክምና", prevention: "መከላከል", recommendations: "ምክሮች", risks: "አደጋዎች", open: "ክፈት" },
  Russian: { nav_home: "Главная", nav_disease: "Болезни", nav_yield: "Урожай", nav_chat: "Чат", nav_history: "История", nav_weather: "Погода", signout: "Выйти", disease_title: "Анализ болезней культур", diagnose_now: "Проверить сейчас", analyzing: "Анализ…", yield_title: "Прогноз урожая", predict_yield: "Прогнозировать урожай", estimating: "Оценка…", weather_title: "Прогноз погоды", detect_location: "Определить мое место", chat_title: "Поговорим", send: "Отправить", history_title: "Ваша история", symptoms: "Симптомы", treatment: "Лечение", prevention: "Профилактика", recommendations: "Рекомендации", risks: "Риски", open: "Открыть" },
};

function instantDictFor(language: string): Record<string, string> {
  if (language.toLowerCase() === "english") return STRINGS as unknown as Record<string, string>;
  return { ...(STRINGS as unknown as Record<string, string>), ...(LOCAL_TRANSLATIONS[language] ?? {}) };
}

export type StringKey = keyof typeof STRINGS;
type Dict = Record<string, string>;

interface I18nCtx {
  t: (k: StringKey) => string;
  lang: string;
  loading: boolean;
}
const Ctx = createContext<I18nCtx>({ t: (k) => STRINGS[k], lang: "English", loading: false });

export function I18nProvider({ children }: { children: ReactNode }) {
  const fn = useServerFn(translateUI);
  const [lang, setLang] = useState<string>(() => getStoredLanguage());
  const [dict, setDict] = useState<Dict>(() => instantDictFor(getStoredLanguage()));
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (l: string) => {
    if (l.toLowerCase() === "english") { setDict(STRINGS as unknown as Dict); return; }
    setDict(instantDictFor(l));
    const cacheKey = `agri_i18n_${l}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try { setDict({ ...instantDictFor(l), ...JSON.parse(cached) }); return; } catch {/* ignore */}
    }
    setLoading(true);
    try {
      const res = await fn({ data: { language: l, keys: STRINGS as unknown as Dict } });
      const merged = { ...instantDictFor(l), ...(res.translations || {}) };
      setDict(merged);
      try { localStorage.setItem(cacheKey, JSON.stringify(res.translations || {})); } catch {/* ignore */}
    } catch {
      setDict(instantDictFor(l));
    } finally { setLoading(false); }
  }, [fn]);

  useEffect(() => { load(lang); }, [lang, load]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      if (detail) {
        setDict(instantDictFor(detail));
        setLang(detail);
      }
    };
    window.addEventListener("agri:lang", handler);
    return () => window.removeEventListener("agri:lang", handler);
  }, []);

  const t = useCallback((k: StringKey) => dict[k] ?? STRINGS[k], [dict]);
  return <Ctx.Provider value={{ t, lang, loading }}>{children}</Ctx.Provider>;
}

export function useT() { return useContext(Ctx); }
