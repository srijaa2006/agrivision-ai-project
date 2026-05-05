import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { predictYield } from "@/server/agri.functions";
import { LineChart, Loader2, Heart, Sprout, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/yield")({
  component: YieldPage,
});

type R = {
  estimatedYieldTonnes: number; yieldPerHectare: number; confidence: string;
  keyFactors: string[]; risks?: string[]; recommendations: string[]; encouragement: string;
};

function YieldPage() {
  const fn = useServerFn(predictYield);
  const [form, setForm] = useState({
    crop: "", areaHectares: 1, soilType: "loamy", rainfallMm: 600, season: "kharif", region: "", notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<R | null>(null);

  function set<K extends keyof typeof form>(k: K, v: any) { setForm(p => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fn({ data: form });
      setResult(r as R);
    } catch (e: any) { toast.error(e.message ?? "Failed"); } finally { setLoading(false); }
  }

  return (
    <div className="py-6 grid lg:grid-cols-[1fr_1.1fr] gap-8 animate-pop">
      <form onSubmit={submit} className="clay-lg p-7 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl grad-sun flex items-center justify-center clay-sm"><LineChart className="w-6 h-6 text-accent-foreground" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Yield prediction</h1>
            <p className="text-sm text-muted-foreground">Tell us about your field.</p>
          </div>
        </div>

        <Field label="Crop"><input required maxLength={60} value={form.crop} onChange={e => set("crop", e.target.value)} placeholder="e.g. Rice, Wheat, Maize" className="input-clean" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Area (hectares)"><input required type="number" min={0.01} step={0.1} value={form.areaHectares} onChange={e => set("areaHectares", +e.target.value)} className="input-clean" /></Field>
          <Field label="Rainfall (mm)"><input required type="number" min={0} value={form.rainfallMm} onChange={e => set("rainfallMm", +e.target.value)} className="input-clean" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Soil type">
            <select value={form.soilType} onChange={e => set("soilType", e.target.value)} className="input-clean">
              {["sandy","loamy","clay","silty","peaty","chalky","red","black"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Season">
            <select value={form.season} onChange={e => set("season", e.target.value)} className="input-clean">
              {["kharif","rabi","zaid","spring","summer","autumn","winter"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Region (optional)"><input maxLength={80} value={form.region} onChange={e => set("region", e.target.value)} placeholder="e.g. Punjab, India" className="input-clean" /></Field>
        <Field label="Notes (optional)"><textarea rows={3} maxLength={500} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Pest pressure, irrigation, fertilizer used…" className="input-clean resize-none" /></Field>

        <button disabled={loading} className="w-full grad-leaf text-primary-foreground py-3.5 rounded-2xl font-semibold smooth hover:scale-[1.02] disabled:opacity-50 inline-flex justify-center items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Estimating…</> : "Predict yield"}
        </button>
        <style>{`.input-clean{background:transparent;outline:none;width:100%;font-size:14px;padding:12px 16px;border-radius:14px;box-shadow:inset 4px 4px 10px oklch(0.7 0.05 130 / 0.25), inset -3px -3px 8px oklch(1 0 0 / 0.7);}`}</style>
      </form>

      <div className="space-y-5">
        {!result && !loading && (
          <div className="clay p-8 text-center">
            <div className="w-20 h-20 rounded-3xl grad-sun mx-auto mb-4 flex items-center justify-center float clay-sm">
              <Sprout className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold">Your forecast appears here</h3>
            <p className="text-sm text-muted-foreground mt-2">Fill the form to get a tailored estimate.</p>
          </div>
        )}
        {loading && <div className="clay p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-3 text-muted-foreground">Crunching agronomy…</p></div>}
        {result && (
          <>
            <div className="clay-lg p-7">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated yield</p>
              <p className="font-display text-6xl font-black text-grad-leaf mt-1">{result.estimatedYieldTonnes}<span className="text-2xl text-muted-foreground"> t</span></p>
              <p className="text-sm text-muted-foreground mt-1">≈ {result.yieldPerHectare} t / hectare · {result.confidence} confidence</p>
              <p className="mt-4 text-sm bg-accent/30 p-4 rounded-2xl flex gap-3 items-start">
                <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {result.encouragement}
              </p>
            </div>
            <Block icon={Lightbulb} title="Recommendations" items={result.recommendations} />
            <Block icon={Sprout} title="Key factors" items={result.keyFactors} />
            {result.risks?.length ? <Block icon={AlertTriangle} title="Risks" items={result.risks} /> : null}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function Block({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  return (
    <div className="clay p-6">
      <div className="flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-primary" /><h3 className="font-display text-xl font-bold">{title}</h3></div>
      <ul className="space-y-2">{items.map((s,i)=><li key={i} className="flex gap-3 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />{s}</li>)}</ul>
    </div>
  );
}
