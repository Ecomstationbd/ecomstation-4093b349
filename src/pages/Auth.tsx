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

const phoneSchema = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use international format e.g. +8801XXXXXXXXX");

export default function Auth() {
  const { user, loading, isAdmin } = useAuth();
  const nav = useNavigate();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const redirectFor = (admin: boolean) => (admin ? "/admin" : "/dashboard");

  useEffect(() => {
    if (!loading && user) nav(redirectFor(isAdmin), { replace: true });
  }, [user, loading, isAdmin, nav]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-hero" />;
  if (user) return <Navigate to={redirectFor(isAdmin)} replace />;


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      const okEmail = z.string().email().max(255).safeParse(email).success;
      if (!okEmail) { toast.error(bn ? "সঠিক ইমেইল দিন" : "Enter a valid email"); return; }
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) toast.error(error.message);
      else toast.success(bn ? "রিসেট লিংক পাঠানো হয়েছে। ইমেইল চেক করুন।" : "Reset link sent. Check your inbox.");
      return;
    }

    if (method === "phone") {
      const okPhone = phoneSchema.safeParse(phone);
      if (!okPhone.success) { toast.error(bn ? "সঠিক ফোন নম্বর দিন (e.g. +8801XXXXXXXXX)" : okPhone.error.issues[0].message); return; }
      setBusy(true);
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: { shouldCreateUser: mode === "signup" },
        });
        setBusy(false);
        if (error) toast.error(error.message);
        else { setOtpSent(true); toast.success(bn ? "OTP পাঠানো হয়েছে" : "OTP sent to your phone"); }
      } else {
        if (otp.length < 4) { setBusy(false); toast.error(bn ? "OTP দিন" : "Enter OTP"); return; }
        const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
        setBusy(false);
        if (error) toast.error(error.message);
      }
      return;
    }

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(bn ? "সঠিক ইমেইল ও পাসওয়ার্ড দিন (৬+)" : "Valid email & password (6+) required"); return; }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) toast.error(error.message);
      else {
        toast.success(bn ? "অ্যাকাউন্ট তৈরি হয়েছে!" : "Account created!");
        if (!data.session) {
          await supabase.auth.signInWithPassword({ email, password });
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (r.error) toast.error("Google sign in failed");
  };

  const title =
    mode === "login" ? (bn ? "লগইন" : "Login")
    : mode === "signup" ? (bn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account")
    : (bn ? "পাসওয়ার্ড রিসেট" : "Reset Password");
  const subtitle =
    mode === "login" ? (bn ? "আপনার অ্যাকাউন্টে সাইন ইন করুন" : "Sign in to your account")
    : mode === "signup" ? (bn ? "নতুন কাস্টমার অ্যাকাউন্ট তৈরি করুন" : "Create a new customer account")
    : (bn ? "আপনার ইমেইলে রিসেট লিংক পাঠানো হবে" : "We'll email you a reset link");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant p-8">
        <h1 className="text-2xl font-bold mb-1 gradient-text">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                {mode === "login" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                    {bn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                  </button>
                )}
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "..."
              : mode === "login" ? (bn ? "লগইন" : "Sign In")
              : mode === "signup" ? (bn ? "সাইন আপ" : "Sign Up")
              : (bn ? "রিসেট লিংক পাঠান" : "Send reset link")}
          </Button>
        </form>
        {mode !== "forgot" && (
          <>
            <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
            </div>
            <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
          </>
        )}
        <div className="mt-4 text-center">
          {mode === "forgot" ? (
            <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline">
              {bn ? "← লগইনে ফিরে যান" : "← Back to sign in"}
            </button>
          ) : (
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm text-primary hover:underline">
              {mode === "login" ? (bn ? "অ্যাকাউন্ট নেই? সাইন আপ" : "No account? Sign up") : (bn ? "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন" : "Have an account? Sign in")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
