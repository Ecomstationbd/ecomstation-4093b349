import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import logo from "@/assets/ecomstation-logo.png";

export function Footer() {
  const { t, lang } = useLanguage();
  const phone = lang === "bn" ? "+৮৮০ ১৭০০-০০০০০০" : "+880 1700-000000";
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="#" className="flex items-center gap-2 font-bold text-lg mb-4">
              <img src={logo} alt="Ecomstation" className="h-9 w-9 rounded-xl shadow-glow object-cover" />
              <span className="gradient-text text-xl tracking-tight">ECOMSTATION</span>
            </a>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">{t("footer_tagline")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("footer_about")}</p>
            <div className="flex gap-2">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer_h_services")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-primary transition-smooth">{t("footer_l_ecom")}</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">{t("footer_l_marketing")}</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">{t("footer_l_seo")}</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">{t("footer_l_ai")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer_h_company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#why" className="hover:text-primary transition-smooth">{t("footer_l_about")}</a></li>
              <li><a href="#testimonials" className="hover:text-primary transition-smooth">{t("footer_l_reviews")}</a></li>
              <li><a href="#shop" className="hover:text-primary transition-smooth">{t("footer_l_shop")}</a></li>
              <li><a href="#contact" className="hover:text-primary transition-smooth">{t("footer_l_contact")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer_h_contact")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> hello@ecomstation.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t("footer_address")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ecomstation. {t("footer_rights")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-smooth">{t("footer_privacy")}</a>
            <a href="#" className="hover:text-primary transition-smooth">{t("footer_terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
