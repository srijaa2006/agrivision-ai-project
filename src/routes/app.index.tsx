import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { Stethoscope, LineChart, MessageCircleHeart, ArrowRight, Sparkles, CloudSun } from "lucide-react";
import clayLeaf from "@/assets/clay-leaf.png";
import clayWheat from "@/assets/clay-wheat.png";
import clayChat from "@/assets/clay-chat.png";
import { useT, StringKey } from "@/lib/i18n";

export const Route = createFileRoute("/app/")({
  component: Home,
});

const cards: { to: string; img: string; icon: any; titleKey: StringKey; descKey: StringKey }[] = [
  { to: "/app/disease", img: clayLeaf, icon: Stethoscope, titleKey: "card_disease_title", descKey: "card_disease_desc" },
  { to: "/app/yield", img: clayWheat, icon: LineChart, titleKey: "card_yield_title", descKey: "card_yield_desc" },
  { to: "/app/weather", img: clayWheat, icon: CloudSun, titleKey: "weather_title", descKey: "weather_sub" },
  { to: "/app/chat", img: clayChat, icon: MessageCircleHeart, titleKey: "card_chat_title", descKey: "card_chat_desc" },
];

function Home() {
  const { user } = useSession();
  const { t } = useT();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "farmer";
  const hour = new Date().getHours();
  const greet = hour < 12 ? t("home_greet_morning") : hour < 18 ? t("home_greet_afternoon") : t("home_greet_evening");

  return (
    <div className="space-y-10 py-6 animate-pop">
      <section className="clay-lg p-8 md:p-10 relative overflow-hidden">
        <span className="inline-flex items-center gap-2 clay-sm px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" /> {t("home_chip")}
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black mt-4">
          {greet}, <span className="text-grad-leaf capitalize">{name}</span>.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-lg">{t("home_intro")}</p>
        <img src={clayLeaf} alt="" aria-hidden className="absolute -bottom-6 -right-6 w-40 opacity-90 float" />
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(c => (
          <Link key={c.to} to={c.to} className="clay p-6 smooth hover:-translate-y-2 group">
            <img src={c.img} alt="" aria-hidden className="w-16 h-16 mb-3 float" loading="lazy" />
            <h3 className="font-display text-2xl font-bold mb-1">{t(c.titleKey)}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t(c.descKey)}</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary smooth group-hover:gap-3">
              {t("open")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
