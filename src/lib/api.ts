import { supabase } from "@/integrations/supabase/client";

/**
 * Wrapper that always attaches the Supabase Bearer token to a TanStack server fn call.
 */
export async function authedCall(fn: any, data?: any): Promise<any> {
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token;
  if (!token) throw new Error("You're signed out. Please sign in again.");
  try {
    return await fn({ data, headers: { Authorization: `Bearer ${token}` } });
  } catch (e: any) {
    // Surface a friendlier error for network failures (offline / blocked / aborted).
    const msg = String(e?.message || e || "");
    if (msg === "Failed to fetch" || msg.toLowerCase().includes("networkerror") || msg.toLowerCase().includes("load failed")) {
      throw new Error("Network hiccup — please check your connection and try again.");
    }
    throw e;
  }
}

export function getStoredLanguage(): string {
  if (typeof window === "undefined") return "English";
  return localStorage.getItem("agri_lang") || "English";
}

export function setStoredLanguage(lang: string) {
  if (typeof window !== "undefined") localStorage.setItem("agri_lang", lang);
}

export const LANGUAGES = [
  "English","Hindi","Bengali","Telugu","Marathi","Tamil","Urdu","Gujarati","Kannada","Odia",
  "Malayalam","Punjabi","Assamese","Spanish","Portuguese","French","Arabic","Mandarin Chinese",
  "Indonesian","Vietnamese","Thai","Swahili","Hausa","Yoruba","Amharic","Russian",
] as const;
