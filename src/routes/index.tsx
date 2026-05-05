import { createFileRoute, Link } from "@tanstack/react-router";
import heroClay from "@/assets/hero-clay.jpg";
import clayLeaf from "@/assets/clay-leaf.png";
import clayWheat from "@/assets/clay-wheat.png";
import clayChat from "@/assets/clay-chat.png";
import { Sparkles, Leaf, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriVision AI — Smart Crop Disease & Yield Companion" },
      { name: "description", content: "Diagnose crop disease from a photo, predict yield, and get caring guidance for every harvest." },
      { property: "og:title", content: "AgriVision AI" },
      { property: "og:description", content: "Your warm, intelligent farming companion." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* nav */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl grad-leaf flex items-center justify-center clay-sm">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">AgriVision <span className="text-grad-leaf">AI</span></span>
        </div>
        <Link
          to="/auth"
          className="clay-sm smooth px-5 py-2.5 text-sm font-semibold hover:scale-105"
        >
          Sign in
        </Link>
      </header>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div className="space-y-7 animate-pop">
          <span className="inline-flex items-center gap-2 clay-sm px-4 py-2 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" /> AI for every farmer
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02]">
            Grow with a friend who <span className="text-grad-leaf">understands</span> your harvest.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Snap a leaf. Predict your yield. Talk to an AI that honors the long days you spend in the field.
            AgriVision AI turns hard-won experience into clearer decisions.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/auth"
              className="grad-leaf text-primary-foreground px-7 py-4 rounded-2xl font-semibold smooth hover:scale-105 glow-leaf inline-flex items-center gap-2"
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth" className="clay-sm smooth px-7 py-4 rounded-2xl font-semibold hover:scale-105">
              I already have an account
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
            <div><span className="font-display text-2xl font-bold text-foreground">98%</span><br/>Diagnosis quality</div>
            <div className="w-px h-10 bg-border" />
            <div><span className="font-display text-2xl font-bold text-foreground">3 sec</span><br/>From photo to insight</div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="hidden sm:block"><span className="font-display text-2xl font-bold text-foreground">24/7</span><br/>Kind farmer chat</div>
          </div>
        </div>

        {/* hero art */}
        <div className="relative">
          <div className="clay-lg p-3 rotate-1 smooth hover:rotate-0">
            <img src={heroClay} alt="Friendly 3D clay icons of a leaf, tractor, and corn" className="rounded-3xl w-full" width={1536} height={1152} />
          </div>
          <img src={clayLeaf} alt="" aria-hidden className="absolute -top-8 -left-8 w-24 float drop-shadow-xl" />
          <img src={clayWheat} alt="" aria-hidden className="absolute -bottom-6 -right-6 w-28 float-slow drop-shadow-xl" />
        </div>
      </section>

      {/* features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-3">Everything your field needs</h2>
        <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">Built for farmers who deserve modern tools — without the cold tech feel.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { img: clayLeaf, title: "Disease analysis", desc: "Upload a leaf photo. Get the disease, severity, and a step-by-step plan." },
            { img: clayWheat, title: "Yield prediction", desc: "Crop, area, soil, rainfall — get an honest estimate and ways to improve." },
            { img: clayChat, title: "Empathetic chat", desc: "Tired? Worried? Share it. The AI listens and offers real guidance." },
          ].map((f, i) => (
            <div key={i} className="clay p-7 smooth hover:-translate-y-2">
              <img src={f.img} alt="" aria-hidden className="w-20 h-20 mb-4 float" loading="lazy" />
              <h3 className="font-display text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center pb-10 text-sm text-muted-foreground">
        Made with care for farmers everywhere · AgriVision AI
      </footer>
    </div>
  );
}
