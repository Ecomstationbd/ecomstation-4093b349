import { useEffect, useMemo, useState } from "react";
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

function Card({ r, bn }: { r: T; bn: boolean }) {
  const role = bn ? r.role_bn : r.role_en;
  const quote = bn ? r.quote_bn : r.quote_en;
  return (
    <div className="relative p-6 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-elegant transition-smooth w-[320px] md:w-[380px] shrink-0 flex flex-col">
      <Quote className="absolute top-5 right-5 h-8 w-8 text-primary/15" />
      <div className="flex gap-1 mb-3">
        {Array.from({ length: r.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-foreground/90 leading-relaxed mb-5 text-sm flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-3 border-t border-border/60">
        {r.avatar_url ? (
          <img src={r.avatar_url} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            {r.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-sm">{r.name}</div>
          {role && <div className="text-xs text-muted-foreground">{role}</div>}
        </div>
      </div>
    </div>
  );
}

function Row({ items, dir, bn }: { items: T[]; dir: "left" | "right"; bn: boolean }) {
  // duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask marquee-pause overflow-hidden">
      <div className={`marquee-track ${dir === "left" ? "marquee-left" : "marquee-right"}`}>
        {doubled.map((r, i) => (
          <Card key={`${r.id}-${i}`} r={r} bn={bn} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const { t, lang } = useLanguage();
  const bn = lang === "bn";
  const [reviews, setReviews] = useState<T[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setReviews((data as T[]) || []));
  }, []);

  const { row1, row2 } = useMemo(() => {
    if (reviews.length === 0) return { row1: [], row2: [] };
    const mid = Math.ceil(reviews.length / 2);
    return { row1: reviews.slice(0, mid), row2: reviews.slice(mid).concat(reviews.slice(0, Math.max(0, mid - (reviews.length - mid)))) };
  }, [reviews]);

  return (
    <section id="testimonials" className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">{t("test_eyebrow")}</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("test_title_1")} <span className="gradient-text">{t("test_title_2")}</span> {t("test_title_3")}
          </h2>
        </div>

        {reviews.length > 0 && (
          <div className="space-y-6">
            <Row items={row1.length ? row1 : reviews} dir="right" bn={bn} />
            <Row items={row2.length ? row2 : reviews} dir="left" bn={bn} />
          </div>
        )}
      </div>
    </section>
  );
}
