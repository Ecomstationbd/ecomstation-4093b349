import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import logo from "@/assets/ecomstation-logo.png";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { href: "#services", label: t("nav_services") },
    { href: "#shop", label: t("nav_shop") },
    { href: "#why", label: t("nav_why") },
    { href: "#testimonials", label: t("nav_testimonials") },
    { href: "#contact", label: t("nav_contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6">
        <a href="#" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg min-w-0 flex-1 sm:flex-initial">
          <img src={logo} alt="Ecomstation" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shadow-glow object-cover shrink-0" />
          <span className="text-foreground text-sm sm:text-xl font-bold tracking-tight truncate">ECOMSTATION</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-secondary/60"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="hero" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#contact">{t("nav_cta")}</a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-secondary text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
