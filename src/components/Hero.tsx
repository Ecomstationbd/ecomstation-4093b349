import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();
  const stats = [
    { v: t("hero_num_clients"), l: t("hero_stat_clients") },
    { v: t("hero_num_pillars"), l: t("hero_stat_pillars") },
    { v: t("hero_num_support"), l: t("hero_stat_support") },
    { v: t("hero_num_satisfaction"), l: t("hero_stat_satisfaction") },
  ];
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 backdrop-blur px-4 py-1.5 text-sm font-medium mb-8 shadow-soft">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t("hero_badge")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-6">
            {t("hero_title_1")} <br className="hidden sm:block" />
            <span className="gradient-text">{t("hero_title_2")}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero_desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contact">
                {t("hero_cta_primary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline-glow" size="xl" asChild>
              <a href="#services">
                <PlayCircle className="mr-2 h-5 w-5" />
                {t("hero_cta_secondary")}
              </a>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
