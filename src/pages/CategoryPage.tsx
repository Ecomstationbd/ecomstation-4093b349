import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function CategoryPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [cat, setCat] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data: c } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      setCat(c);
      if (c) {
        const { data: p } = await supabase.from("products").select("*").eq("category_id", c.id).eq("is_active", true).order("sort_order");
        setProducts(p || []);
      }
      setLoading(false);
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!cat) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">{lang === "bn" ? "ক্যাটাগরি পাওয়া যায়নি" : "Category not found"}</h1>
        <Button asChild variant="hero"><Link to="/#shop">Back to shop</Link></Button>
      </div>
    </div>
  );

  const name = lang === "bn" ? cat.name_bn : cat.name_en;
  const desc = lang === "bn" ? cat.description_bn : cat.description_en;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <Link to="/#shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "শপে ফিরুন" : "Back to shop"}
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">{name}</span>
            </h1>
            {desc && <p className="text-muted-foreground text-lg">{desc}</p>}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">{lang === "bn" ? "এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট নেই।" : "No products in this category yet."}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 hover:-translate-y-1 hover:shadow-elegant transition-smooth">
                  <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center overflow-hidden">
                    {p.image_url ? <img src={p.image_url} alt={p.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" /> : <Package2 className="h-16 w-16 text-primary/60" />}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold mb-2 line-clamp-2">{lang === "bn" ? p.name_bn : p.name_en}</h3>
                    <div className="text-2xl font-bold gradient-text">৳{Number(p.price).toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
