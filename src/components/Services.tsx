import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";

type Service = {
  id: string;
  title_bn: string;
  title_en: string;
  description_bn: string | null;
  description_en: string | null;
  icon: string | null;
  badge: string | null;
  coming_soon: boolean;
};

export function Services() {
  const { t, lang } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setServices((data as Service[]) || []));
  }, []);

  return (
    <section id="services" className="py-24 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">{t("services_eyebrow")}</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("services_title_1")} <span className="gradient-text">{t("services_title_2")}</span> {t("services_title_3")}
          </h2>
          <p className="text-muted-foreground text-lg">{t("services_desc")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const Icon = (Icons as any)[s.icon || "Sparkles"] || Icons.Sparkles;
            const title = lang === "bn" ? s.title_bn : s.title_en;
            const desc = lang === "bn" ? s.description_bn : s.description_en;
            const tag = s.coming_soon ? (lang === "bn" ? "শীঘ্রই আসছে" : "Coming Soon") : s.badge;
            return (
              <div key={s.id} className="group relative p-6 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/50 transition-smooth hover:-translate-y-1 hover:shadow-elegant overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-2xl transition-smooth" />
                {tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider">
                    {tag}
                  </span>
                )}
                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-smooth">{title}</h3>
                  {desc && <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
