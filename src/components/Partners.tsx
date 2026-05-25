import { useLanguage } from "@/i18n/LanguageProvider";

type Partner = {
  name: string;
  // simple-icons slug (https://simpleicons.org). If null, render text logo.
  slug: string | null;
  color: string;
};

const partners: Partner[] = [
  { name: "WordPress", slug: "wordpress", color: "21759B" },
  { name: "Shopify", slug: "shopify", color: "7AB55C" },
  { name: "Lovable", slug: null, color: "#FF4081" },
  { name: "Google Tag Manager", slug: "googletagmanager", color: "246FDB" },
  { name: "Microsoft Clarity", slug: null, color: "#00A4EF" },
  { name: "Meta Ads", slug: "meta", color: "0467DF" },
  { name: "TikTok Ads", slug: "tiktok", color: "000000" },
  { name: "step.io", slug: null, color: "#6366F1" },
];

function PartnerBadge({ partner }: { partner: Partner }) {
  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-smooth shrink-0 h-16">
      {partner.slug ? (
        <img
          src={`https://cdn.simpleicons.org/${partner.slug}/${partner.color}`}
          alt={`${partner.name} logo`}
          className="h-7 w-auto object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: partner.color }}
        />
      )}
      <span className="text-sm font-semibold whitespace-nowrap text-foreground">
        {partner.name}
      </span>
    </div>
  );
}

export function Partners() {
  const { lang } = useLanguage();
  const title = lang === "bn" ? "আমাদের সার্ভিস পার্টনার" : "Our Service Partner";

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
            <PartnerBadge key={`${p.name}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
