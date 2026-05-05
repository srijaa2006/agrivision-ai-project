import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant, getChatHistory } from "@/server/agri.functions";
import { MessageCircleHeart, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function genId() {
  // RFC4122 v4
  return crypto.randomUUID();
}

const SUGGESTIONS = [
  "I'm worried my harvest won't be enough this season.",
  "How can I save my tomato plants from yellowing leaves?",
  "I'm exhausted. Any low-cost tips to ease the workload?",
  "What can I do if rain damages my wheat?",
];

function ChatPage() {
  const send = useServerFn(chatWithAssistant);
  const fetchHist = useServerFn(getChatHistory);
  const [conv, setConv] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = localStorage.getItem("agri_conv");
    if (!id) { id = genId(); localStorage.setItem("agri_conv", id); }
    setConv(id);
    fetchHist({ data: { conversationId: id } })
      .then((r: any) => setMessages(r.messages.map((m: any) => ({ role: m.role, content: m.content }))))
      .catch(() => {});
  }, [fetchHist]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function submit(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !conv || busy) return;
    setMessages(m => [...m, { role: "user", content: msg }]);
    setInput("");
    setBusy(true);
    try {
      const r: any = await send({ data: { conversationId: conv, message: msg } });
      setMessages(m => [...m, { role: "assistant", content: r.reply }]);
    } catch (e: any) {
      toast.error(e.message ?? "Could not reach the assistant");
    } finally { setBusy(false); }
  }

  return (
    <div className="py-6 animate-pop">
      <div className="clay-lg p-6 md:p-7 flex flex-col h-[75vh]">
        <header className="flex items-center gap-3 pb-4 border-b border-border/60">
          <div className="w-12 h-12 rounded-2xl grad-leaf flex items-center justify-center clay-sm"><MessageCircleHeart className="w-6 h-6 text-primary-foreground" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">A friend in the field</h1>
            <p className="text-xs text-muted-foreground">Share what's heavy. Ask anything. We're listening.</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-5 space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl grad-leaf flex items-center justify-center clay-sm float">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground">Try one of these to start:</p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => submit(s)}
                    className="clay-sm smooth hover:scale-[1.02] text-left text-sm p-3 rounded-xl">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "grad-leaf text-primary-foreground rounded-br-sm" : "clay-sm rounded-bl-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="clay-sm rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> thinking…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex gap-2 pt-3 border-t border-border/60">
          <div className="flex-1 clay-inset px-4 py-2.5">
            <input value={input} onChange={e => setInput(e.target.value)} maxLength={2000}
              placeholder="Type your message…" className="bg-transparent outline-none w-full text-sm" />
          </div>
          <button disabled={busy || !input.trim()}
            className="grad-leaf text-primary-foreground rounded-2xl px-5 smooth hover:scale-105 disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
