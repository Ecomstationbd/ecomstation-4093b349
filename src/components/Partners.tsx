import { useLanguage } from "@/i18n/LanguageProvider";

const partners = [
  { name: "WordPress", color: "#21759b" },
  { name: "Shopify", color: "#95bf47" },
  { name: "Lovable", color: "#FF4081" },
  { name: "Google Tag Manager", color: "#4285F4" },
  { name: "Microsoft Clarity", color: "#00A4EF" },
  { name: "Meta Ads", color: "#0668E1" },
  { name: "TikTok Ads", color: "#000000" },
  { name: "step.io", color: "#6366F1" },
];

function PartnerBadge({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-smooth shrink-1"
    >
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-semibold whitespace-nowrap text-foreground">
        {name}
      </span>
    </div>
  );
}

export function Partners() {
  const { t, lang } = useLanguage();
  const title = lang === "bn" ? "আমাদের সার্ভিস পার্টনার" : "Our Service Partner";

  // Duplicate for seamless loop
  const doubled = [...partners, ...partners];

  return (
    <section className="py-10 relative overflow-hidden">
      <div className="container mb-6">
        <div className="text-center">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">
            {title}
          </div>
        </div>
      </div>

      <div className="marquee-mask marquee-pause overflow-hidden">
        <div className="marquee-track marquee-left">
          {doubled.map((p, i) => (
            <PartnerBadge key={`${p.name}-${i}`} name={p.name} color={p.color} />
          ))}
        </div>
      </div>
    </section>
  );
}
