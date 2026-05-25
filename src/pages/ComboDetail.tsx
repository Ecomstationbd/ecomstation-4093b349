import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Package2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function ComboDetail() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const { add, setOpen } = useCart();
  const [combo, setCombo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: c } = await supabase.from("combos").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      setCombo(c);
      if (c) {
        const { data: items } = await supabase.from("combo_items").select("*").eq("combo_id", c.id).order("sort_order");
        const ids = (items || []).map((i: any) => i.product_id);
        if (ids.length) {
          const { data: prods } = await supabase.from("products").select("*").in("id", ids);
          const merged = (items || []).map((it: any) => ({ ...it, product: (prods || []).find((p: any) => p.id === it.product_id) }));
          setProducts(merged);
        }
      }
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!combo) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">{lang === "bn" ? "কম্বো পাওয়া যায়নি" : "Combo not found"}</h1>
        <Button asChild variant="hero"><Link to="/">{lang === "bn" ? "হোমে ফিরুন" : "Back home"}</Link></Button>
      </div>
    </div>
  );

  const name = lang === "bn" ? combo.name_bn : combo.name_en;
  const desc = lang === "bn" ? combo.description_bn : combo.description_en;
  const itemsTotal = products.reduce((s, it) => s + (it.product ? Number(it.product.price) * it.quantity : 0), 0);
  const savings = itemsTotal - Number(combo.price);

  const addToCart = () => {
    const hasPhysical = products.some((it) => it.product?.is_physical !== false);
    for (let i = 0; i < qty; i++) add({ id: `combo::${combo.id}`, name: `[Combo] ${name}`, price: Number(combo.price), is_physical: hasPhysical });
    toast.success(t("shop_added"));
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "ফিরে যান" : "Back"}
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-hero border border-border/60 flex items-center justify-center">
              {combo.image_url ? <img src={combo.image_url} alt={name} className="w-full h-full object-cover" /> : <Package2 className="h-32 w-32 text-primary/60" />}
            </div>

            <div className="space-y-5">
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-gradient-accent text-accent-foreground">COMBO</Badge>
                {combo.badge && <Badge variant="secondary">{combo.badge}</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-bold gradient-text">৳{Number(combo.price).toLocaleString()}</span>
                {combo.old_price && <span className="text-lg text-muted-foreground line-through">৳{Number(combo.old_price).toLocaleString()}</span>}
                {savings > 0 && <Badge className="bg-primary text-primary-foreground">Save ৳{savings.toLocaleString()}</Badge>}
              </div>
              {desc && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{desc}</p>}

              <div className="border border-border/60 rounded-xl p-4 space-y-2">
                <div className="font-semibold text-sm">{lang === "bn" ? "এই কম্বোতে যা আছে" : "What's included"}</div>
                {products.map((it, i) => it.product && (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <div className="h-10 w-10 rounded bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                      {it.product.image_url ? <img src={it.product.image_url} alt="" className="h-full w-full object-cover" /> : <Package2 className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{lang === "bn" ? it.product.name_bn : it.product.name_en}</div>
                      <div className="text-xs text-muted-foreground">Qty: {it.quantity} × ৳{Number(it.product.price).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary">−</button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 hover:bg-secondary">+</button>
                </div>
                <Button variant="hero" size="lg" className="flex-1" onClick={addToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> {t("shop_add")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
