import { ShieldCheck, Zap, Users, MapPin, Clock, Award } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";

const items: { icon: typeof MapPin; tKey: TranslationKey; dKey: TranslationKey }[] = [
  { icon: MapPin, tKey: "w1_t", dKey: "w1_d" },
  { icon: Zap, tKey: "w2_t", dKey: "w2_d" },
  { icon: ShieldCheck, tKey: "w3_t", dKey: "w3_d" },
  { icon: Users, tKey: "w4_t", dKey: "w4_d" },
  { icon: Clock, tKey: "w5_t", dKey: "w5_d" },
  { icon: Award, tKey: "w6_t", dKey: "w6_d" },
];

export function WhyUs() {
  const { t } = useLanguage();
  return (
    <section id="why" className="py-16 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">{t("why_eyebrow")}</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {t("why_title_1")} <span className="gradient-text">{t("why_title_2")}</span> {t("why_title_3")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("why_desc")}</p>
            <div className="flex flex-wrap gap-3">
              {["Shopify Partner", "Meta Certified", "Google Ads", "WooCommerce Expert"].map((b) => (
                <span key={b} className="px-4 py-2 rounded-full border border-border bg-secondary/50 text-sm font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <div
                  key={it.tKey}
                  className="p-6 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-smooth"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t(it.tKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(it.dKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
