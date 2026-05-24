import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package2, FileCode2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

type Product = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  price: number;
  old_price: number | null;
  category: "physical" | "digital";
  badge: string | null;
  image_url: string | null;
  is_physical?: boolean;
};

function ProductCard({ p }: { p: Product }) {
  const { lang, t } = useLanguage();
  const { add } = useCart();
  const Icon = p.category === "physical" ? Package2 : FileCode2;
  const name = lang === "bn" ? p.name_bn : p.name_en;
  return (
    <div className="group relative bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-elegant transition-smooth hover:-translate-y-1 h-full flex flex-col">
      <Link to={`/product/${p.slug}`} className="block">
        <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center relative overflow-hidden">
          {p.image_url ? (
            <img src={p.image_url} alt={name} className="h-full w-full object-cover group-hover:scale-105 transition-smooth" />
          ) : (
            <Icon className="h-10 w-10 text-primary/70 group-hover:scale-110 transition-smooth" />
          )}
          {p.badge && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider shadow-soft">{p.badge}</span>
          )}
          <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur text-muted-foreground uppercase">
            {p.category === "physical" ? t("shop_label_physical") : t("shop_label_digital")}
          </span>
        </div>
      </Link>
      <div className="p-2.5 flex flex-col flex-1">
        <Link to={`/product/${p.slug}`}>
          <h3 className="font-semibold mb-1 line-clamp-2 min-h-[2rem] text-xs hover:text-primary transition-smooth">{name}</h3>
        </Link>
        <div className="flex items-baseline justify-center gap-1.5 mb-2">
          <span className="text-base font-bold gradient-text">৳{Number(p.price).toLocaleString()}</span>
          {p.old_price && <span className="text-[10px] text-muted-foreground line-through">৳{Number(p.old_price).toLocaleString()}</span>}
        </div>
        <div className="flex flex-col items-center gap-1.5 mt-auto w-full">
          <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
            <Link to={`/product/${p.slug}`}>{lang === "bn" ? "ডিটেইলস" : "Details"}</Link>
          </Button>
          <Button variant="hero" size="sm" className="w-full text-xs h-8" onClick={() => { add({ id: p.id, name, price: Number(p.price), is_physical: p.is_physical !== false }); toast.success(t("shop_added")); }}>
            <ShoppingCart className="mr-1 h-3 w-3" /> {t("shop_add")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase.from("products").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  const physical = products.filter((p) => p.category === "physical");
  const digital = products.filter((p) => p.category === "digital");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "হোমে ফিরুন" : "Back to home"}
          </Link>


          {loading ? (
            <div className="flex items-center justify-center py-20">Loading…</div>
          ) : (
            <>
              {/* Physical Products */}
              {physical.length > 0 && (
                <div className="mb-16">
                  <div className="flex flex-col items-center text-center gap-2 mb-8">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{t("shop_label_physical")} {lang === "bn" ? "প্রোডাক্ট" : "Products"}</h2>
                      <p className="text-xs text-muted-foreground">{lang === "bn" ? "ফিজিক্যাল প্যাকেজিং ও সরঞ্জাম" : "Physical packaging & equipment"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {physical.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Products */}
              {digital.length > 0 && (
                <div>
                  <div className="flex flex-col items-center text-center gap-2 mb-8">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileCode2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{t("shop_label_digital")} {lang === "bn" ? "প্রোডাক্ট" : "Products"}</h2>
                      <p className="text-xs text-muted-foreground">{lang === "bn" ? "ডিজিটাল অ্যাসেট, স্ক্রিপ্ট ও টেমপ্লেট" : "Digital assets, scripts & templates"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {digital.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  {lang === "bn" ? "এখনো কোনো প্রোডাক্ট নেই।" : "No products available yet."}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
