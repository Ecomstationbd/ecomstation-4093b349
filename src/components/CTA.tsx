import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

export function CTA() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center shadow-elegant">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-glow/40 blur-3xl animate-glow-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/40 blur-3xl animate-glow-pulse" />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              {t("cta_title")}
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">{t("cta_desc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="xl" className="font-semibold">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("cta_whatsapp")}
              </Button>
              <Button variant="outline-glow" size="xl" className="bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background hover:text-primary">
                {t("cta_consult")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
