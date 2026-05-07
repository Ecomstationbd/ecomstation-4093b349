import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

export default function Auth() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav("/admin", { replace: true });
  }, [user, loading, nav]);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(bn ? "সঠিক ইমেইল ও পাসওয়ার্ড দিন (৬+)" : "Valid email & password (6+) required"); return; }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) toast.error(error.message);
      else toast.success(bn ? "অ্যাকাউন্ট তৈরি হয়েছে! লগইন করুন।" : "Account created! Sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin` });
    if (r.error) toast.error("Google sign in failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant p-8">
        <h1 className="text-2xl font-bold mb-1 gradient-text">{bn ? "অ্যাডমিন লগইন" : "Admin Login"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login"
            ? bn ? "অ্যাকাউন্টে সাইন ইন করুন" : "Sign in to your account"
            : bn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create a new account"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "..." : mode === "login" ? (bn ? "লগইন" : "Sign In") : (bn ? "সাইন আপ" : "Sign Up")}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-sm text-primary mt-4 hover:underline">
          {mode === "login" ? (bn ? "অ্যাকাউন্ট নেই? সাইন আপ" : "No account? Sign up") : (bn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন" : "Have an account? Sign in")}
        </button>
      </div>
    </div>
  );
}
