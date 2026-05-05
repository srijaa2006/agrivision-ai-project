import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getHistory } from "@/server/agri.functions";
import { History as HistoryIcon, Stethoscope, LineChart, Loader2 } from "lucide-react";
import { authedCall } from "@/lib/api";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

type Item = { id: string; type: "disease" | "yield"; title: string; created_at: string; result: any };

function HistoryPage() {
  const fn = useServerFn(getHistory);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => {
    authedCall(fn).then((r: any) => setItems(r.items)).finally(() => setLoading(false));
  }, [fn]);

  return (
    <div className="py-6 animate-pop">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl grad-leaf flex items-center justify-center clay-sm"><HistoryIcon className="w-6 h-6 text-primary-foreground" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold">Your harvest history</h1>
          <p className="text-sm text-muted-foreground">Every diagnosis and prediction, kept safe.</p>
        </div>
      </header>

      {loading ? (
        <div className="clay p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="clay p-10 text-center text-muted-foreground">No entries yet — try a disease scan or yield prediction.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {items.map(it => {
            const Icon = it.type === "disease" ? Stethoscope : LineChart;
            return (
              <li key={it.id}>
                <button onClick={() => setOpen(it)} className="clay p-5 w-full text-left smooth hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl grad-leaf flex items-center justify-center clay-sm"><Icon className="w-5 h-5 text-primary-foreground" /></div>
                    <div className="flex-1">
                      <p className="font-semibold">{it.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary/15 text-primary">{it.type}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div onClick={() => setOpen(null)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="clay-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto animate-pop">
            <h2 className="font-display text-2xl font-bold text-grad-leaf">{open.title}</h2>
            <p className="text-xs text-muted-foreground mb-4">{new Date(open.created_at).toLocaleString()}</p>
            <pre className="text-xs whitespace-pre-wrap clay-inset p-4">{JSON.stringify(open.result, null, 2)}</pre>
            <button onClick={() => setOpen(null)} className="mt-4 grad-leaf text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold smooth hover:scale-105">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
