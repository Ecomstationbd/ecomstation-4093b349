import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  color: string | null;
};

function PartnerBadge({ partner }: { partner: Partner }) {
  const content = (
    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-smooth shrink-0 h-16">
      {partner.logo_url ? (
        <img
          src={partner.logo_url}
          alt={`${partner.name} logo`}
          className="h-7 w-auto object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: partner.color || "hsl(var(--primary))" }}
        />
      )}
      <span className="text-sm font-semibold whitespace-nowrap text-foreground">
        {partner.name}
      </span>
    </div>
  );
  if (partner.link_url) {
    return (
      <a href={partner.link_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
        {content}
      </a>
    );
  }
  return content;
}

export function Partners() {
  const { lang } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("service_partners")
        .select("id,name,logo_url,link_url,color")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (mounted) setPartners((data as Partner[]) || []);
    })();
    return () => { mounted = false; };
  }, []);

  if (partners.length === 0) return null;

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
            <PartnerBadge key={`${p.id}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
