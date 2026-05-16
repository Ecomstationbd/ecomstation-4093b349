import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(300).optional(),
  message: z.string().trim().min(1).max(5000),
});

export function ContactForm() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const bn = lang === "bn";
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(bn ? "সঠিক তথ্য দিন" : "Please fill required fields"); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মেসেজ পাঠানো হয়েছে!" : "Message sent!");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-xl mx-auto bg-card p-6 rounded-2xl border border-border shadow-soft">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>{bn ? "নাম *" : "Name *"}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} /></div>
        <div><Label>{bn ? "ফোন" : "Phone"}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>{bn ? "ইমেইল" : "Email"}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} /></div>
        <div><Label>{bn ? "বিষয়" : "Subject"}</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={300} /></div>
      </div>
      <div><Label>{bn ? "মেসেজ *" : "Message *"}</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={5000} /></div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? "..." : bn ? "মেসেজ পাঠান" : "Send Message"}
      </Button>
    </form>
  );
}
