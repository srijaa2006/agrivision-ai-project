import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { LANGUAGES, getStoredLanguage, setStoredLanguage } from "@/lib/api";

export function LanguageSwitcher() {
  const [lang, setLang] = useState("English");
  const [open, setOpen] = useState(false);

  useEffect(() => { setLang(getStoredLanguage()); }, []);

  function pick(l: string) {
    setLang(l);
    setStoredLanguage(l);
    setOpen(false);
    // Notify any listeners on the page
    window.dispatchEvent(new CustomEvent("agri:lang", { detail: l }));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="clay-sm smooth p-2.5 rounded-xl hover:scale-105 inline-flex items-center gap-2 text-xs font-semibold"
        aria-label="Change language">
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{lang}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-auto clay-lg p-2 z-50 animate-pop">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => pick(l)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm smooth ${l === lang ? "grad-leaf text-primary-foreground font-semibold" : "hover:bg-muted"}`}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
