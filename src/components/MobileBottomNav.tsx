import { Home, ShoppingCart, UserCircle2, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/i18n/LanguageProvider";

export function MobileBottomNav() {
  const { count, setOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const settings = useSiteSettings();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const location = useLocation();

  const accountHref = !user ? "/auth" : isAdmin ? "/admin" : "/dashboard";
  const waNumber = (settings.contact_whatsapp || "").replace(/\D/g, "");
  const waHref = `https://wa.me/${waNumber}`;

  const itemCls = "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium text-muted-foreground hover:text-primary transition-smooth";

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="flex items-center justify-around h-16 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-2xl shadow-elegant px-1">
        <Link to="/" className={`${itemCls} ${location.pathname === "/" ? "text-primary" : ""}`}>
          <Home className="h-5 w-5" />
          <span>{bn ? "হোম" : "Home"}</span>
        </Link>
        <button onClick={() => setOpen(true)} className={`${itemCls} relative`}>
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-gradient-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <span>{bn ? "কার্ট" : "Cart"}</span>
        </button>
        <Link to={accountHref} className={itemCls}>
          <UserCircle2 className="h-5 w-5" />
          <span>{bn ? "একাউন্ট" : "Account"}</span>
        </Link>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className={itemCls}>
          <MessageCircle className="h-5 w-5 text-green-500" />
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
