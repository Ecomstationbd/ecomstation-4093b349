import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label="Toggle language"
      title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
      className="rounded-full hover:bg-secondary/80 gap-1 px-2 sm:px-3 font-semibold h-8 sm:h-9"
    >
      <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
      <span className="text-[11px] sm:text-xs">{lang === "bn" ? "বাং" : "EN"}</span>
    </Button>
  );
}
