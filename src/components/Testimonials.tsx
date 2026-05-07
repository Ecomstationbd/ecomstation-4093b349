import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";

type T = {
  id: string;
  name: string;
  role_bn: string | null;
  role_en: string | null;
  quote_bn: string;
  quote_en: string;
  rating: number;
  avatar_url: string | null;
};

export function Testimonials() {
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState<T[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setReviews((data as T[]) || []));
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">{t("test_eyebrow")}</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("test_title_1")} <span className="gradient-text">{t("test_title_2")}</span> {t("test_title_3")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => {
            const role = lang === "bn" ? r.role_bn : r.role_en;
            const quote = lang === "bn" ? r.quote_bn : r.quote_en;
            return (
              <div key={r.id} className="relative p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-elegant transition-smooth hover:-translate-y-1">
                <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/15" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6">"{quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt={r.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    {role && <div className="text-sm text-muted-foreground">{role}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
