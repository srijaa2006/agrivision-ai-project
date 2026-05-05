import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDisease } from "@/server/agri.functions";
import { Upload, Loader2, Stethoscope, Heart, Shield, Pill, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { authedCall, getStoredLanguage } from "@/lib/api";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/disease")({
  component: DiseasePage,
});

type Result = {
  crop: string; disease: string; confidence: string; severity: string;
  symptoms: string[]; causes?: string[]; treatment: string[]; prevention: string[]; encouragement: string;
};

function DiseasePage() {
  const { t } = useT();
  const fn = useServerFn(analyzeDisease);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Please use an image under 8MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setResult(null);
  }

  async function analyze() {
    if (!preview) return;
    setLoading(true);
    try {
      const r = await authedCall(fn, { imageBase64: preview, cropHint: hint || undefined, language: getStoredLanguage() });
      setResult(r as Result);
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="py-6 grid lg:grid-cols-[1fr_1.1fr] gap-8 animate-pop">
      <section className="clay-lg p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl grad-leaf flex items-center justify-center clay-sm"><Stethoscope className="w-6 h-6 text-primary-foreground" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Crop disease analysis</h1>
            <p className="text-sm text-muted-foreground">Upload a clear photo of the affected leaf or fruit.</p>
          </div>
        </div>

        <div onClick={() => inputRef.current?.click()}
          className="clay-inset cursor-pointer p-6 text-center smooth hover:scale-[1.01]">
          {preview ? (
            <img src={preview} alt="preview" className="w-full max-h-72 object-contain rounded-xl" />
          ) : (
            <div className="py-10">
              <Upload className="w-10 h-10 mx-auto text-primary mb-3" />
              <p className="font-semibold">Click to upload a photo</p>
              <p className="text-xs text-muted-foreground mt-1">JPG / PNG · up to 8MB</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => onFile(e.target.files?.[0])} />
        </div>

        <div className="clay-inset px-4 py-3">
          <input value={hint} onChange={e => setHint(e.target.value)}
            placeholder="Optional: crop name (e.g., tomato, rice)"
            className="bg-transparent outline-none w-full text-sm" maxLength={120} />
        </div>

        <button onClick={analyze} disabled={!preview || loading}
          className="w-full grad-leaf text-primary-foreground py-3.5 rounded-2xl font-semibold smooth hover:scale-[1.02] disabled:opacity-50 inline-flex justify-center items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : "Diagnose now"}
        </button>
      </section>

      <section className="space-y-5">
        {!result && !loading && (
          <div className="clay p-8 text-center">
            <div className="w-20 h-20 rounded-3xl grad-leaf mx-auto mb-4 flex items-center justify-center float clay-sm">
              <Stethoscope className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold">Your diagnosis appears here</h3>
            <p className="text-sm text-muted-foreground mt-2">Upload a leaf photo to begin.</p>
          </div>
        )}
        {loading && <div className="clay p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-3 text-muted-foreground">Looking carefully at your photo…</p></div>}
        {result && (
          <>
            <div className="clay p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{result.crop}</p>
                  <h2 className="font-display text-3xl font-bold text-grad-leaf">{result.disease}</h2>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <Badge>{result.confidence} confidence</Badge>
                  <Badge tone="warn">{result.severity}</Badge>
                </div>
              </div>
              <p className="mt-4 text-sm bg-accent/30 p-4 rounded-2xl flex gap-3 items-start">
                <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {result.encouragement}
              </p>
            </div>

            <Section icon={AlertTriangle} title="Symptoms" items={result.symptoms} />
            <Section icon={Pill} title="Treatment" items={result.treatment} />
            <Section icon={Shield} title="Prevention" items={result.prevention} />
          </>
        )}
      </section>
    </div>
  );
}

function Badge({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" }) {
  return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tone === "warn" ? "bg-accent text-accent-foreground" : "bg-primary/15 text-primary"}`}>{children}</span>;
}

function Section({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  return (
    <div className="clay p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-display text-xl font-bold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
