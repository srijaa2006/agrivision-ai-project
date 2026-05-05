import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { Stethoscope, LineChart, MessageCircleHeart, ArrowRight, Sparkles } from "lucide-react";
import clayLeaf from "@/assets/clay-leaf.png";
import clayWheat from "@/assets/clay-wheat.png";
import clayChat from "@/assets/clay-chat.png";

export const Route = createFileRoute("/app/")({
  component: Home,
});

const cards = [
  { to: "/app/disease", img: clayLeaf, icon: Stethoscope, title: "Diagnose a crop", desc: "Snap a leaf to identify disease and treatment.", grad: "grad-leaf" },
  { to: "/app/yield", img: clayWheat, icon: LineChart, title: "Predict yield", desc: "Get an honest estimate based on your conditions.", grad: "grad-sun" },
  { to: "/app/chat", img: clayChat, icon: MessageCircleHeart, title: "Talk it through", desc: "Share what's on your mind. The AI listens.", grad: "grad-leaf" },
] as const;

function Home() {
  const { user } = useSession();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "farmer";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10 py-6 animate-pop">
      <section className="clay-lg p-8 md:p-10 relative overflow-hidden">
        <span className="inline-flex items-center gap-2 clay-sm px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" /> Your field, your pace
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black mt-4">
          {greet}, <span className="text-grad-leaf capitalize">{name}</span>.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg">
          Whatever this season has thrown at you — heavy rain, pests, tired hands — we'll work through it together.
        </p>
        <img src={clayLeaf} alt="" aria-hidden className="absolute -bottom-6 -right-6 w-40 opacity-90 float" />
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className="clay p-6 smooth hover:-translate-y-2 group">
            <img src={c.img} alt="" aria-hidden className="w-16 h-16 mb-3 float" loading="lazy" />
            <h3 className="font-display text-2xl font-bold mb-1">{c.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary smooth group-hover:gap-3">
              Open <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
