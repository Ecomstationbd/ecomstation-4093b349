import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ContactForm } from "./ContactForm";

export function CTA() {
  const { t, lang } = useLanguage();
  const settings = useSiteSettings();
  const wa = (settings.contact_whatsapp || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}` : "#contact";
  const bn = lang === "bn";
  return (
    <section id="contact" className="py-16">
      <div className="container space-y-12">
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
              <Button variant="secondary" size="xl" className="font-semibold" asChild>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />{t("cta_whatsapp")}
                </a>
              </Button>
              <Button variant="outline-glow" size="xl" className="bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background hover:text-primary" asChild>
                <a href="#contact-form">{t("cta_consult")}<ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </div>

        <div id="contact-form">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-6">
            {bn ? "আমাদের " : "Get in "}<span className="gradient-text">{bn ? "মেসেজ পাঠান" : "Touch"}</span>
          </h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
