import { supabase } from "@/integrations/supabase/client";

/**
 * Wrapper that always attaches the Supabase Bearer token to a TanStack server fn call.
 * Use it instead of calling the server fn directly so requireSupabaseAuth middleware succeeds.
 */
export async function authedCall<TInput, TOutput>(
  fn: (opts: { data?: TInput; headers?: Record<string, string> }) => Promise<TOutput>,
  data?: TInput,
): Promise<TOutput> {
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token;
  if (!token) throw new Error("You're signed out. Please sign in again.");
  return fn({ data, headers: { Authorization: `Bearer ${token}` } });
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
