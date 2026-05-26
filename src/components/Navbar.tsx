import { useEffect, useState } from "react";
import { Menu, X, ShoppingCart, ShieldCheck, LayoutDashboard, UserCircle2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMenuItems, type PublicMenuItem } from "@/hooks/useMenuItems";
import defaultLogo from "@/assets/ecomstation-logo.png";

type NavLink = { href: string; label: string; external: boolean; children?: NavLink[] };

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpenIdx, setMobileOpenIdx] = useState<number | null>(null);
  const { t, lang } = useLanguage();
  const { count, setOpen: setCartOpen } = useCart();
  const { isAdmin, user } = useAuth();
  const settings = useSiteSettings();
  const { items: menuItems, loaded } = useMenuItems();

  const fallbackLinks: NavLink[] = [
    { href: "/#services", label: t("nav_services"), external: false },
    { href: "/#shop", label: t("nav_shop"), external: false },
    { href: "/blog", label: t("nav_blog"), external: false },
    { href: "/#why", label: t("nav_why"), external: false },
    { href: "/#testimonials", label: t("nav_testimonials"), external: false },
    { href: "/#contact", label: t("nav_contact"), external: false },
  ];

  const toLink = (m: PublicMenuItem): NavLink => ({
    href: m.href,
    label: lang === "bn" ? m.label_bn : m.label_en,
    external: m.open_in_new_tab,
    children: m.children && m.children.length > 0 ? m.children.map(toLink) : undefined,
  });

  const links: NavLink[] = loaded && menuItems.length > 0 ? menuItems.map(toLink) : fallbackLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkAnchorProps = (l: NavLink) => ({
    href: l.href,
    target: l.external ? "_blank" : undefined,
    rel: l.external ? "noopener noreferrer" : undefined,
  });

  return (
    <header className="fixed top-3 left-3 right-3 sm:top-4 sm:left-6 sm:right-6 z-50 transition-smooth">
      <nav className={`container flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 rounded-2xl border backdrop-blur-2xl transition-smooth ${scrolled ? "bg-background/70 border-border/60 shadow-elegant" : "bg-background/40 border-border/30 shadow-soft"}`}>
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg min-w-0 flex-1 sm:flex-initial">
          <img src={settings.logo_url || defaultLogo} alt={settings.brand_name} className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shadow-glow object-cover shrink-0" />
          <span className="text-foreground text-sm sm:text-xl font-bold tracking-tight truncate">{settings.brand_name}</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l, i) => {
            const hasChildren = !!l.children?.length;
            if (!hasChildren) {
              return (
                <a key={`${l.href}-${i}`} {...linkAnchorProps(l)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-secondary/60">
                  {l.label}
                </a>
              );
            }
            return (
              <div key={`${l.href}-${i}`} className="relative group">
                <a {...linkAnchorProps(l)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-secondary/60 inline-flex items-center gap-1">
                  {l.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </a>
                <div className="absolute left-0 top-full pt-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-2xl shadow-elegant p-1.5">
                    {l.children!.map((c, j) => (
                      <a key={`${c.href}-${j}`} {...linkAnchorProps(c)} className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-smooth">
                        {c.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="relative hidden md:inline-flex" onClick={() => setCartOpen(true)} aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
          <LanguageToggle />
          <ThemeToggle />
          {isAdmin && (
            <Button variant="ghost" size="icon" asChild aria-label="Admin" className="hidden md:inline-flex">
              <Link to="/admin"><ShieldCheck className="h-5 w-5 text-primary" /></Link>
            </Button>
          )}
          {user && !isAdmin && (
            <Button variant="ghost" size="icon" asChild aria-label="Dashboard" className="hidden md:inline-flex">
              <Link to="/dashboard"><LayoutDashboard className="h-5 w-5 text-primary" /></Link>
            </Button>
          )}
          {!user && (
            <Button variant="ghost" size="icon" asChild aria-label="Login" className="hidden md:inline-flex">
              <Link to="/auth"><UserCircle2 className="h-5 w-5 text-primary" /></Link>
            </Button>
          )}
          <Button variant="hero" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#contact">{t("nav_cta")}</a>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-border/40 bg-background/70 backdrop-blur-2xl shadow-elegant">
          <div className="py-3 px-2 flex flex-col gap-1">
            {links.map((l, i) => {
              const hasChildren = !!l.children?.length;
              if (!hasChildren) {
                return (
                  <a key={`${l.href}-${i}`} {...linkAnchorProps(l)} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg hover:bg-secondary text-foreground">
                    {l.label}
                  </a>
                );
              }
              const expanded = mobileOpenIdx === i;
              return (
                <div key={`${l.href}-${i}`}>
                  <button
                    onClick={() => setMobileOpenIdx(expanded ? null : i)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary text-foreground"
                  >
                    <span>{l.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="pl-3 flex flex-col gap-1">
                      {l.children!.map((c, j) => (
                        <a key={`${c.href}-${j}`} {...linkAnchorProps(c)} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground text-sm">
                          {c.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
