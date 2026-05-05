import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AgriVision AI" },
      { name: "description", content: "Sign in or create your AgriVision AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Welcome to AgriVision AI 🌱");
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl grad-leaf flex items-center justify-center clay-sm">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">AgriVision <span className="text-grad-leaf">AI</span></span>
        </Link>

        <div className="clay-lg p-8 animate-pop">
          <h1 className="font-display text-3xl font-bold mb-2">{mode === "signin" ? "Welcome back" : "Join the harvest"}</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {mode === "signin" ? "Sign in to continue caring for your fields." : "Create your account in seconds."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="clay-inset px-4 py-3 flex items-center gap-3">
                <Leaf className="w-4 h-4 text-primary" />
                <input
                  className="bg-transparent outline-none w-full text-sm"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="clay-inset px-4 py-3 flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@farm.com"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
            <div className="clay-inset px-4 py-3 flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary" />
              <input
                type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            <button
              disabled={loading}
              className="w-full grad-leaf text-primary-foreground py-3.5 rounded-2xl font-semibold smooth hover:scale-[1.02] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already a member?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>

        <Link to="/" className="block text-center mt-6 text-sm text-muted-foreground hover:text-foreground smooth">
          ← Back to welcome
        </Link>
      </div>
    </div>
  );
}
