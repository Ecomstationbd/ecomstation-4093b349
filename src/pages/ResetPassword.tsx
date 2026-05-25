import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ResetPassword() {
  const nav = useNavigate();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase places the recovery session in the URL hash. Wait briefly for the
    // SDK to pick it up, then verify we have a session.
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error(bn ? "রিকভারি লিংক অবৈধ বা মেয়াদ শেষ" : "Invalid or expired recovery link");
        nav("/auth", { replace: true });
        return;
      }
      setReady(true);
    }, 400);
    return () => clearTimeout(t);
  }, [bn, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error(bn ? "৬+ অক্ষর দরকার" : "At least 6 characters"); return; }
    if (pw !== pw2) { toast.error(bn ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "পাসওয়ার্ড আপডেট হয়েছে!" : "Password updated!");
    nav("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-elegant p-8">
        <h1 className="text-2xl font-bold mb-1 gradient-text">
          {bn ? "নতুন পাসওয়ার্ড সেট করুন" : "Set a new password"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {bn ? "নতুন পাসওয়ার্ড লিখুন এবং নিশ্চিত করুন।" : "Enter your new password and confirm it."}
        </p>
        {!ready ? (
          <div className="text-sm text-muted-foreground">…</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>{bn ? "নতুন পাসওয়ার্ড" : "New password"}</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label>{bn ? "নিশ্চিত করুন" : "Confirm password"}</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={busy}>
              {busy ? "..." : bn ? "আপডেট করুন" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
