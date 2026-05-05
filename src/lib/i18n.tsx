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
  const [dict, setDict] = useState<Dict>(STRINGS as unknown as Dict);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (l: string) => {
    if (l.toLowerCase() === "english") { setDict(STRINGS as unknown as Dict); return; }
    const cacheKey = `agri_i18n_${l}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try { setDict({ ...(STRINGS as unknown as Dict), ...JSON.parse(cached) }); return; } catch {/* ignore */}
    }
    setLoading(true);
    try {
      const res = await fn({ data: { language: l, keys: STRINGS as unknown as Dict } });
      const merged = { ...(STRINGS as unknown as Dict), ...(res.translations || {}) };
      setDict(merged);
      try { localStorage.setItem(cacheKey, JSON.stringify(res.translations || {})); } catch {/* ignore */}
    } catch {
      setDict(STRINGS as unknown as Dict);
    } finally { setLoading(false); }
  }, [fn]);

  useEffect(() => { load(lang); }, [lang, load]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      if (detail) setLang(detail);
    };
    window.addEventListener("agri:lang", handler);
    return () => window.removeEventListener("agri:lang", handler);
  }, []);

  const t = useCallback((k: StringKey) => dict[k] ?? STRINGS[k], [dict]);
  return <Ctx.Provider value={{ t, lang, loading }}>{children}</Ctx.Provider>;
}

export function useT() { return useContext(Ctx); }
