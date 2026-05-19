import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
      className="rounded-full h-8 sm:h-9 px-1 gap-0 border-border/60 bg-secondary/40 hover:bg-secondary overflow-hidden"
    >
      <span
        className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-smooth ${
          lang === "en" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
        }`}
      >
        EN
      </span>
      <span
        className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-smooth ${
          lang === "bn" ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
        }`}
      >
        BN
      </span>
    </Button>
  );
}
