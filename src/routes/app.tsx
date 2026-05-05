import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Stethoscope, LineChart, MessageCircleHeart, History, LogOut, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Home", icon: Leaf, exact: true },
  { to: "/app/disease", label: "Disease", icon: Stethoscope },
  { to: "/app/yield", label: "Yield", icon: LineChart },
  { to: "/app/chat", label: "Chat", icon: MessageCircleHeart },
  { to: "/app/history", label: "History", icon: History },
];

function AppLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <Toaster />
      {/* top bar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/app" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl grad-leaf flex items-center justify-center clay-sm">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">AgriVision <span className="text-grad-leaf">AI</span></span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-2 clay-sm p-1.5 rounded-2xl">
          {NAV.map(item => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`smooth px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 ${active ? "grad-leaf text-primary-foreground" : "hover:bg-muted"}`}>
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
            className="clay-sm smooth p-2.5 rounded-xl hover:scale-105" aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <Outlet />
      </main>

      {/* mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 clay p-2 flex justify-around z-40">
        {NAV.map(item => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to}
              className={`smooth flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${active ? "grad-leaf text-primary-foreground" : "text-muted-foreground"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
