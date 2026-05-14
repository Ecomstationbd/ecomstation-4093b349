import { useEffect, useState } from "react";
import { ShoppingCart, Package2, FileCode2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

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
};

export function Shop() {
  const [tab, setTab] = useState<"all" | "physical" | "digital">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const { t, lang } = useLanguage();
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setProducts((data as Product[]) || []));
  }, []);

  const filtered = products.filter((p) => tab === "all" || p.category === tab);

  return (
    <section id="shop" className="py-24 relative bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">{t("shop_eyebrow")}</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("shop_title_1")}</span> {t("shop_title_2")}
          </h2>
          <p className="text-muted-foreground text-lg">{t("shop_desc")}</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full bg-background border border-border shadow-soft">
            {[
              { k: "all", l: t("shop_tab_all") },
              { k: "physical", l: t("shop_tab_physical") },
              { k: "digital", l: t("shop_tab_digital") },
            ].map((tt) => (
              <button key={tt.k} onClick={() => setTab(tt.k as typeof tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-smooth ${tab === tt.k ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>
                {tt.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => {
            const Icon = p.category === "physical" ? Package2 : FileCode2;
            const name = lang === "bn" ? p.name_bn : p.name_en;
            return (
              <div key={p.id} className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-elegant transition-smooth hover:-translate-y-1">
                <Link to={`/product/${p.slug}`} className="block">
                  <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center relative overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={name} className="h-full w-full object-cover group-hover:scale-105 transition-smooth" />
                    ) : (
                      <Icon className="h-20 w-20 text-primary/70 group-hover:scale-110 transition-smooth" />
                    )}
                    {p.badge && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider shadow-soft">{p.badge}</span>
                    )}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full bg-background/80 backdrop-blur text-muted-foreground uppercase">
                      {p.category === "physical" ? t("shop_label_physical") : t("shop_label_digital")}
                    </span>
                  </div>
                </Link>
                <div className="p-5">
                  <Link to={`/product/${p.slug}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] hover:text-primary transition-smooth">{name}</h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold gradient-text">৳{Number(p.price).toLocaleString()}</span>
                    {p.old_price && <span className="text-sm text-muted-foreground line-through">৳{Number(p.old_price).toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" size="sm" className="flex-1" onClick={() => { add({ id: p.id, name, price: Number(p.price) }); toast.success(t("shop_added")); }}>
                      <ShoppingCart className="mr-1 h-4 w-4" /> {t("shop_add")}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/product/${p.slug}`}>{lang === "bn" ? "ডিটেইলস" : "Details"}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
