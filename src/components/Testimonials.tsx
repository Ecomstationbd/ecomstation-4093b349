import { Quote, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";

const reviews: { nKey: TranslationKey; rKey: TranslationKey; xKey: TranslationKey; rating: number }[] = [
  { nKey: "t1_n", rKey: "t1_r", xKey: "t1_x", rating: 5 },
  { nKey: "t2_n", rKey: "t2_r", xKey: "t2_x", rating: 5 },
  { nKey: "t3_n", rKey: "t3_r", xKey: "t3_x", rating: 5 },
];

export function Testimonials() {
  const { t } = useLanguage();
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
            const name = t(r.nKey);
            return (
              <div
                key={r.nKey}
                className="relative p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-elegant transition-smooth hover:-translate-y-1"
              >
                <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/15" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6">"{t(r.xKey)}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-muted-foreground">{t(r.rKey)}</div>
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
