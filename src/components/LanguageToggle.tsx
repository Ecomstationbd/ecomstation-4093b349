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
      className="rounded-full hover:bg-secondary/80 gap-1.5 px-3 font-semibold"
    >
      <Languages className="h-4 w-4 text-primary" />
      <span className="text-xs">{lang === "bn" ? "EN" : "বাং"}</span>
    </Button>
  );
}
