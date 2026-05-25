import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { defaultHeroStats } from "@/hooks/useSiteSettings";

const toBanglaDigits = (s: string) => s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

function CountUp({ value, bn, run }: { value: string; bn: boolean; run: boolean }) {
  // Parse leading number; keep prefix/suffix
  const match = value.match(/^([^\d]*)([\d]+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(match ? "0" : value);

  useEffect(() => {
    if (!match || !run) return;
    const target = parseFloat(match[2]);
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = target * eased;
      const isInt = !match[2].includes(".");
      setDisplay(isInt ? Math.round(v).toString() : v.toFixed(1));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  if (!match) return <>{bn ? toBanglaDigits(value) : value}</>;
  const full = `${match[1]}${display}${match[3]}`;
  return <>{bn ? toBanglaDigits(full) : full}</>;
}

type Stat = { value: string; label_bn: string; label_en: string };

export function Hero() {
  const { t, lang } = useLanguage();
  const settings = useSiteSettings();
  const bn = lang === "bn";
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  const stats: Stat[] = useMemo(() => {
    try {
      const parsed = JSON.parse(settings.hero_stats);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {}
    return defaultHeroStats;
  }, [settings.hero_stats]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setRun(true)),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative pt-24 pb-14 md:pt-32 md:pb-20 overflow-hidden">
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

          <div
            ref={ref}
            className="mt-14 grid grid-cols-2 sm:flex sm:flex-row sm:flex-nowrap sm:items-center sm:justify-around gap-6 sm:gap-6 max-w-4xl mx-auto px-1"
          >
            {stats.map((s, i) => (
              <div key={i} className="sm:flex-1 min-w-0 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text tabular-nums whitespace-nowrap">
                  <CountUp value={s.value} bn={bn} run={run} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-nowrap truncate">
                  {bn ? s.label_bn : s.label_en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
