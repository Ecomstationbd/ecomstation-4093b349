import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
      setService(data);
      const { data: r } = await supabase.from("services").select("*").eq("is_active", true).neq("slug", slug).order("sort_order").limit(3);
      setRelated(r || []);
      setLoading(false);
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!service) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">{lang === "bn" ? "সার্ভিস পাওয়া যায়নি" : "Service not found"}</h1>
        <Button asChild variant="hero"><Link to="/#services">Back to services</Link></Button>
      </div>
    </div>
  );

  const Icon = (Icons as any)[service.icon || "Sparkles"] || Sparkles;
  const title = lang === "bn" ? service.title_bn : service.title_en;
  const desc = lang === "bn" ? service.description_bn : service.description_en;
  const content = lang === "bn" ? service.content_bn : service.content_en;
  const features: string[] = Array.isArray(service.features) ? service.features : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-5xl">
          <Link to="/#services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "সার্ভিস তালিকায় ফিরুন" : "Back to services"}
          </Link>

          <div className="bg-gradient-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-elegant">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow shrink-0">
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                {service.badge && <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-accent text-accent-foreground uppercase mb-2">{service.badge}</span>}
                {service.coming_soon && <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-foreground uppercase mb-2 ml-2">{lang === "bn" ? "শীঘ্রই" : "Coming soon"}</span>}
                <h1 className="text-3xl md:text-4xl font-bold mb-3"><span className="gradient-text">{title}</span></h1>
                {desc && <p className="text-muted-foreground text-lg leading-relaxed">{desc}</p>}
                {service.price_text && <div className="mt-4 text-2xl font-bold text-primary">{service.price_text}</div>}
              </div>
            </div>

            {service.image_url && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-border/60">
                <img src={service.image_url} alt={title} className="w-full h-auto object-cover" />
              </div>
            )}

            {content && (
              <div className="mt-8 prose prose-invert max-w-none">
                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</div>
              </div>
            )}

            {features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">{lang === "bn" ? "যা যা পাচ্ছেন" : "What's included"}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/#contact">{lang === "bn" ? "এখনই অর্ডার করুন" : "Order now"}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/#contact">{lang === "bn" ? "যোগাযোগ করুন" : "Contact us"}</Link>
              </Button>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">{lang === "bn" ? "অন্যান্য সার্ভিস" : "Other services"}</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((s) => {
                  const RI = (Icons as any)[s.icon || "Sparkles"] || Sparkles;
                  return (
                    <Link key={s.id} to={`/service/${s.slug}`} className="group p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:-translate-y-1 transition-smooth">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-3"><RI className="h-5 w-5 text-primary-foreground" /></div>
                      <div className="font-semibold group-hover:text-primary transition-smooth">{lang === "bn" ? s.title_bn : s.title_en}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
