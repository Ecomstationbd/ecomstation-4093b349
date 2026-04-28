import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/ecomstation-logo.png";

const links = [
  { href: "#services", label: "সার্ভিস" },
  { href: "#shop", label: "শপ" },
  { href: "#why", label: "কেন আমরা" },
  { href: "#testimonials", label: "রিভিউ" },
  { href: "#contact", label: "যোগাযোগ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
      <nav className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold text-lg">
          <img src={logo} alt="Ecomstation" className="h-9 w-9 rounded-xl shadow-glow object-cover" />
          <span className="gradient-text text-xl tracking-tight">ECOMSTATION</span>
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="hero" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="#contact">ফ্রি কনসালটেন্সি</a>
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
