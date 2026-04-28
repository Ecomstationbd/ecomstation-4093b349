import {
  Headphones, Globe, LayoutTemplate, TrendingUp, Search,
  Share2, LayoutDashboard, Package, Printer, Bot, Server,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";

const services: { icon: typeof Headphones; tKey: string; dKey: string; tag?: string }[] = [
  { icon: Headphones, tKey: "s1_t", dKey: "s1_d", tag: "Free" },
  { icon: Globe, tKey: "s2_t", dKey: "s2_d", tag: "Popular" },
  { icon: LayoutTemplate, tKey: "s3_t", dKey: "s3_d" },
  { icon: TrendingUp, tKey: "s4_t", dKey: "s4_d", tag: "Hot" },
  { icon: Search, tKey: "s5_t", dKey: "s5_d" },
  { icon: Share2, tKey: "s6_t", dKey: "s6_d" },
  { icon: LayoutDashboard, tKey: "s7_t", dKey: "s7_d", tag: "SaaS" },
  { icon: Package, tKey: "s8_t", dKey: "s8_d" },
  { icon: Printer, tKey: "s9_t", dKey: "s9_d", tag: "Shop" },
  { icon: Bot, tKey: "s10_t", dKey: "s10_d", tag: "AI" },
  { icon: Server, tKey: "s11_t", dKey: "s11_d" },
];

export function Services() {
  const { t } = useLanguage();
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
            const Icon = s.icon;
            return (
              <div
                key={s.tKey}
                className="group relative p-6 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/50 transition-smooth hover:-translate-y-1 hover:shadow-elegant overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-2xl transition-smooth" />

                {s.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider">
                    {s.tag}
                  </span>
                )}

                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-smooth">
                    {t(s.tKey as TranslationKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(s.dKey as TranslationKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
